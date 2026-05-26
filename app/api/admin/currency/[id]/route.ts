// app/api/admin/currency/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Ctx = {
  params: Promise<{ id: string }> | { id: string };
};

const resolveId = async (ctx: Ctx): Promise<string> => {
  const p = ctx.params instanceof Promise ? await ctx.params : ctx.params;
  return p.id;
};

// ─── PUT ──────────────────────────────────────────────────────────────────────
export async function PUT(req: NextRequest, context: Ctx) {
  try {
    const id = await resolveId(context);
    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    const body = await req.json();

    // ✅ deletedAt নেই
    const existing = await prisma.subdomainCurrency.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const data: Record<string, any> = {};

    if (body.isActive !== undefined) {
      data.isActive = body.isActive === true || body.isActive === "true";
    }

    if (body.rate !== undefined) {
      const rateVal = parseFloat(String(body.rate));
      if (isNaN(rateVal) || rateVal <= 0) {
        return NextResponse.json(
          { error: "Rate must be positive" },
          { status: 400 }
        );
      }
      data.rate = rateVal;
    }

    if (body.countryName  !== undefined) data.countryName  = body.countryName  || null;
    if (body.countryCode  !== undefined) data.countryCode  = body.countryCode  || null;
    if (body.flag         !== undefined) data.flag         = body.flag         || null;
    if (body.currencyCode !== undefined) data.currencyCode = String(body.currencyCode).toUpperCase().trim();
    if (body.currencyName !== undefined) data.currencyName = body.currencyName || null;
    if (body.note         !== undefined) data.note         = body.note         || null;

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const updated = await prisma.subdomainCurrency.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("[PUT /currency/:id]", error?.message);
    return NextResponse.json(
      { error: error?.message || "Failed to update" },
      { status: 500 }
    );
  }
}

// ─── DELETE ───────────────────────────────────────────────────────────────────
export async function DELETE(_req: NextRequest, context: Ctx) {
  try {
    const id = await resolveId(context);
    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    // ✅ deletedAt নেই
    const existing = await prisma.subdomainCurrency.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // ✅ Hard delete — model এ deletedAt নেই তাই
    await prisma.subdomainCurrency.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[DELETE /currency/:id]", error?.message);
    return NextResponse.json(
      { error: error?.message || "Failed to delete" },
      { status: 500 }
    );
  }
}