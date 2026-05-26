import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Example: Get pending deposits as notifications
    const pendingDeposits = await prisma.deposit.count({ where: { status: "PENDING" } });
    
    const notifications = [
      { id: "1", type: "deposit", title: "Pending Deposits", message: `${pendingDeposits} deposits waiting for approval`, time: "Just now", read: false },
    ];

    return NextResponse.json({ 
      notifications, 
      unreadCount: notifications.filter(n => !n.read).length 
    });
  } catch {
    return NextResponse.json({ notifications: [], unreadCount: 0 });
  }
}