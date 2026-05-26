// lib/discount.ts

import { prisma } from "@/lib/prisma";
import type { NormalizedFlight } from "@/lib/normalizers/types";

// ==========================================
// Types
// ==========================================

export interface DiscountContext {
  airlineCode?:  string;
  origin?:       string;
  destination?:  string;
  cabinClass?:   string;
  agentId?:      string;
  agentTier?:    string;
  promoCode?:    string;
  fareAmount:    number;
  baseFare:      number;
  currency:      string;
}

export interface AppliedDiscount {
  ruleId:           string;
  ruleName:         string;
  ruleType:         string;
  discountType:     "FLAT" | "PERCENT";
  discountValue:    number;
  discountOn:       "BASE_FARE" | "TOTAL";
  calculatedAmount: number;
  promoCode:        string | null;
  isStackable:      boolean;
}

export interface DiscountResult {
  discounts:     AppliedDiscount[];
  totalDiscount: number;
  hasPromo:      boolean;
  labels:        string[];
}

interface AgentInfo {
  agentId:   string | null;
  agentTier: string | null;
}

const EMPTY_RESULT: DiscountResult = {
  discounts:     [],
  totalDiscount: 0,
  hasPromo:      false,
  labels:        [],
};

// ==========================================
// String Helpers
// ==========================================

function n(val: unknown): string {
  return String(val ?? "").trim();
}

function nUp(val: unknown): string {
  return n(val).toUpperCase();
}

// ==========================================
// Agent Target Matching
// ==========================================

function matchesAgentTarget(rule: any, ctx: DiscountContext): boolean {
  const hasAgentId   = !!n(rule.agentId);
  const hasAgentTier = !!n(rule.agentTier);

  if (!hasAgentId && !hasAgentTier) return false;

  if (hasAgentId) {
    if (!ctx.agentId) return false;
    if (n(rule.agentId) !== n(ctx.agentId)) return false;
  }

  if (hasAgentTier) {
    if (!ctx.agentTier) return false;
    if (nUp(rule.agentTier) !== nUp(ctx.agentTier)) return false;
  }

  return true;
}

// ==========================================
// Route Matching
// ==========================================

function matchesRoute(
  rule:        any,
  origin?:     string,
  destination?: string
): boolean {
  if (!rule.origin || !rule.destination) return false;
  if (!origin || !destination)           return false;

  const rO = nUp(rule.origin);
  const rD = nUp(rule.destination);
  const cO = nUp(origin);
  const cD = nUp(destination);

  if (nUp(rule.routeMatchType) === "BIDIRECTIONAL") {
    return (rO === cO && rD === cD) || (rO === cD && rD === cO);
  }

  return rO === cO && rD === cD;
}

// ==========================================
// Fetch Active Rules
// ==========================================

async function fetchActiveRules() {
  const now = new Date();

  const rules = await prisma.discountRule.findMany({
    where: {
      isActive:  true,
      deletedAt: null,
    },
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
  });

  const filtered = rules.filter((rule) => {
    const fromOk = !rule.validFrom || new Date(rule.validFrom) <= now;
    const toOk   = !rule.validTo   || new Date(rule.validTo)   >= now;

    if (!fromOk || !toOk) {
      console.log(`⏰ Rule "${rule.name}" excluded by date:`, {
        validFrom: rule.validFrom,
        validTo:   rule.validTo,
        fromOk,
        toOk,
        now:       now.toISOString(),
      });
    }

    return fromOk && toOk;
  });

  console.log(
    `📋 Discount rules: ${filtered.length} active (${rules.length} total)`
  );

  return filtered;
}

// ==========================================
// Rule Matching
// ==========================================

function matchesRule(rule: any, ctx: DiscountContext): boolean {
  if (rule.minFare && ctx.fareAmount < Number(rule.minFare)) return false;

  if (rule.maxUsageTotal && rule.currentUsage >= Number(rule.maxUsageTotal)) {
    return false;
  }

  if (rule.cabinClass) {
    if (!ctx.cabinClass) return false;
    if (nUp(rule.cabinClass) !== nUp(ctx.cabinClass)) return false;
  }

  if (rule.type === "PROMO") {
    if (!rule.promoCode) return false;
    if (!ctx.promoCode)  return false;
    if (nUp(rule.promoCode) !== nUp(ctx.promoCode)) return false;
  }

  switch (rule.type) {
    case "GLOBAL":
      return true;

    case "AIRLINE":
      return !!(
        rule.airlineCode &&
        ctx.airlineCode &&
        nUp(rule.airlineCode) === nUp(ctx.airlineCode)
      );

    case "ROUTE":
      return matchesRoute(rule, ctx.origin, ctx.destination);

    case "AGENT": {
      const matched = matchesAgentTarget(rule, ctx);
      console.log(`🔎 Rule "${rule.name}" [AGENT]:`, {
        ruleAgentId:   n(rule.agentId),
        ctxAgentId:    n(ctx.agentId),
        ruleAgentTier: rule.agentTier,
        ctxAgentTier:  ctx.agentTier,
        matched,
      });
      return matched;
    }

    case "AIRLINE_AGENT": {
      const airlineMatch = !!(
        rule.airlineCode &&
        ctx.airlineCode &&
        nUp(rule.airlineCode) === nUp(ctx.airlineCode)
      );
      const agentMatch = matchesAgentTarget(rule, ctx);
      const matched    = airlineMatch && agentMatch;
      console.log(`🔎 Rule "${rule.name}" [AIRLINE_AGENT]:`, {
        airlineMatch, agentMatch, matched,
      });
      return matched;
    }

    case "ROUTE_AGENT": {
      const routeMatch = matchesRoute(rule, ctx.origin, ctx.destination);
      const agentMatch = matchesAgentTarget(rule, ctx);
      const matched    = routeMatch && agentMatch;
      console.log(`🔎 Rule "${rule.name}" [ROUTE_AGENT]:`, {
        routeMatch, agentMatch, matched,
      });
      return matched;
    }

    case "PROMO":
      return true;

    case "CAMPAIGN":
      return true;

    default:
      return false;
  }
}

// ==========================================
// Calculate Discount Amount (already in SAR)
// ==========================================

function calculateAmount(rule: any, ctx: DiscountContext): number {
  const applyOn =
    rule.discountOn === "BASE_FARE" ? ctx.baseFare : ctx.fareAmount;

  let amount = 0;

  if (rule.discountType === "FLAT") {
    amount = Number(rule.discountValue);
  } else if (rule.discountType === "PERCENT") {
    amount = (applyOn * Number(rule.discountValue)) / 100;
    if (rule.maxDiscount && amount > Number(rule.maxDiscount)) {
      amount = Number(rule.maxDiscount);
    }
  }

  return Math.round(Math.max(0, amount) * 100) / 100;
}

// ==========================================
// Build Discount Context from Flight (already in SAR)
// ==========================================

export function buildDiscountContext(
  flight: NormalizedFlight,
  agent:  AgentInfo
): DiscountContext {
  const segments = flight.itineraries?.[0]?.segments ?? [];
  const firstSeg = segments[0];
  const lastSeg  = segments[segments.length - 1];

  return {
    airlineCode:  firstSeg?.carrierCode           || "",
    origin:       firstSeg?.departure?.iataCode   || "",
    destination:  lastSeg?.arrival?.iataCode      || "",
    cabinClass:   firstSeg?.cabinName?.toLowerCase() || "economy",
    agentId:      agent.agentId   || undefined,
    agentTier:    agent.agentTier || undefined,
    fareAmount:   Number(
      flight.priceBreakdown?.agentUi?.grandTotal ||
      flight.price?.grandTotal ||
      0
    ),
    baseFare:     Number(
      flight.priceBreakdown?.agentUi?.baseFare ||
      flight.price?.base ||
      0
    ),
    currency:
      flight.priceBreakdown?.currency ||
      flight.price?.currency ||
      "SAR",
  };
}

// ==========================================
// Main: Resolve Discounts
// ==========================================

export async function resolveDiscounts(
  ctx: DiscountContext
): Promise<DiscountResult> {
  try {
    const rules   = await fetchActiveRules();
    const matched = rules.filter((rule) => matchesRule(rule, ctx));

    console.log(
      `✅ Matched ${matched.length}/${rules.length} rules` +
      ` | agent: ${ctx.agentId  || "none"}` +
      ` | tier:  ${ctx.agentTier || "none"}`
    );

    if (matched.length === 0) return EMPTY_RESULT;

    const typeWeight: Record<string, number> = {
      ROUTE_AGENT:  70,
      AIRLINE_AGENT: 60,
      PROMO:        55,
      ROUTE:        50,
      AIRLINE:      40,
      AGENT:        30,
      CAMPAIGN:     20,
      GLOBAL:       10,
    };

    matched.sort((a, b) => {
      const wA = typeWeight[a.type] ?? 0;
      const wB = typeWeight[b.type] ?? 0;
      if (wB !== wA) return wB - wA;
      return (b.priority ?? 0) - (a.priority ?? 0);
    });

    console.log(
      `🏆 Best rule: "${matched[0]?.name}"` +
      ` | type:  ${matched[0]?.type}` +
      ` | value: ${matched[0]?.discountValue}`
    );

    const applied:       AppliedDiscount[] = [];
    let   totalDiscount  = 0;
    let   hasPromo       = false;
    const labels:        string[]          = [];

    // ── Best rule ──
    const best       = matched[0];
    const bestAmount = calculateAmount(best, ctx);

    if (bestAmount > 0) {
      applied.push({
        ruleId:           best.id,
        ruleName:         best.name,
        ruleType:         best.type,
        discountType:     best.discountType  as "FLAT" | "PERCENT",
        discountValue:    best.discountValue,
        discountOn:       best.discountOn    as "BASE_FARE" | "TOTAL",
        calculatedAmount: bestAmount,
        promoCode:        best.promoCode,
        isStackable:      best.isStackable,
      });

      totalDiscount += bestAmount;
      if (best.promoCode) hasPromo = true;
      labels.push(best.promoCode ? `Promo: ${best.promoCode}` : best.name);
    }

    // ── Stackable rules ──
    const stackables = matched.filter(
      (r) => r.isStackable && r.id !== best.id
    );

    for (const rule of stackables) {
      const amount = calculateAmount(rule, ctx);
      if (amount <= 0) continue;

      applied.push({
        ruleId:           rule.id,
        ruleName:         rule.name,
        ruleType:         rule.type,
        discountType:     rule.discountType as "FLAT" | "PERCENT",
        discountValue:    rule.discountValue,
        discountOn:       rule.discountOn   as "BASE_FARE" | "TOTAL",
        calculatedAmount: amount,
        promoCode:        rule.promoCode,
        isStackable:      true,
      });

      totalDiscount += amount;
      if (rule.promoCode) hasPromo = true;
      labels.push(rule.promoCode ? `Promo: ${rule.promoCode}` : rule.name);
    }

    // Safety cap: max 25% of fare
    totalDiscount = Math.min(totalDiscount, ctx.fareAmount * 0.25);

    return {
      discounts:     applied,
      totalDiscount: Math.round(totalDiscount * 100) / 100,
      hasPromo,
      labels,
    };
  } catch (error) {
    console.error("❌ resolveDiscounts error:", error);
    return EMPTY_RESULT;
  }
}

// ==========================================
// Record Usage
// ==========================================

export async function recordDiscountUsage(params: {
  discountRuleId: string;
  bookingId:      string;
  agentId?:       string | null;
  discountType:   "FLAT" | "PERCENT";
  discountValue:  number;
  amount:         number;
  currency?:      string;
  promoCode?:     string | null;
  note?:          string;
}) {
  try {
    await prisma.$transaction([
      prisma.discountUsageLog.create({
        data: {
          discountRuleId: params.discountRuleId,
          bookingId:      params.bookingId,
          agentId:        params.agentId       || null,
          discountType:   params.discountType,          // ✅ fixed
          discountValue:  params.discountValue,         // ✅ fixed
          amount:         params.amount,
          currency:       params.currency      || "SAR",
          promoCode:      params.promoCode     || null,
          note:           params.note          || null,
        },
      }),
      prisma.discountRule.update({
        where: { id: params.discountRuleId },
        data:  { currentUsage: { increment: 1 } },
      }),
    ]);
  } catch (error) {
    console.error("❌ recordDiscountUsage error:", error);
  }
}

// ==========================================
// Check Per-Agent Usage Limit
// ==========================================

export async function checkAgentUsageLimit(
  ruleId:      string,
  agentId:     string,
  maxPerAgent: number
): Promise<boolean> {
  const count = await prisma.discountUsageLog.count({
    where: {
      discountRuleId: ruleId,
      agentId,
    },
  });

  return count < maxPerAgent;
}