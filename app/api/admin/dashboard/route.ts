// app/api/admin/dashboard/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const [
      totalBookings,
      totalRevenue,
      totalAgents,
      pendingDeposits,
      recentBookings,
      recentDeposits,
      topAgents,
      issueCount,
      reissueCount,
      cancelCount,
      voidCount,
      refundCount, // ✅ REFUND add করা হলো
    ] = await Promise.all([
      prisma.booking.count(),
      prisma.booking.aggregate({
        where: { status: "CONFIRMED" },
        _sum: { gross: true },
      }),
      prisma.user.count({ where: { role: "USER" } }),
      prisma.deposit.count({ where: { status: "PENDING" } }),
      prisma.booking.findMany({
        take: 6,
        orderBy: { createdAt: "desc" },
        include: { passengers: { take: 1 }, agent: true },
      }),
      prisma.deposit.findMany({
        take: 6,
        orderBy: { createdAt: "desc" },
        include: { user: true },
      }),
      prisma.user.findMany({
        where: { role: "USER" },
        take: 5,
        orderBy: { bookings: { _count: "desc" } },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          agentName: true,
          _count: { select: { bookings: true } },
        },
      }),
      prisma.bookingRequest.count({
        where: { type: "ISSUE", status: { in: ["PENDING", "PROCESSING"] } },
      }),
      prisma.bookingRequest.count({
        where: { type: "REISSUE", status: { in: ["PENDING", "PROCESSING"] } },
      }),
      prisma.bookingRequest.count({
        where: { type: "CANCEL", status: { in: ["PENDING", "PROCESSING"] } },
      }),
      prisma.bookingRequest.count({
        where: { type: "VOID", status: { in: ["PENDING", "PROCESSING"] } },
      }),
      prisma.bookingRequest.count({ // ✅ REFUND
        where: { type: "REFUND", status: { in: ["PENDING", "PROCESSING"] } },
      }),
    ]);

    const formattedTopAgents = topAgents.map((agent, index) => ({
      id: agent.id,
      name: agent.agentName || `${agent.firstName} ${agent.lastName}`,
      bookings: agent._count.bookings,
      revenue: `$${(agent._count.bookings * 450).toLocaleString()}`,
      status: "active" as const,
      avatar: agent.firstName?.[0] + (agent.lastName?.[0] || ""),
      growth: 12 + index * 2,
    }));

    return NextResponse.json({
      stats: {
        totalBookings,
        totalRevenue: totalRevenue._sum.gross || 0,
        totalAgents,
        pendingDeposits,
        todayBookings: Math.floor(totalBookings * 0.08),
      },
      recentBookings: recentBookings.map((b: any) => ({
        id: b.id,
        pnr: b.pnr,
        passenger: b.passengers[0]
          ? `${b.passengers[0].firstName} ${b.passengers[0].lastName}`
          : "N/A",
        route: b.route,
        date: b.departureDate.toISOString().split("T")[0],
        amount: `$${(b.gross || 450).toLocaleString()}`,
        status: b.status.toLowerCase(),
        agent: b.agent?.agentName || "Unknown",
      })),
      recentDeposits: recentDeposits.map((d: any) => ({
        id: d.id,
        agent: d.user?.agentName || "Unknown Agent",
        amount: `$${(d.amount || 0).toLocaleString()}`,
        method: d.method.replace("_", " "),
        date: d.createdAt.toISOString().split("T")[0],
        status: d.status.toLowerCase(),
        reference: d.reference || `DEP-${d.id.slice(0, 6)}`,
      })),
      topAgents: formattedTopAgents,
      requestStats: {
        ISSUE: issueCount,
        REISSUE: reissueCount,
        CANCEL: cancelCount,
        VOID: voidCount,
        REFUND: refundCount, // ✅ REFUND add হলো
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}