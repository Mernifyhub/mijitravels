// app/api/agent/requests/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { RequestType } from "@prisma/client";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

// ✅ Helper to get authenticated agent ID
async function getAgentId(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return null;

    const decoded = jwt.verify(token, process.env.SECRET_KEY!) as {
      id: string;
      role: string;
    };

    return decoded.id;
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    // ✅ Get authenticated agent
    const agentId = await getAgentId();

    if (!agentId) {
      return NextResponse.json(
        { message: "Unauthorized - Please login" },
        { status: 401 }
      );
    }

    const { bookingId, type, remarks } = await req.json();

    // ✅ Validate required fields
    if (!bookingId || !type) {
      return NextResponse.json(
        { message: "bookingId and type are required" },
        { status: 400 }
      );
    }

    // ✅ Validate enum type
    const validTypes = Object.values(RequestType);
    if (!validTypes.includes(type as RequestType)) {
      return NextResponse.json(
        { message: `Invalid type. Valid: ${validTypes.join(", ")}` },
        { status: 400 }
      );
    }

    // ✅ Verify booking belongs to this agent
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        agentId: agentId,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { message: "Booking not found or access denied" },
        { status: 404 }
      );
    }

    // ✅ Check if same request already pending
    const existing = await prisma.bookingRequest.findFirst({
      where: {
        bookingId,
        type: type as RequestType,
        status: { in: ["PENDING", "PROCESSING"] },
      },
    });

    if (existing) {
      return NextResponse.json(
        { message: `A ${type} request is already pending for this booking` },
        { status: 409 }
      );
    }

    // ✅ Create request
    const request = await prisma.bookingRequest.create({
      data: {
        bookingId,
        agentId,
        type: type as RequestType,
        remarks: remarks || null,
        status: "PENDING",
      },
    });

    return NextResponse.json(request, { status: 201 });

  } catch (error: any) {
    console.error("POST /api/agent/requests error:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const agentId = await getAgentId();

    if (!agentId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const requests = await prisma.bookingRequest.findMany({
      where: { agentId },
      include: { booking: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(requests);

  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}