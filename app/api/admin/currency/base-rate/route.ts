import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const rates = await prisma.currencyRate.findMany({
      where: {
        toCurrency: "SAR",
        deletedAt:  null,
      },
      orderBy: { fromCurrency: "asc" },
    });
    return NextResponse.json({ rates });
  } catch (error: any) {
    console.error("[GET /base-rates]", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("[POST /base-rates] body:", body);

    if (!body.fromCurrency || !body.buyRate || !body.sellRate) {
      return NextResponse.json(
        { error: "fromCurrency, buyRate, sellRate required" },
        { status: 400 }
      );
    }

    const fromCurrency = String(body.fromCurrency).toUpperCase().trim();
    const buyRate      = parseFloat(String(body.buyRate));
    const sellRate     = parseFloat(String(body.sellRate));

    if (isNaN(buyRate)  || buyRate  <= 0) return NextResponse.json({ error: "Invalid buy rate"  }, { status: 400 });
    if (isNaN(sellRate) || sellRate <= 0) return NextResponse.json({ error: "Invalid sell rate" }, { status: 400 });

    const existing = await prisma.currencyRate.findFirst({
      where: { fromCurrency, toCurrency: "SAR", deletedAt: null },
    });

    if (existing) {
      return NextResponse.json(
        { error: `${fromCurrency} already exists` },
        { status: 409 }
      );
    }

    const rate = await prisma.currencyRate.create({
      data: {
        fromCurrency,
        toCurrency:  "SAR",
        countryName: body.countryName || null,
        countryCode: body.countryCode || null,
        flag:        body.flag        || null,
        buyRate,
        sellRate,
        isActive:    body.isActive !== false,
        createdById: body.createdById || null,
      },
    });

    return NextResponse.json(rate, { status: 201 });
  } catch (error: any) {
    console.error("[POST /base-rates] ERROR:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to save" },
      { status: 500 }
    );
  }
}