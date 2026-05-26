// app/api/user/deposits/route.ts

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// ✅ Force Node.js runtime (Edge এ jwt কাজ করে না)
export const runtime = "nodejs";

// Auth helper
async function getAuthUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return null;
    const decoded = jwt.verify(token, process.env.SECRET_KEY!) as {
      id: string;
      role: string;
    };
    return decoded;
  } catch (error) {
    console.error("Auth error:", error);
    return null;
  }
}

// ============ GET ============
export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const deposits = await prisma.deposit.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    const approved = deposits.filter((d) => d.status === "SUCCESS");
    const pending = deposits.filter((d) => d.status === "PENDING");

    return NextResponse.json({
      deposits: deposits.map((d) => ({
        id: d.id,
        amount: d.amount,
        currency: d.currency,
        method: d.method,
        status: d.status,
        transactionId: d.transactionId,
        reference: d.reference,
        notes: d.notes,
        attachment: d.attachment,
        approvedAt: d.approvedAt,
        rejectedAt: d.rejectedAt,
        rejectionNote: d.rejectionNote,
        createdAt: d.createdAt,
      })),
      stats: {
        totalDeposits: approved.reduce((s, d) => s + d.amount, 0),
        pendingCount: pending.length,
        pendingAmount: pending.reduce((s, d) => s + d.amount, 0),
        approvedCount: approved.length,
        approvedAmount: approved.reduce((s, d) => s + d.amount, 0),
      },
    });
  } catch (err: any) {
    console.error("Deposits GET Error:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// ============ POST ============
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // ✅ Safe FormData parse with error handling
    let formData: FormData;
    try {
      formData = await req.formData();
    } catch (parseError) {
      console.error("FormData parse error:", parseError);
      return NextResponse.json(
        { message: "Invalid form data" },
        { status: 400 }
      );
    }

    const amount = formData.get("amount") as string;
    const method = formData.get("method") as string;
    const transactionId = formData.get("transactionId") as string;
    const notes = formData.get("notes") as string;
    const file = formData.get("attachment") as File | null;

    // ✅ Validate required fields
    if (!amount || !method) {
      return NextResponse.json(
        { message: "Amount and method are required" },
        { status: 400 }
      );
    }

    const depositAmount = parseFloat(amount);

    if (isNaN(depositAmount) || depositAmount < 100) {
      return NextResponse.json(
        { message: "Minimum deposit amount is SAR 100" },
        { status: 400 }
      );
    }

    // ✅ Validate method
    const validMethods = ["BANK_TRANSFER", "CARD", "MOBILE_BANKING", "CASH"];
    if (!validMethods.includes(method)) {
      return NextResponse.json(
        { message: "Invalid payment method" },
        { status: 400 }
      );
    }

    // ✅ File upload handle with better error handling
    let attachmentUrl: string | null = null;

    if (file && file.size > 0) {
      try {
        // File type check
        const allowed = [
          "image/jpeg",
          "image/png",
          "image/webp",
          "image/jpg",
          "application/pdf",
        ];
        if (!allowed.includes(file.type)) {
          return NextResponse.json(
            { message: "Only JPG, PNG, WEBP, PDF files allowed" },
            { status: 400 }
          );
        }

        // Max 5MB
        if (file.size > 5 * 1024 * 1024) {
          return NextResponse.json(
            { message: "File size must be under 5MB" },
            { status: 400 }
          );
        }

        // Save file
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const uploadsDir = path.join(
          process.cwd(),
          "public",
          "uploads",
          "receipts"
        );
        await mkdir(uploadsDir, { recursive: true });

        const ext = file.name.split(".").pop() || "jpg";
        const safeName = ext.replace(/[^a-zA-Z0-9]/g, ""); // sanitize
        const filename = `receipt-${user.id}-${Date.now()}.${safeName}`;
        const filepath = path.join(uploadsDir, filename);

        await writeFile(filepath, buffer);
        attachmentUrl = `/uploads/receipts/${filename}`;
      } catch (fileError) {
        console.error("File upload error:", fileError);
        // ✅ File upload fail হলেও deposit create করবে - just attachment null থাকবে
        attachmentUrl = null;
      }
    }

    // Unique reference
    const reference = `DEP-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 5)
      .toUpperCase()}`;

    // ✅ Create deposit with try-catch
    const deposit = await prisma.deposit.create({
      data: {
        userId: user.id,
        amount: depositAmount,
        currency: "SAR",
        method: method as any,
        status: "PENDING",
        transactionId: transactionId?.trim() || null,
        reference,
        notes: notes?.trim() || null,
        attachment: attachmentUrl,
      },
    });

    return NextResponse.json(
      {
        message: "Deposit request submitted successfully",
        deposit: {
          id: deposit.id,
          amount: deposit.amount,
          method: deposit.method,
          status: deposit.status,
          reference: deposit.reference,
          attachment: deposit.attachment,
          createdAt: deposit.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("❌ Deposits POST Error:", err?.message || err);
    console.error("❌ Full error:", JSON.stringify(err, null, 2));

    if (err.code === "P2002") {
      return NextResponse.json(
        { message: "Duplicate reference, please try again" },
        { status: 409 }
      );
    }

    // ✅ Prisma validation error
    if (err.code === "P2003") {
      return NextResponse.json(
        { message: "Invalid user reference" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: err?.message || "Failed to create deposit" },
      { status: 500 }
    );
  }
}