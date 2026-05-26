// app/api/amadeus/location/route.ts
import { NextResponse } from "next/server";
import airports from "@/data/airports.json"; // আপনার ইমপোর্ট পাথ অনুযায়ী

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get("keyword")?.toUpperCase() || "";

    if (!keyword || keyword.trim().length < 2) {
      return NextResponse.json([]);
    }

    const filteredAirports = airports.filter((airport: any) => {
      // এখানে চেক করা হচ্ছে iata, city, এবং name ডাটাগুলো আছে কি না
      const iata = airport.iata ? airport.iata.toUpperCase() : "";
      const city = airport.city ? airport.city.toUpperCase() : "";
      const name = airport.name ? airport.name.toUpperCase() : "";

      return (
        iata.includes(keyword) || 
        city.includes(keyword) || 
        name.includes(keyword)
      );
    }).slice(0, 10);

    // আমাদিউস ফরম্যাটে ডাটা রিটার্ন করা
    const formattedData = filteredAirports.map((loc: any, index: number) => ({
      id: loc.iata || index,
      name: loc.name || "Unknown Airport",
      iataCode: loc.iata || "N/A",
      address: {
        cityName: loc.city || "Unknown City",
        countryName: loc.country || "Unknown Country"
      }
    }));

    return NextResponse.json(formattedData);

  } catch (error) {
    console.error("Search Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}