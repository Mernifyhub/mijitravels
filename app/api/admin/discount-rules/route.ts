import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type   = searchParams.get("type")   || undefined;
    const search = searchParams.get("search") || undefined;

    const rules = await prisma.discountRule.findMany({
      where: {
        deletedAt: null,
        ...(type ? { type } : {}),
        ...(search ? {
          OR: [
            { name:       { contains: search, mode: "insensitive" } },
            { promoCode:  { contains: search, mode: "insensitive" } },
            { airlineCode:{ contains: search, mode: "insensitive" } },
            { origin:     { contains: search, mode: "insensitive" } },
            { destination:{ contains: search, mode: "insensitive" } },
          ],
        } : {}),
      },
      include: {
        agent: {
          select: { id: true, agentName: true, email: true },
        },
        createdBy: {
          select: { id: true, firstName: true, lastName: true },
        },
        _count: { select: { usageLogs: true } },
      },
      orderBy: [
        { priority: "desc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({ success: true, data: rules });
  } catch (error: any) {
    console.error("GET discount-rules error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const rule = await prisma.discountRule.create({
      data: {
        type:            body.type,
        name:            body.name,
        description:     body.description     || null,
        discountType:    body.discountType,
        discountValue:   Number(body.discountValue),
        discountOn:      body.discountOn      || "TOTAL",
        maxDiscount:     body.maxDiscount     ? Number(body.maxDiscount)     : null,
        minFare:         body.minFare         ? Number(body.minFare)         : null,
        airlineCode:     body.airlineCode     || null,
        origin:          body.origin          || null,
        destination:     body.destination     || null,
        routeMatchType:  body.routeMatchType  || "EXACT",
        cabinClass:      body.cabinClass      || null,
        agentId:         body.agentId         || null,
        agentTier:       body.agentTier       || null,
        promoCode:       body.promoCode       || null,
        validFrom:       body.validFrom       ? new Date(body.validFrom) : null,
        validTo:         body.validTo         ? new Date(body.validTo)   : null,
        maxUsageTotal:   body.maxUsageTotal   ? Number(body.maxUsageTotal)   : null,
        maxUsagePerAgent:body.maxUsagePerAgent? Number(body.maxUsagePerAgent): null,
        priority:        Number(body.priority || 10),
        isActive:        body.isActive  ?? true,
        isStackable:     body.isStackable ?? false,
        currency:        body.currency   || "SAR",
        createdById:     body.createdById || null,
      },
    });

    return NextResponse.json({ success: true, data: rule });
  } catch (error: any) {
    console.error("POST discount-rules error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}