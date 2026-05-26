// app/api/admin/currency/convert/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { amount, fromCurrency, subdomain } = await req.json();

    if (!amount || !fromCurrency) {
      return NextResponse.json(
        { error: "amount and fromCurrency are required" },
        { status: 400 }
      );
    }

    const from = fromCurrency.toUpperCase();

    // ===== STEP 1: Convert to SAR =====
    let amountSAR = 0;
    let rateToSAR = 1;

    if (from === "SAR") {
      // Already SAR, no conversion needed
      amountSAR = amount;
      rateToSAR = 1;
    } else {
      // Find rate: fromCurrency → SAR
      const rate = await prisma.currencyRate.findFirst({
        where: {
          fromCurrency: from,
          toCurrency: "SAR",
          isActive: true,
          deletedAt: null,
        },
      });

      if (!rate) {
        return NextResponse.json(
          { error: `No rate found for ${from} → SAR` },
          { status: 404 }
        );
      }

      rateToSAR = Number(rate.sellRate);
      amountSAR = Math.round(amount * rateToSAR * 100) / 100;
    }

    // ===== STEP 2: Convert SAR → Local =====

    // If specific subdomain requested
    if (subdomain) {
      const subConfig = await prisma.subdomainCurrency.findUnique({
        where: { subdomain: subdomain.toLowerCase() },
      });

      if (!subConfig || !subConfig.isActive) {
        return NextResponse.json({
          fromCurrency: from,
          amount,
          amountSAR,
          rateToSAR,
          local: null,
          message: `No active rate for subdomain: ${subdomain}`,
        });
      }

      const sarToLocal = Number(subConfig.rate);
      const amountLocal = Math.round(amountSAR * sarToLocal * 100) / 100;

      return NextResponse.json({
        fromCurrency: from,
        amount,
        amountSAR,
        rateToSAR,
        amountLocal,
        sarToLocalRate: sarToLocal,
        currency: subConfig.currencyCode,
        country: subConfig.countryName,
        flag: subConfig.flag,
        subdomain: subConfig.subdomain,
      });
    }

    // If no subdomain → return all conversions
    const allSubs = await prisma.subdomainCurrency.findMany({
      where: { isActive: true },
      orderBy: { countryName: "asc" },
    });

    const conversions = allSubs.map((sub) => ({
      subdomain: sub.subdomain,
      country: sub.countryName,
      flag: sub.flag,
      currency: sub.currencyCode,
      rate: Number(sub.rate),
      amountLocal: Math.round(amountSAR * Number(sub.rate) * 100) / 100,
    }));

    return NextResponse.json({
      fromCurrency: from,
      amount,
      amountSAR,
      rateToSAR,
      conversions,
    });
  } catch (error) {
    console.error("[POST /currency/convert]", error);
    return NextResponse.json({ error: "Failed to convert" }, { status: 500 });
  }
}