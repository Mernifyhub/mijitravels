// app/api/admin/agents/[id]/route.ts

import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { success, error, validationError } from "@/lib/api-response";
import { validateAgentInput, sanitizeAgentData } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";
import bcrypt from "bcrypt";

interface Params {
  params: Promise<{ id: string }>;
}

// ============================================
// GET /api/admin/agents/:id
// ============================================
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    if (!rateLimit(`agent-get-${ip}`, 60).allowed)
      return error("Too many requests", 429);

    const auth = await requireAdmin();
    if (!auth.authorized) return error(auth.error!, auth.status);

    const { id } = await params;

    // ✅ UUID বা agentId (MPA004) দুটো দিয়েই খোঁজা
    const agent = await prisma.user.findFirst({
      where: {
        OR: [
          { id, role: "USER" },
          { agentId: id, role: "USER" },
        ],
      },
      select: {
        id: true,
        agentId: true,
        firstName: true,
        lastName: true,
        agentName: true,
        agentAddress: true,
        phone: true,
        aviationNumber: true,
        email: true,
        nidCopy: true,
        tradeLicense: true,
        city: true,
        country: true,
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
        updatedAt: true,
        subUsers: {
          select: {
            id: true,
            username: true,
            role: true,
            isActive: true,
            lastLogin: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: { bookings: true, subUsers: true, deposits: true },
        },
      },
    });

    if (!agent) return error("Agent not found", 404);

    const [depSum, bkStats, recentBookings, recentDeposits] =
      await Promise.all([
        prisma.deposit.aggregate({
          where: { userId: agent.id, status: "SUCCESS" },
          _sum: { amount: true },
        }),
        prisma.booking.aggregate({
          where: { agentId: agent.id },
          _sum: { net: true, gross: true, commission: true },
          _count: { id: true },
        }),
        prisma.booking.findMany({
          where: { agentId: agent.id },
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            id: true,
            bookingId: true,
            status: true,
            route: true,
            net: true,
            gross: true,
            bookingDate: true,
            pnr: true,
            carrier: true,
          },
        }),
        prisma.deposit.findMany({
          where: { userId: agent.id },
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            id: true,
            amount: true,
            method: true,
            status: true,
            reference: true,
            createdAt: true,
          },
        }),
      ]);

    const totalDep = depSum._sum.amount || 0;
    const totalNet = bkStats._sum.net || 0;

    return success({
      data: {
        id: agent.agentId || agent.id,
        internalId: agent.id,
        agentId: agent.agentId,
        name: `${agent.firstName} ${agent.lastName}`,
        firstName: agent.firstName,
        lastName: agent.lastName,
        email: agent.email,
        phone: agent.phone,
        company: agent.agentName,
        agentName: agent.agentName,
        address: agent.agentAddress,
        agentAddress: agent.agentAddress,
        city: agent.city || "",
        country: agent.country || "",
        aviationNumber: agent.aviationNumber,
        nidCopy: agent.nidCopy,
        tradeLicense: agent.tradeLicense,
        status: agent.status.toLowerCase(),
        tier: agent.tier.toLowerCase(),
        creditLimit: agent.creditLimit,
        usedLimit: agent.usedLimit,
        commission: agent.commission,
        verified: agent.verified,
        preBookingEnabled: agent.preBookingEnabled,
        lastActive: agent.lastActive
          .toISOString()
          .replace("T", " ")
          .slice(0, 16),
        expiredLimit: agent.expiredLimit
          ? agent.expiredLimit.toISOString().split("T")[0]
          : "",
        joinedDate: agent.createdAt.toISOString().split("T")[0],
        balance: totalDep - totalNet,
        totalDeposits: totalDep,
        totalBookings: bkStats._count.id,
        totalRevenue: bkStats._sum.gross || 0,
        totalNet,
        totalCommission: bkStats._sum.commission || 0,
        staffCount: agent._count.subUsers,
        subUsers: agent.subUsers,
        recentBookings,
        recentDeposits,
      },
    });
  } catch (err: any) {
    console.error("GET /api/admin/agents/[id]:", err);
    return error("Failed to fetch agent", 500);
  }
}

// ============================================
// PUT /api/admin/agents/:id
// ============================================
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    if (!rateLimit(`agent-put-${ip}`, 20).allowed)
      return error("Too many requests", 429);

    const auth = await requireAdmin();
    if (!auth.authorized) return error(auth.error!, auth.status);

    const { id } = await params;

    // ✅ UUID বা agentId (MPA004) দুটো দিয়েই খোঁজা
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { id, role: "USER" },
          { agentId: id, role: "USER" },
        ],
      },
      select: { id: true, email: true },
    });
    if (!existing) return error("Agent not found", 404);

    let body: any;
    try {
      body = await request.json();
    } catch {
      return error("Invalid JSON", 400);
    }

    const errors = validateAgentInput(body, true);
    if (errors.length > 0) return validationError(errors);

    const s = sanitizeAgentData(body);

    if (s.email && s.email !== existing.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: s.email },
        select: { id: true },
      });
      if (emailExists) return error("Email already exists", 409);
    }

    const update: any = {};
    if (s.firstName) update.firstName = s.firstName;
    if (s.lastName) update.lastName = s.lastName;
    if (s.agentName) update.agentName = s.agentName;
    if (s.agentAddress) update.agentAddress = s.agentAddress;
    if (s.phone) update.phone = s.phone;
    if (s.aviationNumber) update.aviationNumber = s.aviationNumber;
    if (s.email) update.email = s.email;
    if (s.nidCopy !== undefined) update.nidCopy = s.nidCopy;
    if (s.tradeLicense !== undefined) update.tradeLicense = s.tradeLicense;
    if (s.city !== undefined) update.city = s.city;
    if (s.country !== undefined) update.country = s.country;
    if (body.creditLimit !== undefined) update.creditLimit = Number(body.creditLimit);
    if (body.commission !== undefined) update.commission = Number(body.commission);
    if (body.emergencyLimit !== undefined) update.emergencyLimit = Number(body.emergencyLimit);
    if (body.staffCount !== undefined) update.staffCount = Number(body.staffCount);
    if (body.preBookingEnabled !== undefined) update.preBookingEnabled = Boolean(body.preBookingEnabled);
    if (body.emergencyExpiry !== undefined) {
      update.emergencyExpiry = body.emergencyExpiry
        ? new Date(body.emergencyExpiry)
        : null;
    }
    if (body.tier) {
      const tierMap: Record<string, any> = {
        bronze: "BRONZE", silver: "SILVER",
        gold: "GOLD", platinum: "PLATINUM",
      };
      if (tierMap[body.tier?.toLowerCase()])
        update.tier = tierMap[body.tier.toLowerCase()];
    }
    if (s.password && s.password.length >= 6) {
      update.password = await bcrypt.hash(s.password, 12);
    }

    if (Object.keys(update).length === 0)
      return error("No valid fields to update", 400);

    // ✅ UUID দিয়ে update
    const updated = await prisma.user.update({
      where: { id: existing.id },
      data: update,
      select: {
        id: true,
        agentId: true,
        firstName: true,
        lastName: true,
        agentName: true,
        agentAddress: true,
        phone: true,
        aviationNumber: true,
        email: true,
        city: true,
        country: true,
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
        updatedAt: true,
        nidCopy: true,
        tradeLicense: true,
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
        creditLimit: updated.creditLimit,
        expiredLimit: updated.expiredLimit,
        usedLimit: updated.usedLimit,
        commission: updated.commission,
        verified: updated.verified,
        preBookingEnabled: updated.preBookingEnabled,
        lastActive: updated.lastActive
          .toISOString()
          .replace("T", " ")
          .slice(0, 16),
        joinedDate: updated.createdAt.toISOString().split("T")[0],
        nidCopy: updated.nidCopy,
        tradeLicense: updated.tradeLicense,
      },
      message: "Agent updated successfully",
    });
  } catch (err: any) {
    console.error("PUT /api/admin/agents/[id]:", err);
    if (err.code === "P2002") return error("Email already exists", 409);
    return error("Failed to update agent", 500);
  }
}

// ============================================
// DELETE /api/admin/agents/:id
// ============================================
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    if (!rateLimit(`agent-del-${ip}`, 10).allowed)
      return error("Too many requests", 429);

    const auth = await requireAdmin();
    if (!auth.authorized) return error(auth.error!, auth.status);

    const { id } = await params;

    // ✅ UUID বা agentId (MPA004) দুটো দিয়েই খোঁজা
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { id, role: "USER" },
          { agentId: id, role: "USER" },
        ],
      },
      select: { id: true, firstName: true, lastName: true },
    });
    if (!existing) return error("Agent not found", 404);

    const activeBookings = await prisma.booking.count({
      where: {
        agentId: existing.id,
        status: { in: ["ON_HOLD", "CONFIRMED"] },
      },
    });
    if (activeBookings > 0) {
      return error(
        `Cannot delete. ${activeBookings} active booking(s) exist.`,
        400
      );
    }

    const pendingDeposits = await prisma.deposit.count({
      where: { userId: existing.id, status: "PENDING" },
    });
    if (pendingDeposits > 0) {
      return error(
        `Cannot delete. ${pendingDeposits} pending deposit(s) exist.`,
        400
      );
    }

    // ✅ UUID দিয়ে delete
    await prisma.user.delete({ where: { id: existing.id } });

    return success({
      message: `Agent "${existing.firstName} ${existing.lastName}" deleted`,
      deletedId: existing.id,
    });
  } catch (err: any) {
    console.error("DELETE /api/admin/agents/[id]:", err);
    return error("Failed to delete agent", 500);
  }
}