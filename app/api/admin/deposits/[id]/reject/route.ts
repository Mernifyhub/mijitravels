import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

const SECRET_KEY = process.env.SECRET_KEY!;

async function getAdminUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return null;

    const decoded: any = jwt.verify(token, SECRET_KEY);
    if (decoded.role === "ADMIN" || decoded.role === "MANAGER") {
      return decoded;
    }
    return null;
  } catch (err) {
    console.error("Auth error:", err);
    return null;
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;   // ← এখানেও await করা হয়েছে

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const body = await request.json();
    const { rejectionNote } = body;

    if (!rejectionNote?.trim()) {
      return NextResponse.json({ error: "Rejection reason is required" }, { status: 400 });
    }

    const deposit = await prisma.deposit.findUnique({
      where: { id },
    });

    if (!deposit) {
      return NextResponse.json({ error: "Deposit not found" }, { status: 404 });
    }

    if (deposit.status !== "PENDING") {
      return NextResponse.json({ error: "Deposit is already processed" }, { status: 400 });
    }

    const updatedDeposit = await prisma.deposit.update({
      where: { id },
      data: {
        status: "FAILED",
        rejectedAt: new Date(),
        rejectionNote: rejectionNote,
         approvedBy: admin.email || admin.id || "Admin", 
      },
    });

    console.log("✅ Deposit Rejected:", id);

    return NextResponse.json({
      success: true,
      message: "Deposit rejected successfully",
      deposit: updatedDeposit,
    });
  } catch (error: any) {
    console.error("🔴 Reject Error:", error);
    return NextResponse.json(
      { error: "Server error", message: error.message },
      { status: 500 }
    );
  }
}