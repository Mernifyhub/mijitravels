// app/api/flights/search/route.ts

import { NextResponse } from "next/server";
import { normalizeDuffelOffers } from "@/lib/normalizers/duffel";
import { getAuthUser, getActualUserId } from "@/lib/auth";
import { resolveDiscounts, buildDiscountContext } from "@/lib/discount";
import {
  applyMarkupToFlight,
  buildMarkupContext,
  convertFlightToSAR,
} from "@/lib/markup";
import prisma from "@/lib/prisma";
import type { MarkupRule } from "@/lib/markup";

export const dynamic = "force-dynamic";

// ─────────────────────────────────────────
// Constants
// ─────────────────────────────────────────

const DUFFEL_API_URL = "https://api.duffel.com/air/offer_requests";

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

interface SearchSlice {
  origin: string;
  destination: string;
  departure_date: string;
}

interface ParsedSearchParams {
  tripType: "ONE_WAY" | "ROUND_TRIP" | "MULTI_CITY";
  origin: string;
  destination: string;
  departureDate: string;
  returnDate: string | null;
  cabinClass: string;
  adults: number;
  children: number;
  infants: number;
  slices: SearchSlice[];
}

interface AgentInfo {
  agentId: string | null;
  agentTier: string | null;
}

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────

function ensureFutureDate(input: string): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const date = new Date(input);
  if (!input || isNaN(date.getTime()) || date <= tomorrow) {
    return tomorrow.toISOString().split("T")[0];
  }

  return input;
}

function safeJSON<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function buildPassengers(adults: number, children: number, infants: number) {
  return [
    ...Array.from({ length: adults }, () => ({ type: "adult" as const })),
    ...Array.from({ length: children }, () => ({ type: "child" as const })),
    ...Array.from({ length: infants }, () => ({
      type: "infant_without_seat" as const,
    })),
  ];
}

// ─────────────────────────────────────────
// Parse & Validate URL Params
// ─────────────────────────────────────────

function parseSearchParams(url: string): ParsedSearchParams {
  const { searchParams } = new URL(url);

  const tripType = (searchParams.get("tripType") ||
    "ONE_WAY") as ParsedSearchParams["tripType"];
  const origin = (searchParams.get("origin") || "LHR").toUpperCase().trim();
  const destination = (searchParams.get("destination") || "JFK")
    .toUpperCase()
    .trim();
  const departureDate = ensureFutureDate(
    searchParams.get("departureDate") || ""
  );
  const returnDate = searchParams.get("returnDate") || null;
  const cabinClass = (
    searchParams.get("travelClass") || "economy"
  ).toLowerCase();

  const adults = Math.max(1, parseInt(searchParams.get("adults") || "1"));
  const children = Math.max(0, parseInt(searchParams.get("children") || "0"));
  const infants = Math.max(0, parseInt(searchParams.get("infants") || "0"));

  let slices: SearchSlice[] = [];

  if (tripType === "MULTI_CITY") {
    const segments = safeJSON<
      Array<{ origin: string; destination: string; departureDate: string }>
    >(searchParams.get("segments"));

    if (Array.isArray(segments)) {
      slices = segments
        .filter((s) => s?.origin && s?.destination && s?.departureDate)
        .map((s) => ({
          origin: s.origin.toUpperCase().trim(),
          destination: s.destination.toUpperCase().trim(),
          departure_date: ensureFutureDate(s.departureDate),
        }));
    }
  }

  if (slices.length === 0) {
    slices = [{ origin, destination, departure_date: departureDate }];

    if (tripType === "ROUND_TRIP" && returnDate) {
      slices.push({
        origin: destination,
        destination: origin,
        departure_date: ensureFutureDate(returnDate),
      });
    }
  }

  return {
    tripType,
    origin,
    destination,
    departureDate,
    returnDate,
    cabinClass,
    adults,
    children,
    infants,
    slices,
  };
}

// ─────────────────────────────────────────
// Duffel API Call
// ─────────────────────────────────────────

async function callDuffel(
  slices: SearchSlice[],
  passengers: ReturnType<typeof buildPassengers>,
  cabinClass: string
): Promise<{ offers: unknown[]; ok: boolean; status: number; raw: unknown }> {
  const token = process.env.DUFFEL_TOKEN;
  const version = process.env.DUFFEL_VERSION || "v2";

  if (!token) throw new Error("DUFFEL_TOKEN is not configured");

  const res = await fetch(DUFFEL_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Duffel-Version": version,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      data: {
        slices,
        passengers,
        cabin_class: cabinClass,
        return_offers: true,
      },
    }),
    cache: "no-store",
  });

  const raw = await res.json();

  return {
    offers: raw?.data?.offers || [],
    ok: res.ok,
    status: res.status,
    raw,
  };
}

// ─────────────────────────────────────────
// Get Agent Info
// ─────────────────────────────────────────

async function getAgentInfo(): Promise<AgentInfo> {
  const user = await getAuthUser();
  if (!user) return { agentId: null, agentTier: null };

  const agentId = getActualUserId(user);

  const agent = await prisma.user.findUnique({
    where: { id: agentId },
    select: { tier: true },
  });

  return {
    agentId,
    agentTier: agent?.tier ?? null,
  };
}

// ─────────────────────────────────────────
// Fetch Markup Rules from DB
// ─────────────────────────────────────────

async function fetchMarkupRules(agentId: string | null): Promise<MarkupRule[]> {
  const now = new Date();

  const rows = await prisma.markup.findMany({
    where: {
      isActive: true,
      deletedAt: null,
      OR: [{ agentId: null }, ...(agentId ? [{ agentId }] : [])],
      AND: [
        { OR: [{ validFrom: null }, { validFrom: { lte: now } }] },
        { OR: [{ validTo: null }, { validTo: { gte: now } }] },
      ],
    },
    orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
  });

  return rows.map((r) => ({
    ...r,
    markupAmount: Number(r.markupAmount ?? 0),
    markupPercent: Number(r.markupPercent ?? 0),
    markupCurrency: r.markupCurrency || "SAR",
  })) as MarkupRule[];
}

// ─────────────────────────────────────────
// Route Handler
// ─────────────────────────────────────────

export async function GET(request: Request) {
  try {
    // 1. Parse params
    const params = parseSearchParams(request.url);
    const passengers = buildPassengers(
      params.adults,
      params.children,
      params.infants
    );

    // 2. Resolve agent — never blocks search
    const agent = await getAgentInfo().catch(() => ({
      agentId: null,
      agentTier: null,
    }));

    // 3. Primary Duffel search
    const primary = await callDuffel(
      params.slices,
      passengers,
      params.cabinClass
    );

    if (!primary.ok) {
      return NextResponse.json(
        { error: "Flight search failed", details: primary.raw },
        { status: primary.status }
      );
    }

    // 4. Normalize
    let flights = normalizeDuffelOffers(primary.offers as any[]);
    let isFallback = false;

    if (flights.length === 0) {
      const future = new Date();
      future.setDate(future.getDate() + 30);

      const fallback = await callDuffel(
        [
          {
            origin: "LHR",
            destination: "JFK",
            departure_date: future.toISOString().split("T")[0],
          },
        ],
        [{ type: "adult" }],
        "economy"
      );

      if (fallback.ok) {
        flights = normalizeDuffelOffers(fallback.offers as any[]);
        isFallback = true;
      }
    }

    // ★ 5. CONVERT ALL FLIGHTS TO SAR — BEFORE markup/discount
    flights = flights.map((flight) => convertFlightToSAR(flight));

    // 6. Apply markup (SAR-এ — markup amount ও SAR)
    if (flights.length > 0) {
      try {
        const markupRules = await fetchMarkupRules(agent.agentId);

        if (markupRules.length > 0) {
          flights = flights.map((flight) => {
            const context = buildMarkupContext(flight, {
              origin: params.origin,
              destination: params.destination,
              agentId: agent.agentId || undefined,
            });

            return applyMarkupToFlight(flight, markupRules, context);
          });
        }
      } catch {
        // Non-fatal
      }
    }

    // 7. Apply discounts (SAR-এ)
    if (flights.length > 0) {
      try {
        flights = await Promise.all(
          flights.map(async (flight) => {
            try {
              const ctx = buildDiscountContext(flight, agent);
              const discountInfo = await resolveDiscounts(ctx);
              return { ...flight, discountInfo };
            } catch {
              return flight;
            }
          })
        );
      } catch {
        // Non-fatal
      }
    }

    // 8. Response — everything in SAR
    return NextResponse.json({
      data: flights,
      meta: {
        count: flights.length,
        source: "duffel",
        currency: "SAR",
        isFallback,
        request: {
          tripType: params.tripType,
          origin: params.origin,
          destination: params.destination,
          departureDate: params.departureDate,
          returnDate: params.returnDate,
          cabinClass: params.cabinClass,
          adults: params.adults,
          children: params.children,
          infants: params.infants,
          slices: params.slices,
        },
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected error occurred";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}