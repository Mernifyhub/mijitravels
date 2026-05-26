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

    // ✅ subuser হলে parent agent ledger export হবে
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

function formatDate(dateStr: string | Date) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(dateStr: string | Date) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function escapeCsv(value: any) {
  const str = String(value ?? "");
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
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
// CSV Builder
// ==========================================
function buildCsv(entries: any[]) {
  const headers = [
    "Date",
    "Invoice",
    "Booking",
    "System PNR",
    "Airline PNR",
    "Flight Date",
    "Description",
    "Type",
    "Debit",
    "Credit",
    "Balance",
    "Currency",
    "Created By",
    "Status",
    "Source",
  ];

  const rows = entries.map((entry) => [
    formatDateTime(entry.date),
    entry.invoice,
    entry.booking,
    entry.spnr,
    entry.apnr,
    entry.flight ? formatDate(entry.flight) : "",
    entry.desc,
    entry.type,
    entry.debit,
    entry.credit,
    entry.balance,
    entry.currency,
    entry.created,
    entry.status,
    entry.source,
  ]);

  return [
    headers.map(escapeCsv).join(","),
    ...rows.map((row) => row.map(escapeCsv).join(",")),
  ].join("\n");
}

// ==========================================
// Print / HTML Builder
// ==========================================
function buildPrintHtml(params: {
  agentName: string;
  agentCode: string;
  stats: {
    currentBalance: number;
    totalCredit: number;
    totalDebit: number;
    transactionCount: number;
    creditLimit: number;
    usedLimit: number;
    availableCredit: number;
    totalAvailable: number;
  };
  entries: any[];
}) {
  const { agentName, agentCode, stats, entries } = params;

  const rows = entries
    .map(
      (entry) => `
      <tr>
        <td>${formatDateTime(entry.date)}</td>
        <td>${entry.invoice || ""}</td>
        <td>${entry.booking || ""}</td>
        <td>${entry.apnr || ""}</td>
        <td>${entry.desc || ""}</td>
        <td>${entry.type || ""}</td>
        <td style="text-align:right;color:#dc2626;">${entry.debit ? entry.debit.toFixed(2) : "-"}</td>
        <td style="text-align:right;color:#059669;">${entry.credit ? entry.credit.toFixed(2) : "-"}</td>
        <td style="text-align:right;font-weight:700;">${Number(entry.balance || 0).toFixed(2)}</td>
      </tr>
    `
    )
    .join("");

  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8" />
      <title>Ledger Statement - ${agentCode}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 24px;
          color: #0f172a;
        }
        .header {
          margin-bottom: 24px;
        }
        .title {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 6px;
        }
        .sub {
          color: #475569;
          font-size: 14px;
        }
        .stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
          margin: 20px 0 24px;
        }
        .card {
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 12px;
          background: #f8fafc;
        }
        .card .label {
          font-size: 12px;
          color: #64748b;
          margin-bottom: 6px;
        }
        .card .value {
          font-size: 18px;
          font-weight: 700;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
        }
        th, td {
          border: 1px solid #e2e8f0;
          padding: 8px;
          vertical-align: top;
        }
        th {
          background: #f1f5f9;
          text-align: left;
          font-weight: 700;
        }
        @media print {
          body {
            padding: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="title">Ledger Statement</div>
        <div class="sub">${agentName} • ${agentCode}</div>
        <div class="sub">Generated at: ${formatDateTime(new Date())}</div>
      </div>

      <div class="stats">
        <div class="card">
          <div class="label">Current Balance</div>
          <div class="value">${stats.currentBalance.toFixed(2)} SAR</div>
        </div>
        <div class="card">
          <div class="label">Total Credit</div>
          <div class="value">${stats.totalCredit.toFixed(2)} SAR</div>
        </div>
        <div class="card">
          <div class="label">Total Debit</div>
          <div class="value">${stats.totalDebit.toFixed(2)} SAR</div>
        </div>
        <div class="card">
          <div class="label">Transactions</div>
          <div class="value">${stats.transactionCount}</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Invoice</th>
            <th>Booking</th>
            <th>PNR</th>
            <th>Description</th>
            <th>Type</th>
            <th style="text-align:right;">Debit</th>
            <th style="text-align:right;">Credit</th>
            <th style="text-align:right;">Balance</th>
          </tr>
        </thead>
        <tbody>
          ${rows || `<tr><td colspan="9" style="text-align:center;">No data found</td></tr>`}
        </tbody>
      </table>
    </body>
  </html>
  `;
}

// ==========================================
// GET Export Handler
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

    const format = (searchParams.get("format") || "csv").toLowerCase();
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
          id: true,
          agentId: true,
          firstName: true,
          lastName: true,
          agentName: true,
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

    bookings.forEach((booking) => allEntries.push(bookingToLedgerEntry(booking)));
    deposits.forEach((deposit) => allEntries.push(depositToLedgerEntry(deposit)));
    manualOps.forEach((op) => allEntries.push(manualOpToLedgerEntry(op)));

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

    const balance = Number(user?.balance) || 0;
    const creditLimit = Number(user?.creditLimit) || 0;
    const usedLimit = Number(user?.usedLimit) || 0;
    const availableCredit = Math.max(0, creditLimit - usedLimit);

    const totalCredit = entriesWithBalance.reduce(
      (sum, e) => sum + Number(e.credit || 0),
      0
    );
    const totalDebit = entriesWithBalance.reduce(
      (sum, e) => sum + Number(e.debit || 0),
      0
    );

    const agentName =
      user?.agentName ||
      `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
      "Agent";

    const agentCode = user?.agentId || user?.id || "AGENT";

    const fileBase = `ledger-${agentCode}-${new Date().toISOString().slice(0, 10)}`;

    // ==========================================
    // CSV
    // ==========================================
    if (format === "csv") {
      const csv = buildCsv(filteredEntries);

      return new NextResponse("\uFEFF" + csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${fileBase}.csv"`,
        },
      });
    }

    // ==========================================
    // Excel (CSV-compatible export)
    // ==========================================
    if (format === "excel") {
      const csv = buildCsv(filteredEntries);

      return new NextResponse("\uFEFF" + csv, {
        status: 200,
        headers: {
          "Content-Type": "application/vnd.ms-excel; charset=utf-8",
          "Content-Disposition": `attachment; filename="${fileBase}.xls"`,
        },
      });
    }

    // ==========================================
    // Print / PDF fallback as HTML
    // ==========================================
    if (format === "print" || format === "pdf") {
      const html = buildPrintHtml({
        agentName,
        agentCode,
        stats: {
          currentBalance: balance,
          totalCredit,
          totalDebit,
          transactionCount: filteredEntries.length,
          creditLimit,
          usedLimit,
          availableCredit,
          totalAvailable: balance + availableCredit,
        },
        entries: filteredEntries,
      });

      return new NextResponse(html, {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Content-Disposition": `inline; filename="${fileBase}.html"`,
        },
      });
    }

    return NextResponse.json(
      { success: false, message: "Unsupported export format" },
      { status: 400 }
    );
  } catch (err) {
    console.error("Agent Ledger export error:", err);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to export ledger",
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}