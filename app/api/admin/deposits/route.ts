// app/api/admin/deposits/route.ts

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import { calculateAgentBalance } from "@/lib/balance";

const SECRET_KEY = process.env.SECRET_KEY!;

// ✅ Auth check - GET এও security add করা হলো
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
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    // ✅ Auth check
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const deposits = await prisma.deposit.findMany({
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            agentName: true,    // company name
            agentId: true,      // MPA001
            aviationNumber: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // ✅ Get real balance for each unique agent
    const uniqueUserIds = [...new Set(deposits.map((d) => d.userId))];
    const balanceMap = new Map<string, number>();

    await Promise.all(
      uniqueUserIds.map(async (userId) => {
        const { balance } = await calculateAgentBalance(userId);
        balanceMap.set(userId, balance);
      })
    );

    // ✅ Payment method → type mapping
    const getType = (method: string): "Bank" | "Cash" | "MFS" => {
      if (method === "BANK_TRANSFER") return "Bank";
      if (method === "CASH") return "Cash";
      return "MFS";
    };

    // ✅ Payment method → display name
    const getMethodLabel = (method: string): string => {
      const labels: Record<string, string> = {
        BANK_TRANSFER: "Bank Transfer",
        CASH: "Cash",
        CARD: "Card",
        MOBILE_BANKING: "Mobile Banking",
        MANUAL: "Manual",
      };
      return labels[method] || method;
    };

    const formatted = deposits.map((d) => {
      const currentBalance = balanceMap.get(d.userId) || 0;

      return {
        id: d.id,
        userId: d.userId,

        // ✅ Agent ID - MPA001 format
        agentId: d.user?.agentId || d.user?.aviationNumber || d.userId.slice(0, 8).toUpperCase(),

        // ✅ Company/Agency name - agentName field
        agentName: d.user?.agentName || `${d.user?.firstName || ""} ${d.user?.lastName || ""}`.trim() || "Unknown",

        // ✅ Full name separately
        agentFullName: d.user
          ? `${d.user.firstName} ${d.user.lastName}`.trim()
          : "Unknown",

        agentPhone: d.user?.phone || "N/A",
        agentEmail: d.user?.email || "N/A",

        status: d.status as "PENDING" | "SUCCESS" | "FAILED",
        type: getType(d.method),
        senderAcc: getMethodLabel(d.method),
        senderType: d.method.toLowerCase().replace("_", ""),
        receiver: d.transactionId || "N/A",
        amount: d.amount,
        currency: d.currency || "SAR",
        requestedAt: d.createdAt.toISOString(),
        processedAt: d.approvedAt?.toISOString() || d.rejectedAt?.toISOString() || null,
        processedBy: d.approvedBy || null,
        reference: d.reference || `DEP-${d.id.slice(0, 8)}`,
        remarks: d.notes || null,
        rejectionNote: d.rejectionNote || null,
        transactionId: d.transactionId || null,

        // ✅ Real balance from calculateAgentBalance
        previousBalance: currentBalance,

        // ✅ Receipt attachment
        attachment: d.attachment || null,
      };
    });

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("🔴 API Error:", error);
    return NextResponse.json(
      { error: "Server error", message: String(error) },
      { status: 500 }
    );
  }
}