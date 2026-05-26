// app/api/admin/agents/bulk/route.ts

import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { success, error } from "@/lib/api-response";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    if (!rateLimit(`bulk-${ip}`, 5).allowed) return error("Too many requests", 429);

    const auth = await requireAdmin();
    if (!auth.authorized) return error(auth.error!, auth.status);

    let body: any;
    try { body = await request.json(); } catch { return error("Invalid JSON", 400); }

    const { ids, action } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) return error("Select at least one agent", 422);
    if (ids.length > 50) return error("Maximum 50 at a time", 422);

    const validActions = ["delete", "activate", "suspend", "deactivate"];
    if (!action || !validActions.includes(action)) {
      return error(`Invalid action. Use: ${validActions.join(", ")}`, 422);
    }

    // Verify all exist
    const existing = await prisma.user.findMany({
      where: { id: { in: ids }, role: "USER" },
      select: { id: true },
    });
    if (existing.length !== ids.length) return error("Some agents not found", 404);

    let result;

    switch (action) {
      case "delete":
        const activeBookings = await prisma.booking.count({
          where: { agentId: { in: ids }, status: { in: ["ON_HOLD", "CONFIRMED"] } },
        });
        if (activeBookings > 0) {
          return error(`Cannot delete. ${activeBookings} active booking(s) exist.`, 400);
        }
        result = await prisma.user.deleteMany({ where: { id: { in: ids }, role: "USER" } });
        break;

      case "activate":
        result = await prisma.user.updateMany({
          where: { id: { in: ids }, role: "USER" },
          data: { status: "ACTIVE", lastActive: new Date() },
        });
        break;

      case "suspend":
        result = await prisma.user.updateMany({
          where: { id: { in: ids }, role: "USER" },
          data: { status: "SUSPENDED", preBookingEnabled: false },
        });
        break;

      case "deactivate":
        result = await prisma.user.updateMany({
          where: { id: { in: ids }, role: "USER" },
          data: { status: "INACTIVE", preBookingEnabled: false },
        });
        break;

      default:
        return error("Unsupported action", 400);
    }

    return success({
      action, count: result.count,
      message: `${result.count} agent(s) ${action}d successfully`,
    });
  } catch (err: any) {
    console.error("POST bulk:", err);
    return error("Bulk action failed", 500);
  }
}