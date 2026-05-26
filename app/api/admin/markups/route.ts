// app/api/admin/markups/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - List markups
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const search = searchParams.get("search");

    const where: any = {};

    if (type) {
      where.type = type;
    }

    if (search) {
      where.OR = [
        { airlineCode: { contains: search, mode: "insensitive" } },
        { airlineName: { contains: search, mode: "insensitive" } },
        { origin: { contains: search, mode: "insensitive" } },
        { destination: { contains: search, mode: "insensitive" } },
        { note: { contains: search, mode: "insensitive" } },
      ];
    }

    const markups = await prisma.markup.findMany({
      where,
      include: {
        agent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            agentName: true,
            email: true,
          },
        },
      },
      orderBy: [
        { priority: "desc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({ markups });
  } catch (error: any) {
    console.error("GET /api/admin/markups error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch markups" },
      { status: 500 }
    );
  }
}

// POST - Create markup
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("POST /api/admin/markups body:", body);

    const {
      type,
      airlineCode,
      airlineName,
      origin,
      destination,
      routeMatchType,
      agentId,
      markupAmount,
      markupPercent,
      markupOn,
      isActive,
      priority,
      validFrom,
      validTo,
      note,
      createdById,
    } = body;

    // Validation
    if (!type) {
      return NextResponse.json(
        { error: "Type is required" },
        { status: 400 }
      );
    }

    if (!markupAmount && !markupPercent) {
      return NextResponse.json(
        { error: "Amount or Percent is required" },
        { status: 400 }
      );
    }

    const markup = await prisma.markup.create({
      data: {
        type,
        airlineCode: airlineCode || null,
        airlineName: airlineName || null,
        origin: origin || null,
        destination: destination || null,
        routeMatchType: routeMatchType || "EXACT",
        agentId: agentId || null,
        markupAmount: markupAmount ? parseFloat(markupAmount) : 0,
        markupPercent: markupPercent ? parseFloat(markupPercent) : 0,
        markupOn: markupOn || "BASE_FARE",
        markupCurrency: body.markupCurrency || "SAR",  // ← NEW
        isActive: isActive !== false,
        priority: priority ? parseInt(priority) : 0,
        validFrom: validFrom ? new Date(validFrom) : null,
        validTo: validTo ? new Date(validTo) : null,
        note: note || null,
        createdById: createdById || null,
      },
      include: {
        agent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            agentName: true,
          },
        },
      },
    });

    console.log("✅ Markup created:", markup.id);
    return NextResponse.json({ markup }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/admin/markups error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create markup" },
      { status: 500 }
    );
  }
}