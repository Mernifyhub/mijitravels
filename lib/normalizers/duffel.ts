// lib/normalizers/duffel.ts

import type { NormalizedFlight } from './types';
import {calculateFare, extractFareFromFlight,DEFAULT_OTA_CONFIG} from '../fare';

// ==================== HELPERS ====================

function toNum(value: any): number {
  const n = Number.parseFloat(value ?? '0');
  return Number.isFinite(n) ? n : 0;
}

function toMoney(value: number): string {
  return value.toFixed(2);
}

function minutesToIso(minutes: number): string {
  const safe = Math.max(0, minutes);
  const h    = Math.floor(safe / 60);
  const m    = safe % 60;
  return `PT${h}H${m}M`;
}

// ==================== LAYOVERS ====================

function buildLayovers(segments: any[]) {
  const layovers = [];

  for (let i = 0; i < segments.length - 1; i++) {
    const current = segments[i];
    const next    = segments[i + 1];

    const arrivalMs   = new Date(current.arriving_at).getTime();
    const departureMs = new Date(next.departing_at).getTime();
    const diffMinutes = Math.round((departureMs - arrivalMs) / 60000);

    layovers.push({
      airport:  current.destination?.iata_code || '',
      cityName: current.destination?.city_name || current.destination?.name || '',
      duration: minutesToIso(diffMinutes),
    });
  }

  return layovers;
}

// ==================== PASSENGER FARES ====================

function buildPassengerFares(offer: any) {
  const passengers: any[] = offer.passengers || [];
  if (!passengers.length) return [];

  const total = toNum(offer.total_amount);
  const base  = toNum(offer.base_amount || offer.total_amount);
  const tax   = Math.max(0, total - base);

  const grouped: Record<string, any[]> = {};
  for (const pax of passengers) {
    const type = pax.type || 'adult';
    if (!grouped[type]) grouped[type] = [];
    grouped[type].push(pax);
  }

  return Object.entries(grouped).map(([type, paxList]) => {
    const totalPax     = passengers.length;
    const count        = paxList.length;
    const baseFarePerPax = base  / totalPax;
    const taxPerPax      = tax   / totalPax;
    const totalPerPax    = total / totalPax;

    return {
      type:           type as 'adult' | 'child' | 'infant_without_seat',
      count,
      baseFarePerPax: toMoney(baseFarePerPax),
      taxPerPax:      toMoney(taxPerPax),
      totalPerPax:    toMoney(totalPerPax),
      subTotal:       toMoney(totalPerPax * count),
    };
  });
}

// ==================== MAIN ====================

export function normalizeDuffelOffer(offer: any): NormalizedFlight {

  // ✅ Step 1: Duffel raw amounts
  const total = toNum(offer.total_amount);
  const base  = toNum(offer.base_amount || offer.total_amount);
  const tax   = Math.max(0, total - base);

  // ✅ Step 2: B2B OTA full price breakdown
  // fare.ts এর calculateFare use করছি — single source of truth
  const fareInput = {
    baseFare:  base,
    taxAmount: tax,
    currency:  offer.total_currency || 'USD',
    adults:    offer.passengers?.filter((p: any) => p.type === 'adult').length   || 1,
    children:  offer.passengers?.filter((p: any) => p.type === 'child').length   || 0,
    infants:   offer.passengers?.filter((p: any) => p.type === 'infant_without_seat').length || 0,
  };

  const priceBreakdown = calculateFare(fareInput, DEFAULT_OTA_CONFIG);

  // ✅ Step 3: backward compat price object
  const price = {
    total:     toMoney(priceBreakdown.agentUi.totalBaseTax),
    grandTotal:toMoney(priceBreakdown.agentUi.grandTotal),
    base:      toMoney(priceBreakdown.agentUi.baseFare),
    tax:       toMoney(priceBreakdown.agentUi.taxAmount),
    markup:    toMoney(priceBreakdown.admin.markup),
    ait:       toMoney(priceBreakdown.admin.ait),
    currency:  priceBreakdown.currency,
  };

  // ✅ Baggage
  const firstSeg      = offer.slices?.[0]?.segments?.[0];
  const firstBaggages = firstSeg?.passengers?.[0]?.baggages || [];
  const checkedBag    = firstBaggages.find((b: any) => b.type === 'checked');
  const carryBag      = firstBaggages.find((b: any) => b.type === 'carry_on');

  const baggageInfo = {
    checked:    checkedBag
      ? `${checkedBag.quantity} ${checkedBag.quantity > 1 ? 'Bags' : 'Bag'}`
      : 'Not Included',
    cabin:      carryBag
      ? `${carryBag.quantity} ${carryBag.quantity > 1 ? 'Bags' : 'Bag'}`
      : 'Not Included',
    checkedRaw: checkedBag?.quantity || 0,
    cabinRaw:   carryBag?.quantity   || 0,
  };

  // ✅ Itineraries
      const itineraries = (offer.slices || []).map((slice: any) => {
      const segments = (slice.segments || []).map((seg: any) => {
      const segBaggages = seg.passengers?.[0]?.baggages || [];
      const segChecked  = segBaggages.find((b: any) => b.type === 'checked');
      const segCarry    = segBaggages.find((b: any) => b.type === 'carry_on');

      return {
        carrierCode: seg.operating_carrier?.iata_code
                  || seg.marketing_carrier?.iata_code || '??',
        number:      seg.marketing_carrier_flight_number
                  || seg.operating_carrier_flight_number || '???',
        departure: {
          iataCode: seg.origin?.iata_code  || '???',
          at:       seg.departing_at        || '',
          terminal: seg.origin?.terminal    || null,
          cityName: seg.origin?.city_name   || seg.origin?.name || '',
          airport:  seg.origin?.name        || '',
        },
        arrival: {
          iataCode: seg.destination?.iata_code || '???',
          at:       seg.arriving_at             || '',
          terminal: seg.destination?.terminal   || null,
          cityName: seg.destination?.city_name  || seg.destination?.name || '',
          airport:  seg.destination?.name       || '',
        },
        duration:   seg.duration      || '',
        stopCount:  seg.stops?.length || 0,
        aircraft: {
          code: seg.aircraft?.iata_code || '',
          name: seg.aircraft?.name      || 'Aircraft',
        },
        operatingCarrier: {
          name: seg.operating_carrier?.name      || '',
          code: seg.operating_carrier?.iata_code || '',
        },
        marketingCarrier: {
          name: seg.marketing_carrier?.name      || '',
          code: seg.marketing_carrier?.iata_code || '',
        },
        cabin:     seg.passengers?.[0]?.cabin_class                    || 'economy',
        cabinName: seg.passengers?.[0]?.cabin_class_marketing_name     || 'Economy',
        baggage: {
          checked: segChecked?.quantity || 0,
          cabin:   segCarry?.quantity   || 0,
        },
        fareBasis: seg.passengers?.[0]?.fare_basis_code || '',
      };
    });

    return {
      duration:      slice.duration        || '',
      segments,
      fareBrandName: slice.fare_brand_name || '',
      stopCount:     Math.max(0, segments.length - 1),
      layovers:      buildLayovers(slice.segments || []),
    };
  });

  // ✅ Conditions
  const refund = offer.conditions?.refund_before_departure;
  const change = offer.conditions?.change_before_departure;

  const conditions = {
    refundable:      refund?.allowed === true,
    changeable:      change?.allowed === true,
    refundPenalty:   refund?.penalty_amount   || null,
    changePenalty:   change?.penalty_amount   || null,
    penaltyCurrency: refund?.penalty_currency
                  || change?.penalty_currency
                  || price.currency,
  };

  return {
    id: offer.id,
    price,
    priceBreakdown,
    passengerFares: buildPassengerFares(offer),
    itineraries,
    conditions,
    baggageInfo,
    _duffel: {
      owner:               offer.owner?.name            || '',
      ownerCode:           offer.owner?.iata_code       || '',
      ownerLogo:           offer.owner?.logo_symbol_url || '',
      passengers:          offer.passengers             || [],
      paymentRequirements: offer.payment_requirements   || {},
      expiresAt:           offer.expires_at             || '',
      totalEmissions:      offer.total_emissions_kg     || null,
    },
  };
}

export function normalizeDuffelOffers(offers: any[]): NormalizedFlight[] {
  return offers.map(normalizeDuffelOffer);
}