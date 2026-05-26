import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

// ==========================================
// Auth Helper
// ==========================================
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

    // ✅ subuser হলে parent agent এর ledger দেখাবে
    const userId = decoded.type === "subuser" ? decoded.agentId! : decoded.id;

    return { ...decoded, userId };
  } catch {
    return null;
  }
}

// ==========================================
// Helpers
// ==========================================
function stableRef(prefix: string, value?: string | null, fallbackId?: string) {
  if (value && value.trim()) return value;
  const shortId = (fallbackId || "").replace(/-/g, "").slice(-6).toUpperCase();
  return `${prefix}-${shortId || "000000"}`;
}

// ==========================================
// Booking → Ledger Entry
// ==========================================
function bookingToLedgerEntry(booking: any) {
  const origin =
    booking.segments?.[0]?.from ||
    booking.route?.split("-")[0]?.trim() ||
    "";

  const destination =
    booking.segments?.[booking.segments.length - 1]?.to ||
    booking.route?.split("-").pop()?.trim() ||
    "";

  const passengerName = booking.passengers?.[0]
    ? `${booking.passengers[0].firstName} ${booking.passengers[0].lastName}`
    : "Passenger";

  let type = "TICKET";
  let debit = 0;
  let credit = 0;
  let status = "completed";

  switch (booking.status) {
    case "CONFIRMED":
      type = "TICKET";
      debit = Number(booking.net) || 0;
      status = "completed";
      break;

    case "ON_HOLD":
      type = "ON_HOLD";
      debit = Number(booking.net) || 0;
      status = "on_hold";
      break;

    case "CANCELLED":
      type = "CANCELLED";
      credit = Number(booking.net) || 0;
      status = "cancelled";
      break;

    case "VOIDED":
      type = "VOID";
      credit = Number(booking.net) || 0;
      status = "voided";
      break;

    case "REFUNDED":
      type = "REFUNDED";
      credit = Number(booking.net) || 0;
      status = "refunded";
      break;

    default:
      type = "TICKET";
      debit = Number(booking.net) || 0;
      status = "completed";
  }

  return {
    id: booking.id,
    date: booking.bookingDate.toISOString(),
    invoice: stableRef("INV", booking.bookingId, booking.id),
    booking: booking.bookingId || "",
    spnr: booking.pnr || "",
    apnr: booking.pnr || "",
    flight: booking.departureDate?.toISOString() || "",
    desc: `${passengerName} - ${origin} → ${destination}`,
    type,
    debit,
    credit,
    currency: booking.currency || "SAR",
    created: booking.agent?.agentName || "System",
    status,
    source: "booking",
  };
}

// ==========================================
// Deposit → Ledger Entry
// ==========================================
function depositToLedgerEntry(deposit: any) {
  const methodLabels: Record<string, string> = {
    CASH: "Cash Deposit",
    CARD: "Card Payment",
    BANK_TRANSFER: "Bank Transfer",
    MOBILE_BANKING: "Mobile Banking",
    MANUAL: "Manual Deposit",
  };

  let type = "DEPOSIT";
  let status = "completed";
  let credit = 0;
  let debit = 0;

  switch (deposit.status) {
    case "SUCCESS":
      type = "DEPOSIT";
      credit = Number(deposit.amount) || 0;
      status = "completed";
      break;

    case "PENDING":
      type = "DEPOSIT_PENDING";
      status = "pending";
      break;

    case "FAILED":
      type = "DEPOSIT_FAILED";
      status = "failed";
      break;

    case "REFUNDED":
      type = "DEPOSIT_REFUNDED";
      debit = Number(deposit.amount) || 0;
      status = "refunded";
      break;

    default:
      type = "DEPOSIT";
      credit = Number(deposit.amount) || 0;
      status = "completed";
  }

  return {
    id: deposit.id,
    date: deposit.createdAt.toISOString(),
    invoice: stableRef("DEP", deposit.reference, deposit.id),
    booking: "",
    spnr: "",
    apnr: deposit.reference || "",
    flight: "",
    desc: `${methodLabels[deposit.method] || "Deposit"} - ${deposit.notes || "Account Top-up"}`,
    type,
    debit,
    credit,
    currency: deposit.currency || "SAR",
    created: deposit.approvedBy || "System",
    status,
    source: "deposit",
  };
}

// ==========================================
// ManualOperation → Ledger Entry
// ==========================================
function manualOpToLedgerEntry(op: any) {
  const typeConfig: Record<
    string,
    { label: string; type: string; isCredit: boolean; affectsBalance: boolean }
  > = {
    refund: {
      label: "Ticket Refund",
      type: "REFUND",
      isCredit: true,
      affectsBalance: true,
    },
    acm: {
      label: "Agency Credit Memo",
      type: "ACM",
      isCredit: true,
      affectsBalance: true,
    },
    manual_booking: {
      label: "Manual Booking",
      type: "MANUAL_BOOKING",
      isCredit: false,
      affectsBalance: true,
    },
    adm: {
      label: "Agency Debit Memo",
      type: "ADM",
      isCredit: false,
      affectsBalance: true,
    },
    amount_deduct: {
      label: "Amount Deduction",
      type: "DEDUCTION",
      isCredit: false,
      affectsBalance: true,
    },
    date_change: {
      label: "Date Change Charge",
      type: "DATE_CHANGE",
      isCredit: false,
      affectsBalance: true,
    },
    add_credit: {
      label: "Credit Limit Added",
      type: "CREDIT_LIMIT_ADD",
      isCredit: false,
      affectsBalance: false,
    },
    limit_add: {
      label: "Credit Limit Adjusted",
      type: "LIMIT_ADJUST",
      isCredit: false,
      affectsBalance: false,
    },
    amount_add: {
      label: "Amount Added",
      type: "AMOUNT_ADD",
      isCredit: true,
      affectsBalance: true,
    },
  };

  const config = typeConfig[op.type] || {
    label: op.type,
    type: op.type.toUpperCase(),
    isCredit: false,
    affectsBalance: true,
  };

  let desc = config.label;
  if (op.pnr) desc += ` - PNR: ${op.pnr}`;
  if (op.passengerName) desc += ` | ${op.passengerName}`;
  if (op.route) desc += ` | ${op.route}`;
  if (!op.pnr && op.description) desc += ` - ${op.description}`;

  return {
    id: op.id,
    date: op.createdAt.toISOString(),
    invoice: stableRef("MOP", op.reference, op.id),
    booking: "",
    spnr: op.pnr || "",
    apnr: op.reference || "",
    flight: op.travelDate ? new Date(op.travelDate).toISOString() : "",
    desc,
    type: config.type,
    debit: config.affectsBalance && !config.isCredit ? Number(op.amount || 0) : 0,
    credit: config.affectsBalance && config.isCredit ? Number(op.amount || 0) : 0,
    currency: "SAR",
    created: op.createdBy || "Admin",
    status: String(op.status || "completed").toLowerCase(),
    source: "manual_operation",
  };
}

// ==========================================
// GET Handler
// ==========================================
export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser();

    if (!auth) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = auth.userId;

    const { searchParams } = new URL(req.url);

    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "10"))
    );
    const search = searchParams.get("search") || "";
    const typeFilter = searchParams.get("type") || "";
    const dateFrom = searchParams.get("dateFrom") || "";
    const dateTo = searchParams.get("dateTo") || "";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const dateFilter: any = {};

    if (dateFrom) {
      const from = new Date(dateFrom);
      from.setHours(0, 0, 0, 0);
      dateFilter.gte = from;
    }

    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      dateFilter.lte = to;
    }

    const hasDateFilter = Object.keys(dateFilter).length > 0;

    const [user, bookings, deposits, manualOps] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          balance: true,
          creditLimit: true,
          usedLimit: true,
        },
      }),

      prisma.booking.findMany({
        where: {
          agentId: userId,
          ...(hasDateFilter ? { bookingDate: dateFilter } : {}),
          ...(search
            ? {
                OR: [
                  { bookingId: { contains: search, mode: "insensitive" as const } },
                  { pnr: { contains: search, mode: "insensitive" as const } },
                  { route: { contains: search, mode: "insensitive" as const } },
                ],
              }
            : {}),
        },
        include: {
          agent: {
            select: { agentName: true, email: true },
          },
          passengers: {
            select: {
              firstName: true,
              lastName: true,
              type: true,
            },
            take: 1,
          },
          segments: {
            select: { from: true, to: true },
            orderBy: { departure: "asc" },
          },
        },
        orderBy: { bookingDate: "asc" },
      }),

      prisma.deposit.findMany({
        where: {
          userId,
          ...(hasDateFilter ? { createdAt: dateFilter } : {}),
          ...(search
            ? {
                OR: [
                  { reference: { contains: search, mode: "insensitive" as const } },
                  { notes: { contains: search, mode: "insensitive" as const } },
                ],
              }
            : {}),
        },
        orderBy: { createdAt: "asc" },
      }),

      prisma.manualOperation.findMany({
        where: {
          userId,
          status: "COMPLETED",
          ...(hasDateFilter ? { createdAt: dateFilter } : {}),
          ...(search
            ? {
                OR: [
                  { pnr: { contains: search, mode: "insensitive" as const } },
                  { description: { contains: search, mode: "insensitive" as const } },
                  { reference: { contains: search, mode: "insensitive" as const } },
                  { passengerName: { contains: search, mode: "insensitive" as const } },
                ],
              }
            : {}),
        },
        orderBy: { createdAt: "asc" },
      }),
    ]);

    const allEntries: any[] = [];

    bookings.forEach((booking) => {
      allEntries.push(bookingToLedgerEntry(booking));
    });

    deposits.forEach((deposit) => {
      allEntries.push(depositToLedgerEntry(deposit));
    });

    manualOps.forEach((op) => {
      allEntries.push(manualOpToLedgerEntry(op));
    });

    // ✅ running balance এর জন্য oldest first
    allEntries.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    let runningBal = 0;
    const entriesWithBalance = allEntries.map((entry) => {
      runningBal += (entry.credit || 0) - (entry.debit || 0);
      return {
        ...entry,
        balance: runningBal,
      };
    });

    let filteredEntries = entriesWithBalance;

    if (typeFilter) {
      filteredEntries = filteredEntries.filter((entry) => entry.type === typeFilter);
    }

    if (sortOrder === "desc") {
      filteredEntries = [...filteredEntries].reverse();
    }

    const totalCredit = entriesWithBalance.reduce(
      (sum, e) => sum + Number(e.credit || 0),
      0
    );
    const totalDebit = entriesWithBalance.reduce(
      (sum, e) => sum + Number(e.debit || 0),
      0
    );

    const total = filteredEntries.length;
    const startIndex = (page - 1) * limit;
    const paginatedEntries = filteredEntries.slice(startIndex, startIndex + limit);

    const uniqueTypes = [...new Set(entriesWithBalance.map((e) => e.type))].sort();

    const balance = Number(user?.balance) || 0;
    const creditLimit = Number(user?.creditLimit) || 0;
    const usedLimit = Number(user?.usedLimit) || 0;
    const availableCredit = Math.max(0, creditLimit - usedLimit);

    return NextResponse.json({
      success: true,
      data: paginatedEntries,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      types: uniqueTypes,
      stats: {
        currentBalance: balance,
        creditLimit,
        usedLimit,
        availableCredit,
        totalAvailable: balance + availableCredit,
        totalCredit,
        totalDebit,
        transactionCount: total,
      },
    });
  } catch (err) {
    console.error("Agent Ledger error:", err);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch ledger",
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}