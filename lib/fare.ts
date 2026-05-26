// lib/fare.ts
// ==========================================
// Fare Calculation — Single Source of Truth
// With Markup System
// ==========================================

export interface FareInput {
  baseFare: number;
  taxAmount: number;
  discount?: number;
  promoDiscount?: number;    // ← NEW
  discountLabels?: string[]; // ← NEW
  currency?: string;
  adults?: number;
  children?: number;
  infants?: number;
  source?: "supplier" | "agent";
}

export interface AgentFareBreakdown {
  baseFare: number;
  taxAmount: number;
  totalBaseTax: number;
  customerInvoiceTotal: number;
  discountOrCommission: number;
  grandTotal: number;
  perPerson: number;
  currency: string;
  adults: number;
  children: number;
  infants: number;
  totalPax: number;
}

export interface AdminFareBreakdown {
  supplierFare: number;
  publishedFare: number;
  offeredFare: number;
  markup: number;
  serviceFee: number;
  convenienceFee: number;
  transactionFee: number;
  agentDiscount: number;
  promoDiscount: number;
  commission: number;
  ait: number;
  vat: number;
  roundOff: number;
  paymentGatewayFee: number;
  netPayableToSupplier: number;
  netReceivableFromAgent: number;
  grossProfit: number;
  netProfit: number;
  marginPercent: number;
}

export interface FareBreakdown {
  baseFare: number;
  taxAmount: number;
  customerInvoiceTotal: number;
  discount: number;
  grandTotal: number;
  perPerson: number;
  currency: string;
  adults: number;
  children: number;
  infants: number;
  totalPax: number;
  agentUi: AgentFareBreakdown;
  admin: AdminFareBreakdown;
  markup: AppliedMarkup | null;
  meta: {
    commissionType: "flat" | "percent";
    commissionMode: "deduct_from_agent_payable" | "internal_only";
    commissionOn: "base" | "supplier_total";
    aitOn: "supplier" | "selling";
    source: "supplier" | "agent";
  };
}
export interface OtaPricingConfig {
  markup?: number;
  serviceFee?: number;
  convenienceFee?: number;
  transactionFee?: number;
  paymentGatewayFee?: number;
  agentDiscount?: number;
  promoDiscount?: number;
  commissionValue?: number;
  commissionType?: "flat" | "percent";
  commissionOn?: "base" | "supplier_total";
  commissionMode?: "deduct_from_agent_payable" | "internal_only";
  aitRate?: number;
  aitOn?: "supplier" | "selling";
  vatRate?: number;
  roundOff?: number;
}

// ==========================================
// Markup Types
// ==========================================

export interface MarkupRule {
  id: string;
  type: string;
  airlineCode?: string | null;
  origin?: string | null;
  destination?: string | null;
  routeMatchType?: string;
  agentId?: string | null;
  markupAmount: number;
  markupPercent: number;
  markupOn: "BASE_FARE" | "TOTAL";
  priority: number;
  isActive: boolean;
  validFrom?: Date | null;
  validTo?: Date | null;
}

export interface MarkupContext {
  airlineCode?: string;
  origin?: string;
  destination?: string;
  agentId?: string;
}

export interface AppliedMarkup {
  ruleId: string;
  ruleType: string;
  markupAmount: number;
  markupPercent: number;
  markupOn: "BASE_FARE" | "TOTAL";
  flatAmount: number;
  percentAmount: number;
  totalMarkup: number;
  appliedOn: number;
}

// ==========================================
// ENV CONFIG
// ==========================================

export const DEFAULT_OTA_CONFIG: OtaPricingConfig = {
  markup: Number(process.env.B2B_MARKUP || 0),
  serviceFee: Number(process.env.B2B_SERVICE_FEE || 0),
  convenienceFee: Number(process.env.B2B_CONVENIENCE_FEE || 0),
  transactionFee: Number(process.env.B2B_TRANSACTION_FEE || 0),
  paymentGatewayFee: Number(process.env.B2B_PAYMENT_GATEWAY_FEE || 0),
  agentDiscount: Number(process.env.B2B_AGENT_DISCOUNT || 0),
  promoDiscount: Number(process.env.B2B_PROMO_DISCOUNT || 0),
  commissionValue: Number(process.env.B2B_COMMISSION_VALUE || 0),
  commissionType: (process.env.B2B_COMMISSION_TYPE || "flat") as "flat" | "percent",
  commissionOn: (process.env.B2B_COMMISSION_ON || "base") as "base" | "supplier_total",
  commissionMode: (process.env.B2B_COMMISSION_MODE || "deduct_from_agent_payable") as
    | "deduct_from_agent_payable"
    | "internal_only",
  aitRate: Number(process.env.B2B_AIT_RATE || 0),
  aitOn: (process.env.B2B_AIT_ON || "supplier") as "supplier" | "selling",
  vatRate: Number(process.env.B2B_VAT_RATE || 0),
  roundOff: Number(process.env.B2B_ROUND_OFF || 0),
};

// ==========================================
// Helpers
// ==========================================

function safeNum(value: any): number {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function nonNegative(value: any): number {
  return Math.max(0, safeNum(value));
}

function round2(value: number): number {
  return Number(value.toFixed(2));
}

function isMarkupValid(rule: MarkupRule): boolean {
  const now = new Date();
  if (rule.validFrom && new Date(rule.validFrom) > now) return false;
  if (rule.validTo && new Date(rule.validTo) < now) return false;
  return rule.isActive;
}

function routeMatches(
  rule: MarkupRule,
  origin?: string,
  destination?: string
): boolean {
  if (!rule.origin || !rule.destination) return false;
  if (!origin || !destination) return false;

  const ruleOrigin = rule.origin.toUpperCase();
  const ruleDest = rule.destination.toUpperCase();
  const ctxOrigin = origin.toUpperCase();
  const ctxDest = destination.toUpperCase();

  if (rule.routeMatchType === "BIDIRECTIONAL") {
    return (
      (ruleOrigin === ctxOrigin && ruleDest === ctxDest) ||
      (ruleOrigin === ctxDest && ruleDest === ctxOrigin)
    );
  }

  return ruleOrigin === ctxOrigin && ruleDest === ctxDest;
}

// ==========================================
// Select Best Markup Rule
// Priority: ROUTE_AGENT > AIRLINE_AGENT > ROUTE > AIRLINE > AGENT > GLOBAL
// ==========================================

export function selectMarkupRule(
  rules: MarkupRule[],
  context: MarkupContext
): MarkupRule | null {
  const valid = rules.filter(isMarkupValid);

  if (valid.length === 0) return null;

  const typeOrder: Record<string, number> = {
    ROUTE_AGENT: 60,
    AIRLINE_AGENT: 50,
    ROUTE: 40,
    AIRLINE: 30,
    AGENT: 20,
    GLOBAL: 10,
  };

  const matched = valid.filter((rule) => {
    switch (rule.type) {
      case "GLOBAL":
        return true;

      case "AIRLINE":
        return (
          rule.airlineCode &&
          context.airlineCode &&
          rule.airlineCode.toUpperCase() === context.airlineCode.toUpperCase()
        );

      case "ROUTE":
        return routeMatches(rule, context.origin, context.destination);

      case "AGENT":
        return (
          rule.agentId &&
          context.agentId &&
          rule.agentId === context.agentId
        );

      case "AIRLINE_AGENT":
        return (
          rule.airlineCode &&
          context.airlineCode &&
          rule.airlineCode.toUpperCase() === context.airlineCode.toUpperCase() &&
          rule.agentId &&
          context.agentId &&
          rule.agentId === context.agentId
        );

      case "ROUTE_AGENT":
        return (
          routeMatches(rule, context.origin, context.destination) &&
          rule.agentId &&
          context.agentId &&
          rule.agentId === context.agentId
        );

      default:
        return false;
    }
  });

  if (matched.length === 0) return null;

  // Sort by type priority first, then by rule priority field
  matched.sort((a, b) => {
    const typeA = typeOrder[a.type] ?? 0;
    const typeB = typeOrder[b.type] ?? 0;
    if (typeB !== typeA) return typeB - typeA;
    return b.priority - a.priority;
  });

  return matched[0];
}

// ==========================================
// Apply Markup to Fare
// ==========================================

export function applyMarkup(
  rule: MarkupRule,
  baseFare: number,
  totalFare: number
): AppliedMarkup {
  const appliedOn =
    rule.markupOn === "BASE_FARE"
      ? round2(baseFare)
      : round2(totalFare);

  const flatAmount = round2(nonNegative(rule.markupAmount));

  const percentAmount = round2(
    (nonNegative(rule.markupPercent) / 100) * appliedOn
  );

  const totalMarkup = round2(flatAmount + percentAmount);

  return {
    ruleId: rule.id,
    ruleType: rule.type,
    markupAmount: round2(nonNegative(rule.markupAmount)),
    markupPercent: round2(nonNegative(rule.markupPercent)),
    markupOn: rule.markupOn,
    flatAmount,
    percentAmount,
    totalMarkup,
    appliedOn,
  };
}

// ==========================================
// Main Fare Calculation (with optional markup)
// ==========================================

export function calculateFare(
  input: FareInput,
  config: OtaPricingConfig = DEFAULT_OTA_CONFIG,
  markupRules?: MarkupRule[],
  markupContext?: MarkupContext
): FareBreakdown {
  const source = input.source || "supplier";

  const adults = Math.max(1, nonNegative(input.adults) || 1);
  const children = Math.max(0, nonNegative(input.children) || 0);
  const infants = Math.max(0, nonNegative(input.infants) || 0);
  const totalPax = adults + children + infants;
  const currency = input.currency || "USD";

  const inputBaseFare = round2(nonNegative(input.baseFare));
  const inputTaxAmount = round2(nonNegative(input.taxAmount));
  const inputDiscount = round2(nonNegative(input.discount));

  const configMarkup = round2(nonNegative(config.markup));
  const configServiceFee = round2(nonNegative(config.serviceFee));
  const configConvenienceFee = round2(nonNegative(config.convenienceFee));
  const configTransactionFee = round2(nonNegative(config.transactionFee));
  const configPaymentGatewayFee = round2(nonNegative(config.paymentGatewayFee));
  const configAgentDiscount = round2(nonNegative(config.agentDiscount));
  const configPromoDiscount = round2(nonNegative(config.promoDiscount));

  const commissionValue = nonNegative(config.commissionValue);
  const commissionType = config.commissionType ?? "flat";
  const commissionOn = config.commissionOn ?? "base";
  const commissionMode = config.commissionMode ?? "deduct_from_agent_payable";
  const aitRate = nonNegative(config.aitRate);
  const aitOn = config.aitOn ?? "supplier";
  const vatRate = nonNegative(config.vatRate);
  const configRoundOff = round2(nonNegative(config.roundOff));

  let supplierFare = 0;
  let publishedFare = 0;
  let offeredFare = 0;
  let markup = 0;
  let serviceFee = 0;
  let convenienceFee = 0;
  let transactionFee = 0;
  let paymentGatewayFee = 0;
  let agentDiscount = 0;
  let promoDiscount = 0;
  let commission = 0;
  let ait = 0;
  let vat = 0;
  let roundOff = 0;
  let agentBaseFare = 0;
  let agentTaxAmount = 0;
  let totalBaseTax = 0;
  let customerInvoiceTotal = 0;
  let discountOrCommission = 0;
  let grandTotal = 0;
  let perPerson = 0;

  // ==========================================
  // Select & apply markup rule
  // ==========================================
  let appliedMarkup: AppliedMarkup | null = null;
  let dynamicMarkupAmount = 0;

  if (markupRules && markupRules.length > 0 && markupContext) {
    const selectedRule = selectMarkupRule(markupRules, markupContext);

    if (selectedRule) {
      const baseFareForMarkup = inputBaseFare;
      const totalFareForMarkup = round2(inputBaseFare + inputTaxAmount);

      appliedMarkup = applyMarkup(
        selectedRule,
        baseFareForMarkup,
        totalFareForMarkup
      );

      dynamicMarkupAmount = appliedMarkup.totalMarkup;
    }
  }

  // ==========================================
  // MODE 1: RAW SUPPLIER FARE
  // ==========================================
  if (source === "supplier") {
    const supplierBaseFare = inputBaseFare;
    const supplierTax = inputTaxAmount;

    supplierFare = round2(supplierBaseFare + supplierTax);
    publishedFare = supplierFare;

    // ✅ Config markup + dynamic markup combined
    markup = round2(configMarkup + dynamicMarkupAmount);
    serviceFee = configServiceFee;
    convenienceFee = configConvenienceFee;
    transactionFee = configTransactionFee;
    paymentGatewayFee = configPaymentGatewayFee;

    agentDiscount = configAgentDiscount || inputDiscount;
    promoDiscount = configPromoDiscount;

    const commissionBase =
      commissionOn === "supplier_total" ? supplierFare : supplierBaseFare;

    commission =
      commissionType === "percent"
        ? round2((commissionBase * commissionValue) / 100)
        : round2(commissionValue);

    const preVatSell =
      supplierFare + markup + serviceFee + convenienceFee + transactionFee;

    const aitBase = aitOn === "selling" ? preVatSell : supplierFare;
    ait = round2(aitBase * aitRate);

    const vatBase = markup + serviceFee + convenienceFee + transactionFee;
    vat = round2(vatBase * vatRate);

    roundOff = configRoundOff;

    agentBaseFare = round2(
      supplierBaseFare + markup + serviceFee + convenienceFee + transactionFee
    );

    agentTaxAmount = round2(supplierTax + ait + vat + roundOff);

    totalBaseTax = round2(agentBaseFare + agentTaxAmount);
    customerInvoiceTotal = totalBaseTax;
    offeredFare = customerInvoiceTotal;

    const commissionDeduction =
      commissionMode === "deduct_from_agent_payable" ? commission : 0;

    discountOrCommission = round2(
      agentDiscount + promoDiscount + commissionDeduction
    );

    grandTotal = round2(
      Math.max(0, customerInvoiceTotal - discountOrCommission)
    );

    perPerson = totalPax > 0 ? round2(grandTotal / totalPax) : grandTotal;
  }

  // ==========================================
  // MODE 2: AGENT-VISIBLE FARE
  // ==========================================
  else {
    agentBaseFare = inputBaseFare;
    agentTaxAmount = inputTaxAmount;

    totalBaseTax = round2(agentBaseFare + agentTaxAmount);

    // ✅ Apply dynamic markup on top of agent fare
    if (dynamicMarkupAmount > 0) {
      if (appliedMarkup?.markupOn === "BASE_FARE") {
        agentBaseFare = round2(agentBaseFare + dynamicMarkupAmount);
      } else {
        agentTaxAmount = round2(agentTaxAmount + dynamicMarkupAmount);
      }
      totalBaseTax = round2(agentBaseFare + agentTaxAmount);
    }

    customerInvoiceTotal = totalBaseTax;
    discountOrCommission = inputDiscount;
    grandTotal = round2(
      Math.max(0, customerInvoiceTotal - discountOrCommission)
    );
    perPerson = totalPax > 0 ? round2(grandTotal / totalPax) : grandTotal;

    supplierFare = totalBaseTax;
    publishedFare = totalBaseTax;
    offeredFare = customerInvoiceTotal;

    markup = dynamicMarkupAmount;
    serviceFee = 0;
    convenienceFee = 0;
    transactionFee = 0;
    paymentGatewayFee = 0;
    agentDiscount = inputDiscount;
    promoDiscount = 0;
    commission = 0;
    ait = 0;
    vat = 0;
    roundOff = 0;
  }

  const grossProfit = round2(
    markup + serviceFee + convenienceFee + transactionFee + commission
  );

  const netProfit = round2(
    grossProfit - agentDiscount - promoDiscount - paymentGatewayFee
  );

  const marginPercent =
    customerInvoiceTotal > 0
      ? round2((netProfit / customerInvoiceTotal) * 100)
      : 0;

  const agentUi: AgentFareBreakdown = {
    baseFare: agentBaseFare,
    taxAmount: agentTaxAmount,
    totalBaseTax,
    customerInvoiceTotal,
    discountOrCommission,
    grandTotal,
    perPerson,
    currency,
    adults,
    children,
    infants,
    totalPax,
  };

  const admin: AdminFareBreakdown = {
    supplierFare,
    publishedFare,
    offeredFare,
    markup,
    serviceFee,
    convenienceFee,
    transactionFee,
    agentDiscount,
    promoDiscount,
    commission,
    ait,
    vat,
    roundOff,
    paymentGatewayFee,
    netPayableToSupplier: supplierFare,
    netReceivableFromAgent: grandTotal,
    grossProfit,
    netProfit,
    marginPercent,
  };

  return {
    baseFare: agentUi.baseFare,
    taxAmount: agentUi.taxAmount,
    customerInvoiceTotal: agentUi.customerInvoiceTotal,
    discount: agentUi.discountOrCommission,
    grandTotal: agentUi.grandTotal,
    perPerson: agentUi.perPerson,
    currency,
    adults,
    children,
    infants,
    totalPax,
    agentUi,
    admin,
    markup: appliedMarkup,
    meta: {
      commissionType,
      commissionMode,
      commissionOn,
      aitOn,
      source,
    },
  };
}

// ==========================================
// Extractors (unchanged)
// ==========================================

export function extractFareFromFlight(
  flight: any,
  paxParams?: { adults?: number; children?: number; infants?: number }
): FareInput {

  // ✅ Discount from discount engine
  const discountInfo = flight?.discountInfo || {
    totalDiscount: 0,
    labels: [],
  };
  const engineDiscount = nonNegative(discountInfo.totalDiscount);
  const discountLabels: string[] = discountInfo.labels || [];

  // ✅ Priority 1: agentUi
  const agentUi = flight?.priceBreakdown?.agentUi;

  if (agentUi) {
    const existingDiscount = nonNegative(
      agentUi.promoDiscount ??
      agentUi.discountOrCommission ??
      agentUi.discount ??
      0
    );

    return {
      baseFare: nonNegative(agentUi.baseFare ?? 0),
      taxAmount: nonNegative(agentUi.taxAmount ?? 0),
      discount: existingDiscount + engineDiscount,
      promoDiscount: engineDiscount,
      discountLabels,
      currency: (
        flight?.priceBreakdown?.currency ||
        flight?.price?.currency ||
        "USD"
      ).toUpperCase(),
      adults: paxParams?.adults ?? 1,
      children: paxParams?.children ?? 0,
      infants: paxParams?.infants ?? 0,
      source: "agent",
    };
  }

  // ✅ Priority 2: priceBreakdown direct
  const pb = flight?.priceBreakdown;
  if (pb && (pb.baseFare || pb.grandTotal)) {
    const pbBase = nonNegative(pb.baseFare ?? 0);
    const pbTotal = nonNegative(pb.total ?? pb.grandTotal ?? 0);
    const pbTax = nonNegative(
      pb.taxAmount ?? pb.tax ?? Math.max(0, pbTotal - pbBase)
    );

    return {
      baseFare: pbBase,
      taxAmount: pbTax,
      discount: engineDiscount,
      promoDiscount: engineDiscount,
      discountLabels,
      currency: (pb.currency || flight?.price?.currency || "USD").toUpperCase(),
      adults: paxParams?.adults ?? 1,
      children: paxParams?.children ?? 0,
      infants: paxParams?.infants ?? 0,
      source: "agent",
    };
  }

  // ✅ Priority 3: price field
  const base = nonNegative(parseFloat(flight?.price?.base || "0"));
  const total = nonNegative(parseFloat(flight?.price?.total || "0"));
  const grandTotal = nonNegative(
    parseFloat(flight?.price?.grandTotal || flight?.price?.total || "0")
  );
  const tax = nonNegative(
    parseFloat(flight?.price?.tax || String(Math.max(0, total - base)))
  );

  return {
    baseFare: base,
    taxAmount: tax,
    discount: engineDiscount,
    promoDiscount: engineDiscount,
    discountLabels,
    currency: (flight?.price?.currency || "USD").toUpperCase(),
    adults: paxParams?.adults ?? 1,
    children: paxParams?.children ?? 0,
    infants: paxParams?.infants ?? 0,
    source: "agent",
  };
}
export function extractFareFromParams(params: URLSearchParams): FareInput {
  const baseFare = Number(params.get("baseFare") || 0);
  const taxAmount = Number(
    params.get("taxAmount") || params.get("taxAndFee") || 0
  );
  const customerInvoiceTotal = Number(params.get("customerInvoiceTotal") || 0);
  const grandTotal = Number(
    params.get("grandTotal") || params.get("netFare") || 0
  );

  const finalTax =
    taxAmount > 0 ? taxAmount : Math.max(0, customerInvoiceTotal - baseFare);

  const discount =
    Number(params.get("discount") || 0) ||
    Math.max(0, customerInvoiceTotal - grandTotal);

  return {
    baseFare,
    taxAmount: finalTax,
    discount,
    currency: params.get("currency") || "USD",
    adults: Number(params.get("adults") || 1),
    children: Number(params.get("children") || 0),
    infants: Number(params.get("infants") || 0),
    source: "agent",
  };
}

export function fareToParams(fare: FareBreakdown): Record<string, string> {
  return {
    baseFare: String(fare.agentUi.baseFare),
    taxAmount: String(fare.agentUi.taxAmount),
    customerInvoiceTotal: String(fare.agentUi.customerInvoiceTotal),
    discount: String(fare.agentUi.discountOrCommission),
    grandTotal: String(fare.agentUi.grandTotal),
    netFare: String(fare.agentUi.grandTotal),
    currency: fare.agentUi.currency,
    adults: String(fare.agentUi.adults),
    children: String(fare.agentUi.children),
    infants: String(fare.agentUi.infants),
  };
}

export function extractFareFromBooking(booking: any): FareInput {
  const paxAdults =
    booking?.passengers?.filter((p: any) => p.type === "ADULT").length || 1;
  const paxChildren =
    booking?.passengers?.filter((p: any) => p.type === "CHILD").length || 0;
  const paxInfants =
    booking?.passengers?.filter((p: any) => p.type === "INFANT").length || 0;

  if (booking?.priceBreakdown?.agentUi) {
    const f = booking.priceBreakdown.agentUi;
    return {
      baseFare: nonNegative(f.baseFare),
      taxAmount: nonNegative(f.taxAmount),
      discount: nonNegative(f.discountOrCommission),
      currency: booking?.currency || f.currency || "USD",
      adults: paxAdults,
      children: paxChildren,
      infants: paxInfants,
      source: "agent",
    };
  }

  if (
    booking?.baseFare != null ||
    booking?.taxAmount != null ||
    booking?.customerInvoiceTotal != null
  ) {
    const baseFare = nonNegative(booking?.baseFare);
    const customerInvoiceTotal = nonNegative(booking?.customerInvoiceTotal);
    const taxAmount =
      booking?.taxAmount != null
        ? nonNegative(booking?.taxAmount)
        : Math.max(0, customerInvoiceTotal - baseFare);
    const discount = nonNegative(
      booking?.discount ?? booking?.commission ?? 0
    );

    return {
      baseFare,
      taxAmount,
      discount,
      currency: booking?.currency || "USD",
      adults: paxAdults,
      children: paxChildren,
      infants: paxInfants,
      source: "agent",
    };
  }

  const net = nonNegative(booking?.net);
  const gross = nonNegative(booking?.gross);
  const commission = nonNegative(booking?.commission);
  const actualGross = Math.max(net, gross);
  const actualBase = Math.min(net, gross);
  const derivedTax = Math.max(0, actualGross - actualBase);

  return {
    baseFare: actualBase,
    taxAmount: derivedTax,
    discount: commission,
    currency: booking?.currency || "USD",
    adults: paxAdults,
    children: paxChildren,
    infants: paxInfants,
    source: "agent",
  };
}