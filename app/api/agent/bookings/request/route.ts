// app/api/bookings/request/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const decoded = jwt.verify(token, process.env.SECRET_KEY!) as { id: string };
    const { bookingId, type, remarks } = await req.json();

    // Check booking exists and belongs to agent
    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, agentId: decoded.id },
    });

    if (!booking) {
      return NextResponse.json({ message: 'Booking not found' }, { status: 404 });
    }

    // Check for duplicate pending request
    const existingRequest = await prisma.bookingRequest.findFirst({
      where: {
        bookingId,
        type: type as any,
        status: 'PENDING',
      },
    });

    if (existingRequest) {
      return NextResponse.json({ message: `A ${type} request is already pending` }, { status: 400 });
    }

    // Create request
    const request = await prisma.bookingRequest.create({
      data: {
        bookingId,
        agentId: decoded.id,
        type: type as any,
        status: 'PENDING',
        remarks: remarks || null,
      },
    });

    return NextResponse.json({
      success: true,
      requestId: request.id,
      message: `${type} request submitted successfully`,
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}