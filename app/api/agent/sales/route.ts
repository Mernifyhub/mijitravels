// app/api/user/sales/route.ts
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
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const dateFrom = searchParams.get("dateFrom") || "";
    const dateTo = searchParams.get("dateTo") || "";
    const sortBy = searchParams.get("sortBy") || "bookingDate";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Build where clause
    const where: any = {
      agentId: auth.id,
    };

    // Search filter
    if (search) {
      where.OR = [
        { bookingId: { contains: search, mode: "insensitive" } },
        { pnr: { contains: search, mode: "insensitive" } },
        { route: { contains: search, mode: "insensitive" } },
        { carrier: { contains: search, mode: "insensitive" } },
      ];
    }

    // Status filter - map to enum values
    if (status) {
      const statusMap: Record<string, string> = {
        confirmed: "CONFIRMED",
        pending: "ON_HOLD",
        cancelled: "CANCELLED",
        voided: "VOIDED",
        refunded: "REFUNDED",
      };
      where.status = statusMap[status.toLowerCase()] || status.toUpperCase();
    }

    // Date range filter
    if (dateFrom || dateTo) {
      where.bookingDate = {};
      if (dateFrom) {
        where.bookingDate.gte = new Date(dateFrom);
      }
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        where.bookingDate.lte = endDate;
      }
    }

    // Get total count
    const total = await prisma.booking.count({ where });

    // Map sortBy to correct field
    let orderByField = sortBy;
    if (sortBy === "date") orderByField = "bookingDate";
    if (sortBy === "amount") orderByField = "gross";

    // Get paginated data
    const bookings = await prisma.booking.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        [orderByField]: sortOrder as "asc" | "desc",
      },
      include: {
        agent: {
          select: {
            agentName: true,
            email: true,
          },
        },
        passengers: {
          select: {
            type: true,
          },
        },
        segments: {
          select: {
            from: true,
            to: true,
          },
          orderBy: {
            departure: "asc",
          },
        },
      },
    });

    // Calculate stats for confirmed bookings only
    const confirmedBookings = await prisma.booking.findMany({
      where: {
        agentId: auth.id,
        status: "CONFIRMED",
      },
      select: {
        gross: true,
        commission: true,
        passengers: {
          select: {
            type: true,
          },
        },
      },
    });

    const totalPax = confirmedBookings.reduce(
      (sum, b) => sum + b.passengers.length,
      0
    );

    const totalSales = confirmedBookings.reduce((sum, b) => sum + (b.gross || 0), 0);
    const totalCommission = confirmedBookings.reduce((sum, b) => sum + (b.commission || 0), 0);

    const stats = {
      totalSales,
      totalCommission,
      totalPax,
      bookingCount: confirmedBookings.length,
      avgTicketPrice: confirmedBookings.length > 0 ? totalSales / confirmedBookings.length : 0,
    };

    // Transform data to match frontend interface
    const transformedData = bookings.map((booking) => {
      const origin = booking.segments[0]?.from || booking.route?.split("-")[0]?.trim() || "";
      const destination = booking.segments[booking.segments.length - 1]?.to || booking.route?.split("-").pop()?.trim() || "";

      // Map status to frontend format
      const statusMap: Record<string, string> = {
        CONFIRMED: "confirmed",
        ON_HOLD: "pending",
        CANCELLED: "cancelled",
        VOIDED: "cancelled",
        REFUNDED: "refunded",
      };

      return {
        id: booking.id,
        date: booking.bookingDate.toISOString(),
        booking: booking.bookingId,
        pnr: booking.pnr,
        route: booking.route,
        origin: origin,
        destination: destination,
        pax: booking.passengers.length,
        amount: booking.gross || 0,
        currency: "SAR",
        agent: booking.agent?.email || "",
        agentName: booking.agent?.agentName || "N/A",
        status: statusMap[booking.status] || "pending",
        commission: booking.commission || 0,
        ticketType:
          booking.tripType === "ONE_WAY"
            ? "One Way"
            : booking.tripType === "ROUND_TRIP"
            ? "Round Trip"
            : "Multi City",
      };
    });

    return NextResponse.json({
      success: true,
      data: transformedData,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      stats,
    });
  } catch (error) {
    console.error("Get sales error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to fetch sales",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}