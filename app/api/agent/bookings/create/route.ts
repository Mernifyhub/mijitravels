// app/api/agent/bookings/create/route.ts

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

const generatePNR = (): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let pnr = "";
  for (let i = 0; i < 6; i++) {
    pnr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pnr;
};

const getUniquePNR = async (): Promise<string> => {
  let pnr = generatePNR();
  let exists = await prisma.booking.findFirst({ where: { pnr } });
  while (exists) {
    pnr = generatePNR();
    exists = await prisma.booking.findFirst({ where: { pnr } });
  }
  return pnr;
};

export async function POST(req: NextRequest) {
  try {
    // ===== Auth =====
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY!) as {
      id: string;
      role: string;
      type?: string;
      agentId?: string;
    };

    const agentId = decoded.type === "subuser" ? decoded.agentId! : decoded.id;

    // ===== Parse body =====
    const body = await req.json();

    const {
      flightId,
      carrier,
      origin,
      destination,
      departure,
      arrival,
      tripType,
      netFare,
      baseFare,
      segments,
      passengers,
      checkedBag,
      cabinBag,
      checkedBagRaw,
      cabinBagRaw,
      refundable,
      changeable,
      refundPenalty,
      changePenalty,
      cabinClass,
    } = body;

    const fare = Number(netFare);
    const grossFare = Number(baseFare) || fare;

    if (isNaN(fare) || fare <= 0) {
      return NextResponse.json(
        { message: "Invalid fare amount" },
        { status: 400 }
      );
    }

    if (!carrier || !origin || !destination || !departure || !tripType) {
      return NextResponse.json(
        { message: "Missing required booking fields" },
        { status: 400 }
      );
    }

    if (!Array.isArray(passengers) || passengers.length === 0) {
      return NextResponse.json(
        { message: "Passengers are required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(segments) || segments.length === 0) {
      return NextResponse.json(
        { message: "Segments are required" },
        { status: 400 }
      );
    }

    // ===== Generate IDs =====
    const pnr = await getUniquePNR();
    const bookingId = `MBK${Date.now()}`;

    // ===== Transaction =====
    const result = await prisma.$transaction(async (tx) => {
      const agent = await tx.user.findUnique({
        where: { id: agentId },
        select: {
          id: true,
          balance: true,
          creditLimit: true,
          usedLimit: true,
        },
      });

      if (!agent) throw new Error("AGENT_NOT_FOUND");

      // ✅ CORRECT Business Logic
      const storedBalance = Math.max(0, Number(agent.balance) || 0);
      const creditLimit   = Math.max(0, Number(agent.creditLimit) || 0);
      const usedLimit     = Math.max(0, Number(agent.usedLimit) || 0);

      // ✅ wallet = actual DB balance (যা আছে তাই)
      const walletBalance  = storedBalance;
      const availableCredit = Math.max(0, creditLimit - usedLimit);
      const totalAvailable  = walletBalance + availableCredit;

      if (totalAvailable < fare) {
        throw new Error("INSUFFICIENT_BALANCE");
      }

      // ✅ First wallet, then credit
      const balanceDeduct = Math.min(walletBalance, fare);
      const creditUsed    = fare - balanceDeduct;

      let paymentMethod: "BALANCE" | "CREDIT" | "MIXED" = "BALANCE";
      if (creditUsed === 0) {
        paymentMethod = "BALANCE";
      } else if (balanceDeduct === 0) {
        paymentMethod = "CREDIT";
      } else {
        paymentMethod = "MIXED";
      }

      // ✅ Correct balance calculation
      const newBalance   = walletBalance - balanceDeduct;
      const newUsedLimit = usedLimit + creditUsed;

      // ✅ DB update
      await tx.user.update({
        where: { id: agentId },
        data: {
          balance:   newBalance,
          usedLimit: newUsedLimit,
        },
      });

      // ===== Create booking =====
      const booking = await tx.booking.create({
        data: {
          bookingId,
          pnr,
          status:        "ON_HOLD",
          tripType:      tripType as any,
          route:         `${origin}-${destination}`,
          departureDate: new Date(departure),
          returnDate:    arrival ? new Date(arrival) : null,
          carrier,
          agentId,

          net:        fare,
          gross:      grossFare,
          commission: 0,
          currency:   "SAR",
          cabinClass: cabinClass || "Economy",

          baggageInfo: {
            checked:    checkedBag || "Not Included",
            cabin:      cabinBag   || "Not Included",
            checkedRaw: parseInt(checkedBagRaw || "0"),
            cabinRaw:   parseInt(cabinBagRaw   || "0"),
          },

          conditions: {
            refundable:    refundable === "true" || refundable === true,
            changeable:    changeable === "true" || changeable === true,
            refundPenalty: refundPenalty || null,
            changePenalty: changePenalty || null,
          },

          passengers: {
            create: passengers.map((p: any) => ({
              title:          p.title as any,
              firstName:      p.firstName,
              lastName:       p.lastName,
              type:           p.type as any,
              gender:         p.gender as any,
              dateOfBirth:    p.dateOfBirth ? new Date(p.dateOfBirth) : null,
              nationality:    p.nationality,
              passportNumber: p.passportNumber || null,
              passportExpiry: p.passportExpiry ? new Date(p.passportExpiry) : null,
              email:          p.email || null,
              phone:          p.phone || null,
            })),
          },

          segments: {
            create: segments.map((s: any) => ({
              from:      s.from,
              to:        s.to,
              departure: new Date(s.departure),
              arrival:   new Date(s.arrival),
              flightNo:  s.flightNo,
              airline:   s.airline,
            })),
          },

          remarks:
            creditUsed > 0
              ? `Payment: ${balanceDeduct > 0 ? `Balance ${balanceDeduct} SAR + ` : ""}Credit ${creditUsed} SAR`
              : `Payment: Balance ${balanceDeduct} SAR`,
        },
      });

      // ===== After state =====
      const updatedAgent = await tx.user.findUnique({
        where: { id: agentId },
        select: { balance: true, creditLimit: true, usedLimit: true },
      });

      const afterBalance        = Math.max(0, Number(updatedAgent?.balance)     || 0);
      const afterCreditLimit    = Number(updatedAgent?.creditLimit)              || 0;
      const afterUsedLimit      = Number(updatedAgent?.usedLimit)                || 0;
      const afterAvailableCredit = Math.max(0, afterCreditLimit - afterUsedLimit);
      const afterTotalAvailable  = afterBalance + afterAvailableCredit;

      return {
        booking,
        paymentMethod,
        balanceDeduct,
        creditUsed,
        before: {
          rawBalance: storedBalance,
          balance:    walletBalance,
          creditLimit,
          usedLimit,
          availableCredit,
          totalAvailable,
        },
        after: {
          balance:        afterBalance,
          creditLimit:    afterCreditLimit,
          usedLimit:      afterUsedLimit,
          availableCredit: afterAvailableCredit,
          totalAvailable:  afterTotalAvailable,
        },
      };
    });

    // ===== Log =====
    console.log(`
╔══════════════════════════════════════════╗
║         BOOKING CREATED ✅               ║
╠══════════════════════════════════════════╣
║ Booking ID:     ${result.booking.bookingId}
║ PNR:            ${result.booking.pnr}
║ Total Fare:     ${fare} SAR
║ Payment Method: ${result.paymentMethod}
║──────────────────────────────────────────
║ From Balance:   ${result.balanceDeduct} SAR
║ From Credit:    ${result.creditUsed} SAR
║──────────────────────────────────────────
║ BEFORE:
║   Raw Balance:  ${result.before.rawBalance} SAR
║   Wallet:       ${result.before.balance} SAR
║   Used Limit:   ${result.before.usedLimit} SAR
║   Avail Credit: ${result.before.availableCredit} SAR
║   Total Avail:  ${result.before.totalAvailable} SAR
║──────────────────────────────────────────
║ AFTER:
║   Wallet:       ${result.after.balance} SAR
║   Used Limit:   ${result.after.usedLimit} SAR
║   Avail Credit: ${result.after.availableCredit} SAR
║   Total Avail:  ${result.after.totalAvailable} SAR
╚══════════════════════════════════════════╝
    `);

    return NextResponse.json({
      success: true,
      bookingId:     result.booking.bookingId,
      pnr:           result.booking.pnr,
      paymentMethod: result.paymentMethod,
      deducted: {
        fromBalance: result.balanceDeduct,
        fromCredit:  result.creditUsed,
        total:       fare,
      },
      message: "Booking created successfully",
    });

  } catch (error: any) {
    console.error("❌ Booking error:", error?.message || error);

    if (error.message === "INSUFFICIENT_BALANCE") {
      return NextResponse.json(
        {
          message: "Insufficient balance and credit limit",
          code:    "INSUFFICIENT_BALANCE",
        },
        { status: 402 }
      );
    }

    if (error.message === "AGENT_NOT_FOUND") {
      return NextResponse.json(
        { message: "Agent account not found" },
        { status: 404 }
      );
    }

    if (
      error?.name === "JsonWebTokenError" ||
      error?.name === "TokenExpiredError"
    ) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { message: error.message || "Booking failed" },
      { status: 500 }
    );
  }
}