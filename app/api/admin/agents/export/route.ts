// app/api/admin/agents/export/route.ts

import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { error } from "@/lib/api-response";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    if (!rateLimit(`export-${ip}`, 5).allowed) return error("Too many requests", 429);

    const auth = await requireAdmin();
    if (!auth.authorized) return error(auth.error!, auth.status);

    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "csv";
    const search = searchParams.get("search") || "";

    const where: any = { role: "USER" };
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { agentName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
      ];
    }

    const agents = await prisma.user.findMany({
      where, orderBy: { createdAt: "desc" },
      select: {
        id: true, firstName: true, lastName: true, agentName: true,
        agentAddress: true, email: true, phone: true, aviationNumber: true,
        city: true, country: true, status: true, tier: true,
        creditLimit: true, commission: true, expiredLimit: true,
        preBookingEnabled: true, verified: true,
        createdAt: true,
        _count: { select: { bookings: true, subUsers: true } },
      },
    });

    // Financial
    const agentIds = agents.map((a) => a.id);
    const [depStats, bkStats] = await Promise.all([
      prisma.deposit.groupBy({
        by: ["userId"], where: { userId: { in: agentIds }, status: "SUCCESS" }, _sum: { amount: true },
      }),
      prisma.booking.groupBy({
        by: ["agentId"], where: { agentId: { in: agentIds } }, _sum: { net: true, gross: true },
      }),
    ]);

    const depMap = new Map(depStats.map((d) => [d.userId, d._sum.amount || 0]));
    const bkMap = new Map(bkStats.map((b) => [b.agentId, { net: b._sum.net || 0, gross: b._sum.gross || 0 }]));

    if (format === "csv" || format === "excel") {
      const headers = [
        "ID", "First Name", "Last Name", "Agent Name", "Email", "Phone",
        "Address", "City", "Country", "Aviation No", "Status", "Tier",
        "Balance (SAR)", "Credit Limit", "Commission %", "Expired Limit",
        "Pre-Booking", "Verified", "Bookings", "Staff", "Joined",
      ];

      const rows = agents.map((a) => {
        const dep = depMap.get(a.id) || 0;
        const bk = bkMap.get(a.id) || { net: 0, gross: 0 };
        return [
          a.id, a.firstName, a.lastName, a.agentName, a.email, a.phone,
          a.agentAddress, a.city || "", a.country || "", a.aviationNumber,
          a.status, a.tier, (dep - bk.net).toFixed(2), a.creditLimit,
          a.commission,a.expiredLimit ? a.expiredLimit.toISOString().split("T")[0] : "",
          a.preBookingEnabled ? "Yes" : "No", a.verified ? "Yes" : "No",
          a._count.bookings, a._count.subUsers,
          a.createdAt.toISOString().split("T")[0],
        ];
      });

      const esc = (v: any) => {
        const s = String(v ?? "");
        return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s.replace(/"/g, '""')}"` : s;
      };

      const csv = "\uFEFF" + [headers.map(esc).join(","), ...rows.map((r) => r.map(esc).join(","))].join("\n");
      const today = new Date().toISOString().split("T")[0];

      return new Response(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="agents-${today}.csv"`,
        },
      });
    }

    // JSON
    return new Response(JSON.stringify({ data: agents }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="agents-${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  } catch (err: any) {
    console.error("GET export:", err);
    return error("Export failed", 500);
  }
}