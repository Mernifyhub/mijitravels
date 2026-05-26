// app/api/admin/markups/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// type RouteContext = { params: Promise<{ id : string}>};
// type RouteContext = { params: Promise<{id: string}>};

// ✅ Next.js 15: params is now async
type RouteContext = { params: Promise<{ id: string }> };
/*export aync function GET(req: NextRequest, context: RoteContext) {
const {id} = await context.params;
console.log(id);
})*/

// GET - Single markup
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params; // ✅ await করতে হবে
    console.log("GET markup id:", id);

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const markup = await prisma.markup.findUnique({
      where: { id },
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
    });

    if (!markup) {
      return NextResponse.json({ error: "Markup not found" }, { status: 404 });
    }

    return NextResponse.json({ markup });
  } catch (error: any) {
    console.error("GET markup error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch markup" },
      { status: 500 }
    );
  }
}

// PUT - Update markup
export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params; // ✅ await করতে হবে
    console.log("PUT markup id:", id);

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const body = await req.json();
    console.log("PUT markup body:", body);

    // ✅ findUnique আগে check করো exists কিনা
    const existing = await prisma.markup.findUnique({
      where: { id }, // এখন id defined থাকবে
    });

    if (!existing) {
      return NextResponse.json({ error: "Markup not found" }, { status: 404 });
    }

    // Build update data
    const updateData: any = {};

    if (body.type !== undefined)           updateData.type = body.type;
    if (body.airlineCode !== undefined)    updateData.airlineCode = body.airlineCode || null;
    if (body.airlineName !== undefined)    updateData.airlineName = body.airlineName || null;
    if (body.origin !== undefined)         updateData.origin = body.origin || null;
    if (body.destination !== undefined)    updateData.destination = body.destination || null;
    if (body.routeMatchType !== undefined) updateData.routeMatchType = body.routeMatchType;
    if (body.agentId !== undefined)        updateData.agentId = body.agentId || null;
    if (body.markupOn !== undefined)       updateData.markupOn = body.markupOn;
    if (body.isActive !== undefined)       updateData.isActive = Boolean(body.isActive);
    if (body.note !== undefined)           updateData.note = body.note || null;
    if (body.updatedById !== undefined)    updateData.updatedById = body.updatedById || null;

    if (body.markupAmount !== undefined) {
      updateData.markupAmount = body.markupAmount
        ? parseFloat(String(body.markupAmount))
        : 0;
    }
    if (body.markupPercent !== undefined) {
      updateData.markupPercent = body.markupPercent
        ? parseFloat(String(body.markupPercent))
        : 0;
    }
    if (body.priority !== undefined) {
      updateData.priority = parseInt(String(body.priority)) || 0;
    }
    if (body.validFrom !== undefined) {
      updateData.validFrom = body.validFrom ? new Date(body.validFrom) : null;
    }
    if (body.validTo !== undefined) {
      updateData.validTo = body.validTo ? new Date(body.validTo) : null;
    }

    console.log("Update data:", updateData);

    const markup = await prisma.markup.update({
      where: { id },
      data: updateData,
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

    console.log("✅ Markup updated:", markup.id);
    return NextResponse.json({ markup });
  } catch (error: any) {
    console.error("PUT markup error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update markup" },
      { status: 500 }
    );
  }
}

// DELETE - Delete markup
export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params; // ✅ await করতে হবে
    console.log("DELETE markup id:", id);

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const existing = await prisma.markup.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Markup not found" }, { status: 404 });
    }

    await prisma.markup.delete({ where: { id } });

    console.log("✅ Markup deleted:", id);
    return NextResponse.json({
      success: true,
      message: "Deleted successfully",
    });
  } catch (error: any) {
    console.error("DELETE markup error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete markup" },
      { status: 500 }
    );
  }
}

// PATCH - Quick update (toggle active etc)
export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params; // ✅ await করতে হবে
    const body = await req.json();

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const markup = await prisma.markup.update({
      where: { id },
      data: body,
    });

    return NextResponse.json({ markup });
  } catch (error: any) {
    console.error("PATCH markup error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to patch markup" },
      { status: 500 }
    );
  }
}