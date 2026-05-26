// app/api/admin/agents/[id]/ledger/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
type RouteContext = { params: Promise<{ id: string }> };

// ==========================================
// Booking → Ledger Entry
// ==========================================
function bookingToLedgerEntry(booking: any, index: number) {
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
    invoice: `INV${String(1000 + index).padStart(4, "0")}`,
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
function depositToLedgerEntry(deposit: any, index: number) {
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
    invoice: `DEP${String(1000 + index).padStart(4, "0")}`,
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
function manualOpToLedgerEntry(op: any, index: number) {
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
    invoice: `MOP${String(1000 + index).padStart(4, "0")}`,
    booking: "",
    spnr: op.pnr || "",
    apnr: op.reference || "",
    flight: op.travelDate ? new Date(op.travelDate).toISOString() : "",
    desc,
    type: config.type,
    debit: config.affectsBalance && !config.isCredit ? Number(op.amount) : 0,
    credit: config.affectsBalance && config.isCredit ? Number(op.amount) : 0,
    currency: "SAR",
    created: op.createdBy || "Admin",
    status: op.status.toLowerCase(),
    source: "manual_operation",
  };
}

// ==========================================
// GET Handler
// ==========================================
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id: agentId } = await context.params; // ✅ Next.js 15

    if (!agentId) {
      return NextResponse.json(
        { success: false, error: "Agent ID required" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(req.url);
    const page      = Math.max(1, parseInt(searchParams.get("page")  || "1"));
    const limit     = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "10")));
    const search    = searchParams.get("search")    || "";
    const typeFilter = searchParams.get("type")     || "";
    const dateFrom  = searchParams.get("dateFrom")  || "";
    const dateTo    = searchParams.get("dateTo")    || "";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Date filter
    const dateFilter: any = {};
    if (dateFrom) dateFilter.gte = new Date(dateFrom);
    if (dateTo) {
      const end = new Date(dateTo);
      end.setHours(23, 59, 59, 999);
      dateFilter.lte = end;
    }
    const hasDateFilter = Object.keys(dateFilter).length > 0;

    // ─── Parallel queries ───
    const [user, bookings, deposits, manualOps] = await Promise.all([

      // User model থেকে agent info
      prisma.user.findUnique({
        where: { id: agentId },
        select: {
          id:               true,
          agentId:          true,
          firstName:        true,
          lastName:         true,
          agentName:        true,
          email:            true,
          phone:            true,
          balance:          true,
          creditLimit:      true,
          usedLimit:        true,
          status:           true,
          tier:             true,
        },
      }),

      // Booking model
      prisma.booking.findMany({
        where: {
          agentId,
          ...(hasDateFilter ? { bookingDate: dateFilter } : {}),
          ...(search ? {
            OR: [
              { bookingId: { contains: search, mode: "insensitive" as const } },
              { pnr:       { contains: search, mode: "insensitive" as const } },
              { route:     { contains: search, mode: "insensitive" as const } },
            ],
          } : {}),
        },
        include: {
          agent: { select: { agentName: true } },
          passengers: {
            select: { firstName: true, lastName: true, type: true },
            take: 1, // শুধু প্রথম passenger
          },
          segments: {
            select: { from: true, to: true },
            orderBy: { departure: "asc" },
          },
        },
        orderBy: { bookingDate: "asc" },
      }),

      // Deposit model
      prisma.deposit.findMany({
        where: {
          userId: agentId,
          ...(hasDateFilter ? { createdAt: dateFilter } : {}),
          ...(search ? {
            OR: [
              { reference: { contains: search, mode: "insensitive" as const } },
              { notes:     { contains: search, mode: "insensitive" as const } },
            ],
          } : {}),
        },
        orderBy: { createdAt: "asc" },
      }),

      // ManualOperation model
      prisma.manualOperation.findMany({
        where: {
          userId: agentId,
          status: "COMPLETED",
          ...(hasDateFilter ? { createdAt: dateFilter } : {}),
          ...(search ? {
            OR: [
              { pnr:           { contains: search, mode: "insensitive" as const } },
              { description:   { contains: search, mode: "insensitive" as const } },
              { reference:     { contains: search, mode: "insensitive" as const } },
              { passengerName: { contains: search, mode: "insensitive" as const } },
            ],
          } : {}),
        },
        orderBy: { createdAt: "asc" },
      }),
    ]);

    // Agent not found
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Agent not found" },
        { status: 404 }
      );
    }

    // ─── Transform ───
    const allEntries: any[] = [];

    bookings.forEach((b, i) =>
      allEntries.push(bookingToLedgerEntry(b, i))
    );
    deposits.forEach((d, i) =>
      allEntries.push(depositToLedgerEntry(d, i))
    );
    manualOps.forEach((m, i) =>
      allEntries.push(manualOpToLedgerEntry(m, i))
    );

    // ─── Sort ascending → running balance calculate ───
    allEntries.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // ─── Running balance ───
    let runningBal = 0;
    const entriesWithBalance = allEntries.map((entry) => {
      runningBal += (entry.credit || 0) - (entry.debit || 0);
      return { ...entry, balance: runningBal };
    });

    // ─── Type filter ───
    let filteredEntries = typeFilter
      ? entriesWithBalance.filter((e) => e.type === typeFilter)
      : entriesWithBalance;

    // ─── Sort for display ───
    if (sortOrder === "desc") {
      filteredEntries = [...filteredEntries].reverse();
    }

    // ─── Stats ───
    const totalCredit = entriesWithBalance.reduce(
      (sum, e) => sum + (e.credit || 0), 0
    );
    const totalDebit = entriesWithBalance.reduce(
      (sum, e) => sum + (e.debit || 0), 0
    );

    // ─── Paginate ───
    const total      = filteredEntries.length;
    const startIndex = (page - 1) * limit;
    const paginated  = filteredEntries.slice(startIndex, startIndex + limit);

    // ─── Unique types for filter dropdown ───
    const uniqueTypes = [
      ...new Set(entriesWithBalance.map((e) => e.type)),
    ].sort();

    // ─── User balance ───
    const balance        = Number(user.balance)     || 0;
    const creditLimit    = Number(user.creditLimit)  || 0;
    const usedLimit      = Number(user.usedLimit)    || 0;
    const availableCredit = Math.max(0, creditLimit - usedLimit);
    const agentName      = user.agentName || `${user.firstName} ${user.lastName}`.trim();

    return NextResponse.json({
      success: true,

      agent: {
        id:           user.id,
        agentId:      user.agentId || user.id,
        name:         agentName,
        firstName:    user.firstName,
        lastName:     user.lastName,
        email:        user.email,
        phone:        user.phone,
        balance,
        creditLimit,
        usedLimit,
        availableCredit,
        status:       user.status,
        tier:         user.tier,
      },

      data:       paginated,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      types:      uniqueTypes,

      stats: {
        currentBalance:   balance,
        creditLimit,
        usedLimit,
        availableCredit,
        totalAvailable:   balance + availableCredit,
        totalCredit,
        totalDebit,
        transactionCount: total,
      },
    });

  } catch (err: any) {
    console.error("Admin Agent Ledger GET error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}