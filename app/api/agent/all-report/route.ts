// app/api/user/sales-report/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

// Get authenticated user
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

// Calculate percentage change
function calculateChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return parseFloat((((current - previous) / previous) * 100).toFixed(1));
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

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const dateFrom = searchParams.get("dateFrom") || "";
    const dateTo = searchParams.get("dateTo") || "";
    const range = searchParams.get("range") || "today";

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    let endDate: Date = new Date(now);
    endDate.setHours(23, 59, 59, 999);

    // Previous period for comparison
    let prevStartDate: Date;
    let prevEndDate: Date;

    if (dateFrom && dateTo) {
      startDate = new Date(dateFrom);
      endDate = new Date(dateTo);
      endDate.setHours(23, 59, 59, 999);
      
      const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      prevEndDate = new Date(startDate);
      prevEndDate.setDate(prevEndDate.getDate() - 1);
      prevStartDate = new Date(prevEndDate);
      prevStartDate.setDate(prevStartDate.getDate() - daysDiff);
    } else {
      switch (range) {
        case "today":
          startDate = new Date(now);
          startDate.setHours(0, 0, 0, 0);
          prevStartDate = new Date(startDate);
          prevStartDate.setDate(prevStartDate.getDate() - 1);
          prevEndDate = new Date(prevStartDate);
          prevEndDate.setHours(23, 59, 59, 999);
          break;
        case "yesterday":
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() - 1);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(startDate);
          endDate.setHours(23, 59, 59, 999);
          prevStartDate = new Date(startDate);
          prevStartDate.setDate(prevStartDate.getDate() - 1);
          prevEndDate = new Date(prevStartDate);
          prevEndDate.setHours(23, 59, 59, 999);
          break;
        case "7days":
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() - 7);
          startDate.setHours(0, 0, 0, 0);
          prevEndDate = new Date(startDate);
          prevEndDate.setDate(prevEndDate.getDate() - 1);
          prevStartDate = new Date(prevEndDate);
          prevStartDate.setDate(prevStartDate.getDate() - 7);
          break;
        case "30days":
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() - 30);
          startDate.setHours(0, 0, 0, 0);
          prevEndDate = new Date(startDate);
          prevEndDate.setDate(prevEndDate.getDate() - 1);
          prevStartDate = new Date(prevEndDate);
          prevStartDate.setDate(prevStartDate.getDate() - 30);
          break;
        case "thisMonth":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          prevStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          prevEndDate = new Date(now.getFullYear(), now.getMonth(), 0);
          break;
        case "lastMonth":
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          endDate = new Date(now.getFullYear(), now.getMonth(), 0);
          endDate.setHours(23, 59, 59, 999);
          prevStartDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
          prevEndDate = new Date(now.getFullYear(), now.getMonth() - 1, 0);
          break;
        case "thisYear":
          startDate = new Date(now.getFullYear(), 0, 1);
          prevStartDate = new Date(now.getFullYear() - 1, 0, 1);
          prevEndDate = new Date(now.getFullYear() - 1, 11, 31);
          break;
        case "all":
          startDate = new Date("2020-01-01");
          prevStartDate = new Date("2019-01-01");
          prevEndDate = new Date("2019-12-31");
          break;
        default:
          startDate = new Date(now);
          startDate.setHours(0, 0, 0, 0);
          prevStartDate = new Date(startDate);
          prevStartDate.setDate(prevStartDate.getDate() - 1);
          prevEndDate = new Date(prevStartDate);
          prevEndDate.setHours(23, 59, 59, 999);
      }
    }

    // Fetch current period bookings
    const currentBookings = await prisma.booking.findMany({
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
    });

    // Fetch previous period bookings for comparison
    const previousBookings = await prisma.booking.findMany({
      where: {
        agentId: auth.id,
        bookingDate: {
          gte: prevStartDate,
          lte: prevEndDate,
        },
      },
      include: {
        passengers: true,
        segments: true,
      },
    });

    // Fetch current period deposits
    const currentDeposits = await prisma.deposit.findMany({
      where: {
        userId: auth.id,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Fetch previous period deposits
    const previousDeposits = await prisma.deposit.findMany({
      where: {
        userId: auth.id,
        createdAt: {
          gte: prevStartDate,
          lte: prevEndDate,
        },
      },
    });

    // Calculate current period stats
    const confirmedBookings = currentBookings.filter((b) => b.status === "CONFIRMED");
    const cancelledBookings = currentBookings.filter((b) => b.status === "CANCELLED");
    const pendingBookings = currentBookings.filter((b) => b.status === "ON_HOLD");
    const voidedBookings = currentBookings.filter((b) => b.status === "VOIDED");
    const refundedBookings = currentBookings.filter((b) => b.status === "REFUNDED");

    const totalBookings = currentBookings.length;
    const issueCount = confirmedBookings.length;
    const cancelledCount = cancelledBookings.length;
    const pendingCount = pendingBookings.length;
    const voidCount = voidedBookings.length;
    const refundCount = refundedBookings.length;

    const ticketedAmount = confirmedBookings.reduce((sum, b) => sum + (b.gross || 0), 0);
    const netAmount = confirmedBookings.reduce((sum, b) => sum + (b.net || 0), 0);
    const commission = confirmedBookings.reduce((sum, b) => sum + (b.commission || 0), 0);
    const profit = ticketedAmount - netAmount;

    const totalPassengers = currentBookings.reduce((sum, b) => sum + b.passengers.length, 0);
    const totalSegments = currentBookings.reduce((sum, b) => sum + b.segments.length, 0);

    const cancelledAmount = cancelledBookings.reduce((sum, b) => sum + (b.gross || 0), 0);
    const voidAmount = voidedBookings.reduce((sum, b) => sum + (b.gross || 0), 0);
    const refundAmount = refundedBookings.reduce((sum, b) => sum + (b.gross || 0), 0);

    const successDeposits = currentDeposits.filter((d) => d.status === "SUCCESS");
    const depositAmount = successDeposits.reduce((sum, d) => sum + d.amount, 0);
    const depositCount = successDeposits.length;

    // Calculate previous period stats for comparison
    const prevConfirmed = previousBookings.filter((b) => b.status === "CONFIRMED");
    const prevTotalBookings = previousBookings.length;
    const prevIssueCount = prevConfirmed.length;
    const prevCancelledCount = previousBookings.filter((b) => b.status === "CANCELLED").length;
    const prevPendingCount = previousBookings.filter((b) => b.status === "ON_HOLD").length;
    const prevVoidCount = previousBookings.filter((b) => b.status === "VOIDED").length;
    const prevRefundCount = previousBookings.filter((b) => b.status === "REFUNDED").length;
    const prevTicketedAmount = prevConfirmed.reduce((sum, b) => sum + (b.gross || 0), 0);
    const prevNetAmount = prevConfirmed.reduce((sum, b) => sum + (b.net || 0), 0);
    const prevProfit = prevTicketedAmount - prevNetAmount;
    const prevPassengers = previousBookings.reduce((sum, b) => sum + b.passengers.length, 0);
    const prevSegments = previousBookings.reduce((sum, b) => sum + b.segments.length, 0);

    const prevSuccessDeposits = previousDeposits.filter((d) => d.status === "SUCCESS");
    const prevDepositAmount = prevSuccessDeposits.reduce((sum, d) => sum + d.amount, 0);
    const prevDepositCount = prevSuccessDeposits.length;

    // Build stats response
    const stats = {
      // Overview
      searchCount: {
        value: totalBookings * 15, // Estimate searches
        change: calculateChange(totalBookings * 15, prevTotalBookings * 15),
        changeType: totalBookings >= prevTotalBookings ? "increase" : "decrease",
      },
      agentCount: {
        value: 1, // Single user
        change: 0,
        changeType: "neutral",
      },
      totalFlyer: {
        value: totalPassengers,
        change: calculateChange(totalPassengers, prevPassengers),
        changeType: totalPassengers >= prevPassengers ? "increase" : "decrease",
      },
      totalSegments: {
        value: totalSegments,
        change: calculateChange(totalSegments, prevSegments),
        changeType: totalSegments >= prevSegments ? "increase" : "decrease",
      },

      // Booking
      bookingCount: {
        value: totalBookings,
        change: calculateChange(totalBookings, prevTotalBookings),
        changeType: totalBookings >= prevTotalBookings ? "increase" : "decrease",
      },
      issueCount: {
        value: issueCount,
        change: calculateChange(issueCount, prevIssueCount),
        changeType: issueCount >= prevIssueCount ? "increase" : "decrease",
      },
      bookingCancelled: {
        value: cancelledCount,
        change: calculateChange(cancelledCount, prevCancelledCount),
        changeType: cancelledCount <= prevCancelledCount ? "decrease" : "increase",
      },
      pendingBookings: {
        value: pendingCount,
        change: calculateChange(pendingCount, prevPendingCount),
        changeType: pendingCount <= prevPendingCount ? "decrease" : "increase",
      },

      // Financial
      ticketedAmount: {
        value: ticketedAmount,
        change: calculateChange(ticketedAmount, prevTicketedAmount),
        changeType: ticketedAmount >= prevTicketedAmount ? "increase" : "decrease",
      },
      depositAmount: {
        value: depositAmount,
        change: calculateChange(depositAmount, prevDepositAmount),
        changeType: depositAmount >= prevDepositAmount ? "increase" : "decrease",
      },
      depositCount: {
        value: depositCount,
        change: calculateChange(depositCount, prevDepositCount),
        changeType: depositCount >= prevDepositCount ? "increase" : "decrease",
      },
      lossProfit: {
        value: profit,
        change: calculateChange(profit, prevProfit),
        changeType: profit >= prevProfit ? "increase" : "decrease",
      },
      commission: {
        value: commission,
        change: calculateChange(commission, prevConfirmed.reduce((sum, b) => sum + (b.commission || 0), 0)),
        changeType: "increase",
      },

      // Operations
      refundCount: {
        value: refundCount,
        change: calculateChange(refundCount, prevRefundCount),
        changeType: refundCount <= prevRefundCount ? "decrease" : "increase",
      },
      refundAmount: {
        value: refundAmount,
        change: calculateChange(refundAmount, previousBookings.filter((b) => b.status === "REFUNDED").reduce((sum, b) => sum + (b.gross || 0), 0)),
        changeType: refundAmount <= 0 ? "decrease" : "increase",
      },
      reissueCount: {
        value: 0, // Would need separate tracking
        change: 0,
        changeType: "neutral",
      },
      reissueAmount: {
        value: 0,
        change: 0,
        changeType: "neutral",
      },
      voidCount: {
        value: voidCount,
        change: calculateChange(voidCount, prevVoidCount),
        changeType: voidCount <= prevVoidCount ? "decrease" : "increase",
      },
      voidAmount: {
        value: voidAmount,
        change: calculateChange(voidAmount, previousBookings.filter((b) => b.status === "VOIDED").reduce((sum, b) => sum + (b.gross || 0), 0)),
        changeType: voidAmount <= 0 ? "decrease" : "increase",
      },
    };

    // Calculate summary
    const summary = {
      ticketedAmount,
      bookingCount: totalBookings,
      profitLoss: profit,
      totalFlyer: totalPassengers,
      commission,
      depositAmount,
      avgTicketValue: issueCount > 0 ? Math.round(ticketedAmount / issueCount) : 0,
      conversionRate: totalBookings > 0 ? Math.round((issueCount / totalBookings) * 100) : 0,
      profitMargin: ticketedAmount > 0 ? parseFloat(((profit / ticketedAmount) * 100).toFixed(1)) : 0,
    };

    // Get top routes
    const routeCounts: Record<string, number> = {};
    confirmedBookings.forEach((b) => {
      const route = b.route || "Unknown";
      routeCounts[route] = (routeCounts[route] || 0) + 1;
    });

    const topRoutes = Object.entries(routeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([route, count]) => ({
        route,
        count,
        percentage: totalBookings > 0 ? Math.round((count / totalBookings) * 100) : 0,
      }));

    return NextResponse.json({
      success: true,
      stats,
      summary,
      topRoutes,
      dateRange: {
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
      },
    });
  } catch (error) {
    console.error("Sales report error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch sales report",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}