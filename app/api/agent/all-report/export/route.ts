// app/api/user/sales-report/export/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

async function getAuthUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return null;
    const decoded = jwt.verify(token, process.env.SECRET_KEY!) as { id: string };
    return decoded;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format") || "csv";
    const dateFrom = searchParams.get("dateFrom") || "";
    const dateTo = searchParams.get("dateTo") || "";

    // Build date filter
    const now = new Date();
    let startDate = new Date(now);
    startDate.setHours(0, 0, 0, 0);
    let endDate = new Date(now);
    endDate.setHours(23, 59, 59, 999);

    if (dateFrom) startDate = new Date(dateFrom);
    if (dateTo) {
      endDate = new Date(dateTo);
      endDate.setHours(23, 59, 59, 999);
    }

    // Fetch bookings
    const bookings = await prisma.booking.findMany({
      where: {
        agentId: auth.id,
        bookingDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        passengers: true,
        segments: true,
      },
      orderBy: { bookingDate: "desc" },
    });

    // Fetch deposits
    const deposits = await prisma.deposit.findMany({
      where: {
        userId: auth.id,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate stats
    const confirmedBookings = bookings.filter((b) => b.status === "CONFIRMED");
    const cancelledBookings = bookings.filter((b) => b.status === "CANCELLED");
    const voidedBookings = bookings.filter((b) => b.status === "VOIDED");
    const refundedBookings = bookings.filter((b) => b.status === "REFUNDED");
    const pendingBookings = bookings.filter((b) => b.status === "ON_HOLD");

    const ticketedAmount = confirmedBookings.reduce((sum, b) => sum + (b.gross || 0), 0);
    const netAmount = confirmedBookings.reduce((sum, b) => sum + (b.net || 0), 0);
    const profit = ticketedAmount - netAmount;
    const totalPassengers = bookings.reduce((sum, b) => sum + b.passengers.length, 0);
    const successDeposits = deposits.filter((d) => d.status === "SUCCESS");
    const depositAmount = successDeposits.reduce((sum, d) => sum + d.amount, 0);

    if (format === "csv") {
      const headers = [
        "Metric",
        "Value",
        "Details",
      ];

      const rows = [
        ["Report Period", `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`, ""],
        ["", "", ""],
        ["=== OVERVIEW ===", "", ""],
        ["Total Bookings", bookings.length.toString(), "All booking statuses"],
        ["Total Passengers", totalPassengers.toString(), ""],
        ["Total Segments", bookings.reduce((sum, b) => sum + b.segments.length, 0).toString(), ""],
        ["", "", ""],
        ["=== BOOKING STATUS ===", "", ""],
        ["Confirmed/Issued", confirmedBookings.length.toString(), `SAR ${ticketedAmount.toLocaleString()}`],
        ["Pending", pendingBookings.length.toString(), ""],
        ["Cancelled", cancelledBookings.length.toString(), `SAR ${cancelledBookings.reduce((sum, b) => sum + (b.gross || 0), 0).toLocaleString()}`],
        ["Voided", voidedBookings.length.toString(), `SAR ${voidedBookings.reduce((sum, b) => sum + (b.gross || 0), 0).toLocaleString()}`],
        ["Refunded", refundedBookings.length.toString(), `SAR ${refundedBookings.reduce((sum, b) => sum + (b.gross || 0), 0).toLocaleString()}`],
        ["", "", ""],
        ["=== FINANCIAL ===", "", ""],
        ["Ticketed Amount", `SAR ${ticketedAmount.toLocaleString()}`, "Gross amount"],
        ["Net Amount", `SAR ${netAmount.toLocaleString()}`, ""],
        ["Profit/Loss", `SAR ${profit.toLocaleString()}`, profit >= 0 ? "Profit" : "Loss"],
        ["Commission", `SAR ${confirmedBookings.reduce((sum, b) => sum + (b.commission || 0), 0).toLocaleString()}`, ""],
        ["", "", ""],
        ["=== DEPOSITS ===", "", ""],
        ["Deposit Count", successDeposits.length.toString(), "Successful deposits"],
        ["Deposit Amount", `SAR ${depositAmount.toLocaleString()}`, ""],
        ["", "", ""],
        ["=== PERFORMANCE ===", "", ""],
        ["Avg. Ticket Value", `SAR ${confirmedBookings.length > 0 ? Math.round(ticketedAmount / confirmedBookings.length).toLocaleString() : 0}`, ""],
        ["Conversion Rate", `${bookings.length > 0 ? Math.round((confirmedBookings.length / bookings.length) * 100) : 0}%`, ""],
        ["Profit Margin", `${ticketedAmount > 0 ? ((profit / ticketedAmount) * 100).toFixed(1) : 0}%`, ""],
      ];

      const csv = [headers, ...rows]
        .map((row) =>
          row
            .map((cell) =>
              typeof cell === "string" && cell.includes(",") ? `"${cell}"` : cell
            )
            .join(",")
        )
        .join("\n");

      const bom = "\uFEFF";

      return new NextResponse(bom + csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="sales-report-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }

    return NextResponse.json(
      { success: false, message: `Format '${format}' not supported. Use 'csv'.` },
      { status: 400 }
    );
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { success: false, message: "Export failed" },
      { status: 500 }
    );
  }
}