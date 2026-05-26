import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET — list all
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const showDeleted = searchParams.get("showDeleted") === "true";

    const rules = await prisma.discountRule.findMany({
      where: showDeleted ? {} : { deletedAt: null },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
      include: {
        agent: {
          select: { id: true, agentName: true, email: true },
        },
        createdBy: {
          select: { id: true, firstName: true, lastName: true },
        },
        _count: { select: { usageLogs: true } },
      },
    });

    return NextResponse.json({ success: true, data: rules });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST — create
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const rule = await prisma.discountRule.create({
      data: {
        type: body.type,
        name: body.name,
        description: body.description || null,
        discountType: body.discountType,
        discountValue: Number(body.discountValue),
        discountOn: body.discountOn || "TOTAL",
        maxDiscount: body.maxDiscount ? Number(body.maxDiscount) : null,
        minFare: body.minFare ? Number(body.minFare) : null,
        airlineCode: body.airlineCode || null,
        origin: body.origin || null,
        destination: body.destination || null,
        routeMatchType: body.routeMatchType || "EXACT",
        cabinClass: body.cabinClass || null,
        agentId: body.agentId || null,
        agentTier: body.agentTier || null,
        promoCode: body.promoCode || null,
        validFrom: body.validFrom ? new Date(body.validFrom) : null,
        validTo: body.validTo ? new Date(body.validTo) : null,
        maxUsageTotal: body.maxUsageTotal ? Number(body.maxUsageTotal) : null,
        maxUsagePerAgent: body.maxUsagePerAgent ? Number(body.maxUsagePerAgent) : null,
        priority: Number(body.priority || 10),
        isActive: body.isActive ?? true,
        isStackable: body.isStackable ?? false,
        currency: body.currency || "SAR",
        createdById: body.createdById || null,
      },
    });

    return NextResponse.json({ success: true, data: rule });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}