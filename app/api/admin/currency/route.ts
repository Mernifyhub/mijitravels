// app/api/admin/currency/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ─── GET ──────────────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || undefined;

    // ✅ deletedAt নেই — শুধু search filter
    const where: any = {};

    if (search) {
      where.OR = [
        { subdomain:    { contains: search, mode: "insensitive" } },
        { countryName:  { contains: search, mode: "insensitive" } },
        { currencyCode: { contains: search, mode: "insensitive" } },
        { currencyName: { contains: search, mode: "insensitive" } },
      ];
    }

    const rates = await prisma.subdomainCurrency.findMany({
      where,
      orderBy: [
        { isActive:    "desc" },
        { countryName: "asc"  },
      ],
    });

    // USD → SAR base rate
    const usdToSar = await prisma.currencyRate.findFirst({
      where: {
        fromCurrency: "USD",
        toCurrency:   "SAR",
        isActive:     true,
        deletedAt:    null,
      },
    });

    return NextResponse.json({
      rates,
      usdToSar: usdToSar ? Number(usdToSar.sellRate) : 3.75,
      total:    rates.length,
    });
  } catch (error) {
    console.error("[GET /currency]", error);
    return NextResponse.json(
      { error: "Failed to fetch" },
      { status: 500 }
    );
  }
}

// ─── POST ─────────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.subdomain || !body.currencyCode || !body.rate) {
      return NextResponse.json(
        { error: "subdomain, currencyCode, rate required" },
        { status: 400 }
      );
    }

    const rateVal = parseFloat(body.rate);
    if (isNaN(rateVal) || rateVal <= 0) {
      return NextResponse.json(
        { error: "Rate must be a positive number" },
        { status: 400 }
      );
    }

    const subdomain = String(body.subdomain).toLowerCase().trim();

    // ✅ Duplicate check — deletedAt নেই
    const existing = await prisma.subdomainCurrency.findFirst({
      where: { subdomain },
    });

    if (existing) {
      return NextResponse.json(
        { error: `"${subdomain}" already exists. Use edit instead.` },
        { status: 409 }
      );
    }

    const rate = await prisma.subdomainCurrency.create({
      data: {
        subdomain,
        countryName:  body.countryName  || null,
        countryCode:  body.countryCode  || null,
        flag:         body.flag         || null,
        currencyCode: String(body.currencyCode).toUpperCase().trim(),
        currencyName: body.currencyName || null,
        rate:         rateVal,
        isActive:     body.isActive !== false,
        note:         body.note     || null,
      },
    });

    return NextResponse.json(rate, { status: 201 });
  } catch (error) {
    console.error("[POST /currency]", error);
    return NextResponse.json(
      { error: "Failed to create" },
      { status: 500 }
    );
  }
}