// app/api/admin/agents/[id]/status/route.ts

import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { success, error } from "@/lib/api-response";
import { rateLimit } from "@/lib/rate-limit";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    if (!rateLimit(`status-${ip}`, 20).allowed)
      return error("Too many requests", 429);

    const auth = await requireAdmin();
    if (!auth.authorized) return error(auth.error!, auth.status);

    const { id } = await params;

    let body: any;
    try {
      body = await request.json();
    } catch {
      return error("Invalid JSON", 400);
    }

    const { status } = body;
    const validStatuses = ["ACTIVE", "PENDING", "INACTIVE", "SUSPENDED"];
    if (!validStatuses.includes(status)) {
      return error(`Invalid status. Must be: ${validStatuses.join(", ")}`, 400);
    }

    // ✅ MPA004 বা UUID দুটো দিয়েই খোঁজা
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { id, role: "USER" },
          { agentId: id, role: "USER" },
        ],
      },
      select: { id: true, agentId: true },
    });

    if (!existing) return error("Agent not found", 404);

    const updated = await prisma.user.update({
      where: { id: existing.id }, // ✅ UUID দিয়ে update
      data: { status },
      select: {
        id: true,
        agentId: true,
        firstName: true,
        lastName: true,
        status: true,
        tier: true,
        creditLimit: true,
        expiredLimit: true,
        usedLimit: true,
        commission: true,
        verified: true,
        preBookingEnabled: true,
        lastActive: true,
        createdAt: true,
        email: true,
        phone: true,
        agentName: true,
        agentAddress: true,
        city: true,
        country: true,
      },
    });

    return success({
      data: {
        id: updated.agentId || updated.id,
        internalId: updated.id,
        agentId: updated.agentId,
        name: `${updated.firstName} ${updated.lastName}`,
        firstName: updated.firstName,
        lastName: updated.lastName,
        email: updated.email,
        phone: updated.phone,
        company: updated.agentName,
        address: updated.agentAddress,
        city: updated.city || "",
        country: updated.country || "",
        status: updated.status.toLowerCase(),
        tier: updated.tier.toLowerCase(),
        preBookingEnabled: updated.preBookingEnabled,
        creditLimit: updated.creditLimit,
        usedLimit: updated.usedLimit,
        commission: updated.commission,
        verified: updated.verified,
        expiredLimit: updated.expiredLimit
          ? updated.expiredLimit.toISOString().split("T")[0]
          : "",
        lastActive: updated.lastActive
          .toISOString()
          .replace("T", " ")
          .slice(0, 16),
        joinedDate: updated.createdAt.toISOString().split("T")[0],
      },
      message: `Agent status updated to ${status}`,
    });
  } catch (err: any) {
    console.error("PATCH status:", err);
    return error("Failed to update status", 500);
  }
}