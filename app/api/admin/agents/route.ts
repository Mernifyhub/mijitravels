// app/api/admin/agents/route.ts

import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { success, error, validationError } from "@/lib/api-response";
import { validateAgentInput, sanitizeAgentData } from "@/lib/validation";
import { generateAgentId } from "@/lib/generate-agent-id";
import { rateLimit } from "@/lib/rate-limit";
import { calculateAgentBalance } from "@/lib/balance";
import bcrypt from "bcrypt";

export async function GET(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    if (!rateLimit(`agents-get-${ip}`, 60).allowed) {
      return error("Too many requests", 429);
    }

    const auth = await requireAdmin();
    if (!auth.authorized) return error(auth.error!, auth.status);

    const { searchParams } = new URL(request.url);
    const page = Math.max(
      1,
      parseInt(searchParams.get("page") || "1")
    );
    const pageSize = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("pageSize") || "10"))
    );
    const search = searchParams.get("search")?.trim() || "";
    const statusParam = searchParams.get("status") || "";
    const tierParam = searchParams.get("tier") || "";
    const countryParam = searchParams.get("country") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = (searchParams.get("sortOrder") || "desc") as
      | "asc"
      | "desc";

    const where: any = { role: "USER" };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { agentName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
        { aviationNumber: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
        { country: { contains: search, mode: "insensitive" } },
      ];
    }

    if (statusParam) {
      const statusMap: Record<string, string> = {
        active: "ACTIVE",
        pending: "PENDING",
        inactive: "INACTIVE",
        suspended: "SUSPENDED",
      };
      if (statusMap[statusParam]) where.status = statusMap[statusParam];
    }

    if (tierParam) {
      const tierMap: Record<string, string> = {
        bronze: "BRONZE",
        silver: "SILVER",
        gold: "GOLD",
        platinum: "PLATINUM",
      };
      if (tierMap[tierParam]) where.tier = tierMap[tierParam];
    }

    if (countryParam) where.country = countryParam;

    const validSorts = [
      "firstName", "lastName", "agentName", "email", "phone",
      "country", "status", "tier", "creditLimit", "commission",
      "createdAt", "updatedAt", "lastActive",
    ];
    const orderField = validSorts.includes(sortBy)
      ? sortBy
      : "createdAt";

    // Fetch agents
    const [agents, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { [orderField]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
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
          _count: {
            select: {
              bookings: true,
              subUsers: true,
              deposits: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    const agentIds = agents.map((a) => a.id);

    // ✅ Balance + booking stats parallel
    const [balanceResults, bookingStats] = await Promise.all([
      // ✅ Same formula as dashboard & ledger
      Promise.all(agents.map((a) => calculateAgentBalance(a.id))),

      // Booking stats for revenue
      prisma.booking.groupBy({
        by: ["agentId"],
        where: { agentId: { in: agentIds } },
        _sum: { gross: true, net: true, commission: true },
        _count: { id: true },
      }),
    ]);

    const balanceMap = new Map(
      agents.map((a, i) => [a.id, balanceResults[i]])
    );

    const bookingMap = new Map(
      bookingStats.map((b) => [
        b.agentId,
        {
          count: b._count.id,
          net: b._sum.net || 0,
          gross: b._sum.gross || 0,
          comm: b._sum.commission || 0,
        },
      ])
    );

    // Format
    const formatted = agents.map((a) => {
      const balData = balanceMap.get(a.id) || {
        balance: 0,
        totalDeposits: 0,
        totalBookings: 0,
        manualEffect: 0,
      };
      const bk = bookingMap.get(a.id) || {
        count: 0,
        net: 0,
        gross: 0,
        comm: 0,
      };

      return {
        id: a.id,
        agentId: a.agentId,
        internalId: a.id,
        name: `${a.firstName} ${a.lastName}`,
        firstName: a.firstName,
        lastName: a.lastName,
        email: a.email,
        phone: a.phone,
        company: a.agentName,
        agentName: a.agentName,
        address: a.agentAddress,
        agentAddress: a.agentAddress,
        city: a.city || "",
        country: a.country || "",
        aviationNumber: a.aviationNumber,
        nidCopy: a.nidCopy,
        tradeLicense: a.tradeLicense,
        status: a.status.toLowerCase(),
        tier: a.tier.toLowerCase(),
        creditLimit: a.creditLimit,
        usedLimit: a.usedLimit,
        commission: a.commission,
        verified: a.verified,
        expiredLimit: a.expiredLimit
          ? a.expiredLimit.toISOString().split("T")[0]
          : "",
        preBookingEnabled: a.preBookingEnabled,
        lastActive: a.lastActive
          .toISOString()
          .replace("T", " ")
          .slice(0, 16),
        joinedDate: a.createdAt.toISOString().split("T")[0],
        createdAt: a.createdAt.toISOString(),
        updatedAt: a.updatedAt.toISOString(),
        // ✅ Correct balance - same as dashboard & ledger
        balance: balData.balance,
        totalDeposits: balData.totalDeposits,
        totalBookings: bk.count,
        totalRevenue: bk.gross,
        staffCount: a._count.subUsers,
      };
    });

    // Stats
    const [statusGroups, totalAgents] = await Promise.all([
      prisma.user.groupBy({
        by: ["status"],
        where: { role: "USER" },
        _count: { id: true },
      }),
      prisma.user.count({ where: { role: "USER" } }),
    ]);

    const sc: Record<string, number> = {};
    statusGroups.forEach((g) => {
      sc[g.status] = g._count.id;
    });

    const stats = {
      total: totalAgents,
      active: sc["ACTIVE"] || 0,
      pending: sc["PENDING"] || 0,
      suspended: sc["SUSPENDED"] || 0,
      inactive: sc["INACTIVE"] || 0,
      totalBalance: formatted.reduce((s, a) => s + a.balance, 0),
      totalRevenue: formatted.reduce((s, a) => s + a.totalRevenue, 0),
    };

    return success({
      data: formatted,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      stats,
    });
  } catch (err: any) {
    console.error("GET /api/admin/agents:", err);
    return error("Failed to fetch agents", 500);
  }
}

// POST function same as before
export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    if (!rateLimit(`agents-post-${ip}`, 10).allowed)
      return error("Too many requests", 429);

    const auth = await requireAdmin();
    if (!auth.authorized) return error(auth.error!, auth.status);

    let body: any;
    try {
      body = await request.json();
    } catch {
      return error("Invalid JSON", 400);
    }

    const errors = validateAgentInput(body, false);
    if (errors.length > 0) return validationError(errors);

    const s = sanitizeAgentData(body);

    const exists = await prisma.user.findUnique({
      where: { email: s.email },
      select: { id: true },
    });
    if (exists) return error("Email already exists", 409);

    const hashedPw = await bcrypt.hash(s.password, 12);
    const agentId = await generateAgentId();

    const tierMap: Record<string, any> = {
      bronze: "BRONZE",
      silver: "SILVER",
      gold: "GOLD",
      platinum: "PLATINUM",
    };

    const agent = await prisma.user.create({
      data: {
        agentId,
        firstName: s.firstName,
        lastName: s.lastName,
        agentName: s.agentName || "",
        agentAddress: s.agentAddress || "",
        phone: s.phone,
        aviationNumber: s.aviationNumber || "",
        email: s.email,
        password: hashedPw,
        role: "USER",
        nidCopy: s.nidCopy || "",
        tradeLicense: s.tradeLicense || "",
        city: s.city || body.city || "",
        country: s.country || body.country || "",
        status: "PENDING",
        tier: tierMap[body.tier?.toLowerCase()] || "BRONZE",
        creditLimit: Number(body.creditLimit) || 50000,
        commission: Number(body.commission) || 5,
        expiredLimit: body.expiredLimit
          ? new Date(body.expiredLimit)
          : null,
        preBookingEnabled: Boolean(body.preBookingEnabled),
        verified: false,
        lastActive: new Date(),
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
        city: true,
        country: true,
        status: true,
        tier: true,
        creditLimit: true,
        usedLimit: true,
        commission: true,
        verified: true,
        expiredLimit: true,
        preBookingEnabled: true,
        lastActive: true,
        createdAt: true,
        updatedAt: true,
        nidCopy: true,
        tradeLicense: true,
      },
    });

    return success(
      {
        data: {
          ...agent,
          internalId: agent.id,
          id: agent.agentId || agent.id,
          name: `${agent.firstName} ${agent.lastName}`,
          company: agent.agentName,
          address: agent.agentAddress,
          status: agent.status.toLowerCase(),
          tier: agent.tier.toLowerCase(),
          expiredLimit: agent.expiredLimit
            ? agent.expiredLimit.toISOString().split("T")[0]
            : "",
          lastActive: agent.lastActive
            .toISOString()
            .replace("T", " ")
            .slice(0, 16),
          joinedDate: agent.createdAt.toISOString().split("T")[0],
          balance: 0,
          totalDeposits: 0,
          totalBookings: 0,
          totalRevenue: 0,
          staffCount: 0,
        },
        message: "Agent created successfully",
      },
      201
    );
  } catch (err: any) {
    console.error("POST /api/admin/agents:", err);
    if (err.code === "P2002")
      return error("Email already exists", 409);
    return error("Failed to create agent", 500);
  }
}