// app/api/admin/markups/calculate/route.ts

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { convertCurrency } from "@/lib/currency";
import {
  findBestRule,
  calculateMarkupValue,
  generateRuleKey,
  type MarkupRule,
} from "@/lib/markup";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Input fare — could be any currency
    const inputBaseFare = Number(body.baseFare);
    const inputTotalFare = Number(body.totalFare ?? body.baseFare);
    const inputCurrency = String(body.currency || "USD").toUpperCase();

    const airlineCode = body.airlineCode?.toUpperCase();
    const origin = body.origin?.toUpperCase();
    const destination = body.destination?.toUpperCase();
    const agentId = body.agentId || undefined;

    if (!Number.isFinite(inputBaseFare)) {
      return NextResponse.json(
        { error: "baseFare is required and must be a valid number" },
        { status: 400 }
      );
    }

    // ★ Convert input fare to SAR first
    const baseFareSAR = convertCurrency(inputBaseFare, inputCurrency, "SAR");
    const totalFareSAR = convertCurrency(inputTotalFare, inputCurrency, "SAR");

    const now = new Date();
    const o = origin;
    const d = destination;
    const ac = airlineCode;

    // Build match conditions
    const orConditions: any[] = [];

    if (o && d && agentId) {
      orConditions.push({ type: "ROUTE_AGENT", origin: o, destination: d, agentId, routeMatchType: "EXACT" });
      orConditions.push({ type: "ROUTE_AGENT", origin: o, destination: d, agentId, routeMatchType: "BIDIRECTIONAL" });
      orConditions.push({ type: "ROUTE_AGENT", origin: d, destination: o, agentId, routeMatchType: "BIDIRECTIONAL" });
    }

    if (ac && agentId) {
      orConditions.push({ type: "AIRLINE_AGENT", airlineCode: ac, agentId });
    }

    if (o && d) {
      orConditions.push({ type: "ROUTE", origin: o, destination: d, routeMatchType: "EXACT" });
      orConditions.push({ type: "ROUTE", origin: o, destination: d, routeMatchType: "BIDIRECTIONAL" });
      orConditions.push({ type: "ROUTE", origin: d, destination: o, routeMatchType: "BIDIRECTIONAL" });
    }

    if (agentId) {
      orConditions.push({ type: "AGENT", agentId });
    }

    if (ac) {
      orConditions.push({ type: "AIRLINE", airlineCode: ac });
    }

    orConditions.push({ type: "GLOBAL" });

    // Query
    const matchingRules = await prisma.markup.findMany({
      where: {
        isActive: true,
        deletedAt: null,
        OR: orConditions,
        AND: [
          { OR: [{ validFrom: null }, { validFrom: { lte: now } }] },
          { OR: [{ validTo: null }, { validTo: { gte: now } }] },
        ],
      },
      orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
    });

    if (!matchingRules.length) {
      return NextResponse.json({
        markup: 0,
        currency: "SAR",
        inputFare: { baseFare: inputBaseFare, totalFare: inputTotalFare, currency: inputCurrency },
        convertedFare: { baseFare: baseFareSAR, totalFare: totalFareSAR, currency: "SAR" },
        appliedRule: null,
        totalMatched: 0,
        message: "No matching markup rule found",
      });
    }

    // Best rule
    const bestRule = findBestRule(matchingRules as MarkupRule[]);

    if (!bestRule) {
      return NextResponse.json({
        markup: 0,
        currency: "SAR",
        appliedRule: null,
        totalMatched: matchingRules.length,
        message: "No best rule found",
      });
    }

    // ★ Calculate markup in SAR
    const markupValue = calculateMarkupValue({
      markupAmount: bestRule.markupAmount,
      markupPercent: bestRule.markupPercent,
      markupOn: bestRule.markupOn,
      baseFare: baseFareSAR,
      totalFare: totalFareSAR,
    });

    const ruleKey = generateRuleKey({
      type: bestRule.type,
      airlineCode: bestRule.airlineCode || undefined,
      origin: bestRule.origin || undefined,
      destination: bestRule.destination || undefined,
      agentId: bestRule.agentId || undefined,
    });

    return NextResponse.json({
      markup: markupValue,
      currency: "SAR",
      inputFare: {
        baseFare: inputBaseFare,
        totalFare: inputTotalFare,
        currency: inputCurrency,
      },
      convertedFare: {
        baseFare: baseFareSAR,
        totalFare: totalFareSAR,
        currency: "SAR",
      },
      finalFare: {
        baseFare: bestRule.markupOn === "BASE_FARE"
          ? Math.round(baseFareSAR + markupValue)
          : baseFareSAR,
        totalFare: Math.round(totalFareSAR + markupValue),
        currency: "SAR",
      },
      appliedRule: {
        id: bestRule.id,
        type: bestRule.type,
        ruleKey,
        markupAmount: bestRule.markupAmount,
        markupPercent: bestRule.markupPercent,
        markupOn: bestRule.markupOn,
        markupCurrency: bestRule.markupCurrency || "SAR",
        airlineCode: bestRule.airlineCode,
        origin: bestRule.origin,
        destination: bestRule.destination,
        agentId: bestRule.agentId,
        priority: bestRule.priority,
      },
      totalMatched: matchingRules.length,
      message: `Applied ${bestRule.type} rule — all values in SAR`,
    });
  } catch (error) {
    console.error("[POST /markups/calculate]", error);

    return NextResponse.json(
      { error: "Failed to calculate markup" },
      { status: 500 }
    );
  }
}