import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { getAgentBalance } from "@/lib/balance";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY!) as {
      id: string;
      type?: string;
      agentId?: string;
    };

    const agentId = decoded.type === "subuser" ? decoded.agentId! : decoded.id;

    const balanceData = await getAgentBalance(agentId);

    return NextResponse.json({
      success: true,
      balance: balanceData.balance,
      walletBalance: balanceData.walletBalance,
      storedBalance: balanceData.storedBalance,
      creditLimit: balanceData.creditLimit,
      usedLimit: balanceData.usedLimit,
      availableCredit: balanceData.availableCredit,
      remainingCredit: balanceData.remainingCredit,
      totalAvailable: balanceData.totalAvailable,
      currency: "SAR",
    });
  } catch (error: any) {
    if (
      error?.name === "JsonWebTokenError" ||
      error?.name === "TokenExpiredError"
    ) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { message: error.message || "Failed to fetch balance" },
      { status: 500 }
    );
  }
}