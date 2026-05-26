import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

async function getAuthUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return null;
    const decoded = jwt.verify(token, process.env.SECRET_KEY!) as {
      id: string;
      role: string;
      type?: string;
      agentId?: string;
    };
    // ✅ subuser support
    const userId = decoded.type === "subuser" ? decoded.agentId! : decoded.id;
    return { ...decoded, userId };
  } catch {
    return null;
  }
}

function getTier(totalBookings: number): "bronze" | "silver" | "gold" | "platinum" {
  if (totalBookings >= 100) return "platinum";
  if (totalBookings >= 50) return "gold";
  if (totalBookings >= 20) return "silver";
  return "bronze";
}

const MANUAL_CREDIT_TYPES = ["refund", "acm", "amount_add"];
const MANUAL_DEBIT_TYPES = ["manual_booking", "adm", "amount_deduct", "date_change"];

const manualTypeLabels: Record<string, string> = {
  refund: "Ticket Refund",
  acm: "Agency Credit Memo",
  adm: "Agency Debit Memo",
  manual_booking: "Manual Booking",
  amount_deduct: "Amount Deduction",
  date_change: "Date Change",
  add_credit: "Credit Limit Added",
  limit_add: "Credit Limit Adjusted",
  amount_add: "Amount Added",
};

export async function GET() {
  try {
    const auth = await getAuthUser();
    if (!auth) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = auth.userId;

    // Date ranges
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const yearAgo = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);

    const [
      user,
      totalBookings,
      todayBookings,
      weekBookings,
      monthBookings,
      yearBookings,
      confirmedBookings,
      pendingBookings,
      cancelledBookings,
      revenueData,
      recentBookings,
      recentDeposits,
      recentManualOps,
      // ✅ balance sources
      successDeposits,
      refundedDeposits,
      manualOpsForBalance,
    ] = await Promise.all([
      // User
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          agentName: true,
          agentId: true,
          aviationNumber: true,
          role: true,
          balance: true,
          creditLimit: true,
          usedLimit: true,
          tier: true,
          verified: true,
          createdAt: true,
        },
      }),

      // Booking counts
      prisma.booking.count({ where: { agentId: userId } }),
      prisma.booking.count({ where: { agentId: userId, createdAt: { gte: today } } }),
      prisma.booking.count({ where: { agentId: userId, createdAt: { gte: weekAgo } } }),
      prisma.booking.count({ where: { agentId: userId, createdAt: { gte: monthAgo } } }),
      prisma.booking.count({ where: { agentId: userId, createdAt: { gte: yearAgo } } }),
      prisma.booking.count({ where: { agentId: userId, status: "CONFIRMED" } }),
      prisma.booking.count({ where: { agentId: userId, status: "ON_HOLD" } }),
      prisma.booking.count({ where: { agentId: userId, status: "CANCELLED" } }),

      // Revenue
      prisma.booking.aggregate({
        where: {
          agentId: userId,
          status: { in: ["CONFIRMED", "ON_HOLD"] },
        },
        _sum: { gross: true, net: true },
      }),

      // Recent bookings
      prisma.booking.findMany({
        where: { agentId: userId },
        include: {
          passengers: { take: 1 },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),

      // Recent deposits
      prisma.deposit.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),

      // Recent manual operations
      prisma.manualOperation.findMany({
        where: { userId, status: "COMPLETED" },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),

      // ✅ Balance: successful deposits
      prisma.deposit.aggregate({
        where: { userId, status: "SUCCESS" },
        _sum: { amount: true },
      }),

      // ✅ Balance: refunded deposits
      prisma.deposit.aggregate({
        where: { userId, status: "REFUNDED" },
        _sum: { amount: true },
      }),

      // ✅ Balance: manual operations
      prisma.manualOperation.findMany({
        where: {
          userId,
          status: "COMPLETED",
          type: { in: [...MANUAL_CREDIT_TYPES, ...MANUAL_DEBIT_TYPES] },
        },
        select: { type: true, amount: true },
      }),
    ]);

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // ✅ Compute balance from transactions
    const totalDeposited = Number(successDeposits._sum.amount || 0);
    const totalDepositRefunded = Number(refundedDeposits._sum.amount || 0);

    let manualCredit = 0;
    let manualDebit = 0;
    for (const op of manualOpsForBalance) {
      const amount = Number(op.amount || 0);
      if (MANUAL_CREDIT_TYPES.includes(op.type)) manualCredit += amount;
      if (MANUAL_DEBIT_TYPES.includes(op.type)) manualDebit += amount;
    }

   // ✅ Total bookings deducted
const totalBookingAmount = await prisma.booking.aggregate({
  where: {
    agentId: userId,
    status: { notIn: ["CANCELLED", "VOIDED", "REFUNDED"] },
  },
  _sum: { net: true },
});
const totalBooked = Number(totalBookingAmount._sum.net || 0);

// ✅ Final computed balance = deposits - refunds + manual credits - manual debits - bookings
  const computedBalance =
  totalDeposited - totalDepositRefunded + manualCredit - manualDebit - totalBooked;

    // ✅ Stored balance
    const storedBalance = Number(user.balance || 0);

    // ✅ Use computed if stored is 0 or stale
    // ✅ Always use stored balance — it's the source of truth
const finalBalance = storedBalance;

    // ✅ No auto sync — DB balance is source of truth
// Balance is managed by booking and deposit routes only
if (storedBalance !== computedBalance) {
  console.warn("⚠️ Balance mismatch detected", {
    userId,
    storedBalance,
    computedBalance,
    diff: storedBalance - computedBalance,
  });
}
    const creditLimit = Number(user.creditLimit || 0);
    const usedLimit = Number(user.usedLimit || 0);
    const availableCredit = Math.max(0, creditLimit - usedLimit);
    const totalAvailable = finalBalance + availableCredit;

    // Revenue
    const totalSales = Number(revenueData._sum.gross || 0);
    const totalNet = Number(revenueData._sum.net || 0);
    const totalCommission = totalSales - totalNet;

    return NextResponse.json({
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        agentId: user.agentId,
        agencyName: user.agentName,
        memberSince: new Date(user.createdAt).toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        }),
        tier: user.tier?.toLowerCase() || getTier(totalBookings),
        verified: user.verified,
      },

      stats: {
        totalBookings,
        todayBookings,
        weekBookings,
        monthBookings,
        yearBookings,
        totalSales,
        totalCommission,

        // ✅ Balance fields — all consistent
        currentBalance: finalBalance,
        balance: finalBalance,
        availableBalance: finalBalance,
        walletBalance: finalBalance,

        // ✅ Credit fields
        creditLimit,
        usedLimit,
        usedCredit: usedLimit,
        availableCredit,
        remainingCredit: availableCredit,
        totalAvailable,

        // ✅ Debug fields
        computedBalance,
        storedBalance,
        totalDeposited,
      },

      statusCounts: {
        confirmed: confirmedBookings,
        pending: pendingBookings,
        cancelled: cancelledBookings,
      },

      recentBookings: recentBookings.map((booking) => ({
        id: booking.id,
        pnr: booking.pnr,
        bookingId: booking.bookingId,
        passenger: booking.passengers[0]
          ? `${booking.passengers[0].firstName} ${booking.passengers[0].lastName}`
          : "N/A",
        route: booking.route,
        date: booking.departureDate,
        amount: booking.gross,
        status: booking.status.toLowerCase(),
        airline: booking.carrier,
      })),

      recentPayments: [
        ...recentDeposits.map((deposit) => ({
          id: deposit.id,
          type: deposit.method.toLowerCase(),
          description: `Deposit via ${deposit.method}`,
          amount: Number(deposit.amount),
          date: deposit.createdAt,
          status: deposit.status.toLowerCase(),
          source: "deposit",
          isCredit: deposit.status === "SUCCESS",
        })),
        ...recentManualOps.map((op) => ({
          id: op.id,
          type: op.type,
          description: `${manualTypeLabels[op.type] || op.type}${op.pnr ? ` - PNR: ${op.pnr}` : ""}`,
          amount: Number(op.amount),
          date: op.createdAt,
          status: op.status.toLowerCase(),
          source: "manual_operation",
          isCredit: MANUAL_CREDIT_TYPES.includes(op.type),
        })),
      ]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5),
    });
  } catch (err: any) {
    console.error("Dashboard API Error:", err);
    return NextResponse.json(
      { message: "Internal server error", error: err.message },
      { status: 500 }
    );
  }
}