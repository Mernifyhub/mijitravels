// app/api/admin/agents/[id]/pre-booking/route.ts

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
    if (!rateLimit(`prebooking-${ip}`, 20).allowed) return error("Too many requests", 429);

    const auth = await requireAdmin();
    if (!auth.authorized) return error(auth.error!, auth.status);

    const { id } = await params;
    let body: any;
    try { body = await request.json(); } catch { return error("Invalid JSON", 400); }

    const { preBookingEnabled } = body;
    if (typeof preBookingEnabled !== "boolean") {
      return error("preBookingEnabled must be boolean", 422);
    }

    const existing = await prisma.user.findUnique({
      where: { id, role: "USER" },
      select: { id: true, status: true, creditLimit: true },
    });
    if (!existing) return error("Agent not found", 404);

    if (preBookingEnabled && existing.status !== "ACTIVE") {
      return error("Only active agents can enable pre-booking", 400);
    }

    if (preBookingEnabled && existing.creditLimit <= 0) {
      return error("Agent needs credit limit for pre-booking", 400);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { preBookingEnabled },
      select: {
        id: true, firstName: true, lastName: true, preBookingEnabled: true,
      },
    });

    return success({
      data: {
        ...updated,
        name: `${updated.firstName} ${updated.lastName}`,
      },
      message: `Pre-booking ${preBookingEnabled ? "enabled" : "disabled"}`,
    });
  } catch (err: any) {
    console.error("PATCH pre-booking:", err);
    return error("Failed to toggle pre-booking", 500);
  }
}