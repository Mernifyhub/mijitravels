// app/api/amadeus/test-search/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Token নিন
    const tokenRes = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: process.env.AMADEUS_CLIENT_ID!,
        client_secret: process.env.AMADEUS_CLIENT_SECRET!,
      }),
    });
    const { access_token } = await tokenRes.json();
    console.log("Token:", access_token ? "✅ Got token" : "❌ No token");

    // Simple search — Amadeus sandbox এ এই route guaranteed আছে
    const searchRes = await fetch(
      'https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=MAD&destinationLocationCode=MUC&departureDate=2025-06-01&adults=1&max=5',
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );

    const data = await searchRes.json();
    console.log("Search status:", searchRes.status);
    console.log("Search response:", JSON.stringify(data).slice(0, 500));

    return NextResponse.json({
      tokenStatus: access_token ? "✅ OK" : "❌ Failed",
      searchStatus: searchRes.status,
      data,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}