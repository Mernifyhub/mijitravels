// app/api/agent/bookings/[bookingId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const { bookingId } = await params;

    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const decoded = jwt.verify(token, process.env.SECRET_KEY!) as { id: string };

    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        agentId: decoded.id,
      },
      include: {
        passengers: true,
        segments: true,
        requests: {
          orderBy: { createdAt: 'desc' },
        },
        payments: true,
        agent: true, // ✅ ONLY THIS LINE ADDED
      },
    });

    if (!booking) {
      return NextResponse.json({ message: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json(booking);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}