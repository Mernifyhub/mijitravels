// app/api/amadeus/flights/route.ts

import { NextRequest, NextResponse } from 'next/server';

const generateMockFlights = (
  origin: string,
  destination: string,
  departureDate: string,
  returnDate?: string | null,
  adults: number = 1  // ✅ adults parameter added
) => {
  const airlines = [
    { code: "EK", name: "Emirates" },
    { code: "QR", name: "Qatar Airways" },
    { code: "BG", name: "Biman Bangladesh" },
    { code: "G9", name: "Air Arabia" },
    { code: "EY", name: "Etihad Airways" },
    { code: "FZ", name: "flydubai" },
    { code: "6E", name: "IndiGo" },
    { code: "AI", name: "Air India" },
    { code: "AC", name: "Air Canada" },
    { code: "BS", name: "US Bangla" },
  ];

  const flights = [];
  const numFlights = Math.floor(Math.random() * 11) + 20;

  for (let i = 0; i < numFlights; i++) {
    const airline = airlines[Math.floor(Math.random() * airlines.length)];
    const isNonStop = Math.random() > 0.5;

    const generateSegments = (
      segOrigin: string,
      segDestination: string,
      date: string,
      segAirline: typeof airline
    ) => {
      const segments = [];
      let currentOrigin = segOrigin;
      let currentTime = new Date(date);
      currentTime.setHours(
        Math.floor(Math.random() * 24),
        Math.floor(Math.random() * 60)
      );

      const segCount = isNonStop ? 1 : Math.random() > 0.5 ? 2 : 3;

      for (let j = 0; j < segCount; j++) {
        const isLastSegment = j === segCount - 1;

        const transitCities = ['DOH', 'AUH', 'DEL', 'BOM', 'SIN', 'KUL', 'BKK', 'IST', 'JED', 'RUH']
          .filter(c => c !== segOrigin && c !== segDestination);

        const nextDestination = isLastSegment
          ? segDestination
          : transitCities[Math.floor(Math.random() * transitCities.length)];

        const flightDuration = Math.floor(Math.random() * 480) + 60;
        const arrivalTime = new Date(currentTime.getTime() + flightDuration * 60000);

        segments.push({
          departure: {
            iataCode: currentOrigin,
            terminal: Math.random() > 0.5 ? (Math.floor(Math.random() * 3) + 1).toString() : null,
            at: currentTime.toISOString(),
          },
          arrival: {
            iataCode: nextDestination,
            terminal: Math.random() > 0.5 ? (Math.floor(Math.random() * 3) + 1).toString() : null,
            at: arrivalTime.toISOString(),
          },
          carrierCode: segAirline.code,
          number: (Math.floor(Math.random() * 9000) + 1000).toString(),
          aircraft: {
            code: ["77W", "788", "789", "738", "320", "321", "359"][Math.floor(Math.random() * 7)],
          },
          duration: `PT${Math.floor(flightDuration / 60)}H${flightDuration % 60}M`,
          id: `${i + 1}-${j + 1}`,
          numberOfStops: 0,
          blacklistedInEU: false,
          cabin: "ECONOMY",
          includedCheckedBags: {
            weight: [20, 30, 40][Math.floor(Math.random() * 3)],
            weightUnit: "KG",
          },
        });

        if (!isLastSegment) {
          const layoverMinutes = Math.floor(Math.random() * 180) + 60;
          currentTime = new Date(arrivalTime.getTime() + layoverMinutes * 60000);
          currentOrigin = nextDestination;
        }
      }

      return segments;
    };

    const calcDuration = (segments: any[]) => {
      const firstDep = new Date(segments[0].departure.at).getTime();
      const lastArr = new Date(segments[segments.length - 1].arrival.at).getTime();
      const totalMinutes = Math.round((lastArr - firstDep) / 60000);
      return `PT${Math.floor(totalMinutes / 60)}H${totalMinutes % 60}M`;
    };

    const outboundSegments = generateSegments(origin, destination, departureDate, airline);

    const itineraries: any[] = [
      {
        duration: calcDuration(outboundSegments),
        segments: outboundSegments,
      },
    ];

    if (returnDate) {
      const returnSegments = generateSegments(destination, origin, returnDate, airline);
      itineraries.push({
        duration: calcDuration(returnSegments),
        segments: returnSegments,
      });
    }

    // ✅ Per person base price
    const perPersonBase = isNonStop
      ? Math.floor(Math.random() * 400) + 300
      : Math.floor(Math.random() * 300) + 200;

    // ✅ Round trip এ একটু বেশি
    const perPersonPrice = returnDate
      ? Math.round(perPersonBase * 1.8)
      : perPersonBase;

    // ✅ সব passenger এর grand total
    const grandTotal = perPersonPrice * adults;

    const flight = {
      type: "flight-offer",
      id: `MOCK-${i + 1}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      source: "GDS",
      instantTicketingRequired: false,
      nonHomogeneous: false,
      oneWay: !returnDate,
      lastTicketingDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      lastTicketingDateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      numberOfBookableSeats: Math.floor(Math.random() * 7) + 2,
      itineraries,
      price: {
        currency: "SAR",
        total: perPersonPrice.toFixed(2),          // ✅ per person
        base: (perPersonPrice * 0.85).toFixed(2),  // ✅ per person base
        fees: [
          { amount: (perPersonPrice * 0.10).toFixed(2), type: "SUPPLIER" },
          { amount: (perPersonPrice * 0.05).toFixed(2), type: "TICKETING" },
        ],
        grandTotal: grandTotal.toFixed(2),          // ✅ ALL passengers total
      },
      pricingOptions: {
        fareType: ["PUBLISHED"],
        includedCheckedBagsOnly: true,
      },
      validatingAirlineCodes: [airline.code],
      travelerPricings: Array.from({ length: adults }, (_, idx) => ({
        travelerId: String(idx + 1),
        fareOption: "STANDARD",
        travelerType: "ADULT",
        price: {
          currency: "SAR",
          total: perPersonPrice.toFixed(2),         // ✅ per person
          base: (perPersonPrice * 0.85).toFixed(2), // ✅ per person base
        },
        fareDetailsBySegment: outboundSegments.map((seg) => ({
          segmentId: seg.id,
          cabin: "ECONOMY",
          fareBasis: "VLOWBD",
          brandedFare: "ECONOMY_SAVER",
          class: ["Y", "M", "B", "H"][Math.floor(Math.random() * 4)],
          includedCheckedBags: {
            weight: seg.includedCheckedBags.weight,
            weightUnit: "KG",
          },
        })),
      })),
    };

    flights.push(flight);
  }

  return flights;
};

// ==================== API ROUTE HANDLER ====================
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const origin      = searchParams.get('origin')        || 'DAC';
    const destination = searchParams.get('destination')   || 'DXB';
    const departureDate = searchParams.get('departureDate') || new Date().toISOString().split('T')[0];
    const returnDate  = searchParams.get('returnDate')    || null;
    const adults      = parseInt(searchParams.get('adults') || '1'); // ✅ parse as number
    const travelClass = searchParams.get('travelClass')   || 'ECONOMY';
    const tripType    = searchParams.get('tripType')      || 'ONE_WAY';

    console.log('🔍 Mock API Request:', {
      origin, destination, departureDate, returnDate, adults, travelClass, tripType
    });

    await new Promise(resolve => setTimeout(resolve, 1000));

    const isRoundTrip = tripType === 'ROUND_TRIP' && returnDate;

    // ✅ adults pass করা হচ্ছে
    const flights = generateMockFlights(
      origin,
      destination,
      departureDate,
      isRoundTrip ? returnDate : null,
      adults
    );

    const response = {
      meta: {
        count: flights.length,
        links: {
          self: `https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${origin}&destinationLocationCode=${destination}&departureDate=${departureDate}&adults=${adults}`,
        },
      },
      data: flights,
      dictionaries: {
        locations: {
          [origin]:      { cityCode: origin,      countryCode: 'XX' },
          [destination]: { cityCode: destination, countryCode: 'XX' },
        },
        aircraft: {
          "77W": "BOEING 777-300ER",
          "788": "BOEING 787-8",
          "789": "BOEING 787-9",
          "738": "BOEING 737-800",
          "320": "AIRBUS A320",
          "321": "AIRBUS A321",
          "359": "AIRBUS A350-900",
        },
        currencies: { SAR: "Saudi Riyal" },
        carriers: {
          "EK": "Emirates",
          "QR": "Qatar Airways",
          "BG": "Biman Bangladesh",
          "G9": "Air Arabia",
          "EY": "Etihad Airways",
          "FZ": "flydubai",
          "6E": "IndiGo",
          "AI": "Air India",
          "AC": "Air Canada",
          "BS": "US Bangla",
        },
      },
    };

    console.log('✅ Mock API Response:', {
      flightCount: flights.length,
      isRoundTrip:          !!isRoundTrip,
      itinerariesPerFlight: flights[0]?.itineraries?.length,
      samplePrice: {
        perPerson:  flights[0]?.price?.total,
        grandTotal: flights[0]?.price?.grandTotal,
        adults,
      },
    });

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Content-Type':  'application/json',
        'Cache-Control': 'no-store',
      },
    });

  } catch (error: any) {
    console.error('❌ Mock API Error:', error);
    return NextResponse.json(
      {
        errors: [{
          status: 500,
          code:   'INTERNAL_ERROR',
          title:  'Internal Server Error',
          detail: error.message,
        }],
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin':  '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}