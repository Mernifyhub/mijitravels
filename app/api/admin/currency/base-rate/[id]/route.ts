// app/api/admin/currency/base-rates/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Ctx = {
  params: Promise<{ id: string }> | { id: string };
};

const resolveId = async (ctx: Ctx): Promise<string> => {
  const p = ctx.params instanceof Promise ? await ctx.params : ctx.params;
  return p.id;
};

// GET single base rate
export async function GET(_req: NextRequest, context: Ctx) {
  try {
    const id = await resolveId(context);

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const rate = await prisma.currencyRate.findFirst({
      where: {
        id,
        toCurrency: "SAR",
        deletedAt: null,
      },
    });

    if (!rate) {
      return NextResponse.json({ error: "Rate not found" }, { status: 404 });
    }

    return NextResponse.json(rate);
  } catch (error: any) {
    console.error("[GET /base-rates/:id]", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch" },
      { status: 500 }
    );
  }
}

// PUT update/toggle base rate
export async function PUT(req: NextRequest, context: Ctx) {
  try {
    const id = await resolveId(context);

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const body = await req.json();

    const existing = await prisma.currencyRate.findFirst({
      where: {
        id,
        toCurrency: "SAR",
        deletedAt: null,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Rate not found" }, { status: 404 });
    }

    const data: Record<string, any> = {};

    if (body.buyRate !== undefined) {
      const buyRate = parseFloat(String(body.buyRate));
      if (isNaN(buyRate) || buyRate <= 0) {
        return NextResponse.json({ error: "Invalid buy rate" }, { status: 400 });
      }
      data.buyRate = buyRate;
    }

    if (body.sellRate !== undefined) {
      const sellRate = parseFloat(String(body.sellRate));
      if (isNaN(sellRate) || sellRate <= 0) {
        return NextResponse.json({ error: "Invalid sell rate" }, { status: 400 });
      }
      data.sellRate = sellRate;
    }

    if (body.countryName !== undefined) data.countryName = body.countryName || null;
    if (body.countryCode !== undefined) data.countryCode = body.countryCode || null;
    if (body.flag !== undefined) data.flag = body.flag || null;
    if (body.isActive !== undefined) data.isActive = body.isActive === true || body.isActive === "true";

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const updated = await prisma.currencyRate.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("[PUT /base-rates/:id]", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update" },
      { status: 500 }
    );
  }
}

// DELETE base rate (soft delete)
export async function DELETE(_req: NextRequest, context: Ctx) {
  try {
    const id = await resolveId(context);

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const existing = await prisma.currencyRate.findFirst({
      where: {
        id,
        toCurrency: "SAR",
        deletedAt: null,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Rate not found" }, { status: 404 });
    }

    await prisma.currencyRate.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[DELETE /base-rates/:id]", error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete" },
      { status: 500 }
    );
  }
}