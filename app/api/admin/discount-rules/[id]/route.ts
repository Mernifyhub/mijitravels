import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET single
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const rule = await prisma.discountRule.findUnique({
      where: { id },
      include: {
        agent: {
          select: { id: true, agentName: true, email: true, tier: true },
        },
        createdBy: {
          select: { id: true, firstName: true, lastName: true },
        },
        updatedBy: {
          select: { id: true, firstName: true, lastName: true },
        },
        usageLogs: {
          take: 20,
          orderBy: { appliedAt: "desc" },
        },
        _count: { select: { usageLogs: true } },
      },
    });

    if (!rule) {
      return NextResponse.json(
        { success: false, error: "Not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: rule });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT — update
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const rule = await prisma.discountRule.update({
      where: { id },
      data: {
        type:             body.type,
        name:             body.name,
        description:      body.description      || null,
        discountType:     body.discountType,
        discountValue:    Number(body.discountValue),
        discountOn:       body.discountOn        || "TOTAL",
        maxDiscount:      body.maxDiscount       ? Number(body.maxDiscount)      : null,
        minFare:          body.minFare           ? Number(body.minFare)          : null,
        airlineCode:      body.airlineCode       || null,
        origin:           body.origin            || null,
        destination:      body.destination       || null,
        routeMatchType:   body.routeMatchType    || "EXACT",
        cabinClass:       body.cabinClass        || null,
        agentId:          body.agentId           || null,
        agentTier:        body.agentTier         || null,
        promoCode:        body.promoCode         || null,
        validFrom:        body.validFrom         ? new Date(body.validFrom) : null,
        validTo:          body.validTo           ? new Date(body.validTo)   : null,
        maxUsageTotal:    body.maxUsageTotal     ? Number(body.maxUsageTotal)    : null,
        maxUsagePerAgent: body.maxUsagePerAgent  ? Number(body.maxUsagePerAgent) : null,
        priority:         Number(body.priority   || 10),
        isActive:         body.isActive          ?? true,
        isStackable:      body.isStackable       ?? false,
        currency:         body.currency          || "SAR",
        updatedById:      body.updatedById       || null,
      },
    });

    return NextResponse.json({ success: true, data: rule });
  } catch (error: any) {
    console.error("PUT discount-rules error:", error);

    if (error.code === "P2002") {
      return NextResponse.json(
        { success: false, error: "Promo code already exists." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE — soft delete
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.discountRule.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive:  false,
      },
    });

    return NextResponse.json({ success: true, message: "Soft deleted" });
  } catch (error: any) {
    console.error("DELETE discount-rules error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}