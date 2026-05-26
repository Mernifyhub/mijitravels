import { NextRequest, NextResponse } from "next/server";
import { resolveDiscounts, type DiscountContext } from "@/lib/discount";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const ctx: DiscountContext = {
      airlineCode: body.airlineCode || undefined,
      origin: body.origin || undefined,
      destination: body.destination || undefined,
      cabinClass: body.cabinClass || undefined,
      agentId: body.agentId || undefined,
      agentTier: body.agentTier || undefined,
      promoCode: body.promoCode || undefined,
      fareAmount: Number(body.fareAmount || 0),
      baseFare: Number(body.baseFare || 0),
      currency: body.currency || "SAR",
    };

    const result = await resolveDiscounts(ctx);

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("Discount resolve error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}