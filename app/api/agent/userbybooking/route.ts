import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function GET() {
  try {
    // Step 1: Cookie থেকে token নাও (await add করা হয়েছে)
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    // Step 2: Token না থাকলে unauthorized
    if (!token) {
      return Response.json(
        { message: "Unauthorized - Please login" },
        { status: 401 }
      );
    }

    // Step 3: Token verify করে userId বের করো
    let userId: string;
    try {
      const decoded = jwt.verify(token, process.env.SECRET_KEY!) as {
        id: string;
        role: string;
      };
      userId = decoded.id;
    } catch (err) {
      return Response.json(
        { message: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Step 4: শুধু এই user/agent এর bookings fetch করো
    const bookings = await prisma.booking.findMany({
      where: {
        agentId: userId,
      },
      include: {
        agent: true,
        passengers: true,
        segments: true,
        payments: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return Response.json(bookings);

  } catch (err: any) {
    console.error("Server Error:", err);
    return Response.json(
      { message: "Error fetching bookings", error: err.message },
      { status: 500 }
    );
  }
}