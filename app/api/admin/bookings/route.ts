
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({

    include: {
    agent: true,      // ✅ user data (agent)
    passengers: true,
    segments: true,
    payments: true,
  },
  orderBy: {
    createdAt: "desc",
  },
});

    return Response.json(bookings);

  } catch (err) {
    console.error(err);
    return Response.json(
      { message: "Error fetching bookings" },
      { status: 500 }
    );
  }
}