// app/api/admin/deposits/[id]/approve/route.ts

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
    if (decoded.role === "ADMIN" || decoded.role === "MANAGER") return decoded;
    return null;
  } catch {
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

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    // ✅ Single transaction — atomic!
    const result = await prisma.$transaction(async (tx) => {

      // Step 1: Get deposit
      const deposit = await tx.deposit.findUnique({
        where: { id },
      });

      if (!deposit) throw new Error("DEPOSIT_NOT_FOUND");
      if (deposit.status !== "PENDING") throw new Error("ALREADY_PROCESSED");

      // Step 2: Get agent current state
      const agent = await tx.user.findUnique({
        where: { id: deposit.userId },
        select: {
          id: true,
          agentName: true,
          firstName: true,
          lastName: true,
          balance: true,
          creditLimit: true,
          usedLimit: true,
        },
      });

      if (!agent) throw new Error("AGENT_NOT_FOUND");

      const depositAmount = Number(deposit.amount);
      const currentBalance = Number(agent.balance) || 0;
      const currentCreditLimit = Number(agent.creditLimit) || 0;
      const currentUsedLimit = Number(agent.usedLimit) || 0;

      let balanceAdded = 0;
      let creditRepaid = 0;
      let newBalance = currentBalance;
      let newUsedLimit = currentUsedLimit;

      // ✅ Credit Limit Repay Logic
      if (currentUsedLimit > 0) {
        if (depositAmount >= currentUsedLimit) {
          // Case 2: Deposit >= usedLimit
          // পুরো credit repay + বাকি balance এ
          creditRepaid = currentUsedLimit;
          balanceAdded = depositAmount - currentUsedLimit;
          newUsedLimit = 0;
          newBalance = currentBalance + balanceAdded;
        } else {
          // Case 1: Deposit < usedLimit
          // আংশিক credit repay, balance unchanged
          creditRepaid = depositAmount;
          balanceAdded = 0;
          newUsedLimit = currentUsedLimit - depositAmount;
          newBalance = currentBalance; // unchanged
        }
      } else {
        // No credit used — সরাসরি balance এ
        creditRepaid = 0;
        balanceAdded = depositAmount;
        newUsedLimit = 0;
        newBalance = currentBalance + depositAmount;
      }

      // Step 3: Update deposit status
      const updatedDeposit = await tx.deposit.update({
        where: { id },
        data: {
          status: "SUCCESS",
          approvedAt: new Date(),
          approvedBy: admin.email || admin.id || "Admin",
          notes: creditRepaid > 0
            ? `Approved. Credit repaid: ${creditRepaid} SAR${balanceAdded > 0 ? `, Balance added: ${balanceAdded} SAR` : ""}`
            : `Approved. Balance added: ${balanceAdded} SAR`,
        },
      });

      // Step 4: Update user balance & usedLimit
      await tx.user.update({
        where: { id: agent.id },
        data: {
          balance: newBalance,
          usedLimit: newUsedLimit,
        },
      });

      // Step 5: Verify update
      const updatedAgent = await tx.user.findUnique({
        where: { id: agent.id },
        select: { balance: true, creditLimit: true, usedLimit: true },
      });

      return {
        deposit: updatedDeposit,
        before: {
          balance: currentBalance,
          creditLimit: currentCreditLimit,
          usedLimit: currentUsedLimit,
          availableCredit: Math.max(0, currentCreditLimit - currentUsedLimit),
        },
        after: {
          balance: Number(updatedAgent?.balance) || 0,
          creditLimit: Number(updatedAgent?.creditLimit) || 0,
          usedLimit: Number(updatedAgent?.usedLimit) || 0,
          availableCredit: Math.max(0, (updatedAgent?.creditLimit || 0) - (updatedAgent?.usedLimit || 0)),
        },
        breakdown: {
          depositAmount,
          creditRepaid,
          balanceAdded,
        },
        agentName: agent.agentName || `${agent.firstName} ${agent.lastName}`,
      };
    });

    // ✅ Detailed log
    console.log(`
╔══════════════════════════════════════════╗
║         DEPOSIT APPROVED ✅              ║
╠══════════════════════════════════════════╣
║ Deposit ID:     ${id}
║ Agent:          ${result.agentName}
║ Amount:         ${result.breakdown.depositAmount} SAR
║──────────────────────────────────────────
║ Credit Repaid:  ${result.breakdown.creditRepaid} SAR
║ Balance Added:  ${result.breakdown.balanceAdded} SAR
║──────────────────────────────────────────
║ BEFORE:
║   Balance:      ${result.before.balance} SAR
║   Used Limit:   ${result.before.usedLimit} SAR
║   Avail Credit: ${result.before.availableCredit} SAR
║──────────────────────────────────────────
║ AFTER:
║   Balance:      ${result.after.balance} SAR
║   Used Limit:   ${result.after.usedLimit} SAR
║   Avail Credit: ${result.after.availableCredit} SAR
╚══════════════════════════════════════════╝
    `);

    return NextResponse.json({
      success: true,
      message: "Deposit approved successfully",
      deposit: {
        id: result.deposit.id,
        status: result.deposit.status,
        amount: result.deposit.amount,
        approvedAt: result.deposit.approvedAt,
      },
      summary: {
        depositAmount: result.breakdown.depositAmount,
        creditRepaid: result.breakdown.creditRepaid,
        balanceAdded: result.breakdown.balanceAdded,
        message: result.breakdown.creditRepaid > 0
          ? result.breakdown.balanceAdded > 0
            ? `Credit repaid: ${result.breakdown.creditRepaid} SAR | Balance added: ${result.breakdown.balanceAdded} SAR`
            : `Credit repaid: ${result.breakdown.creditRepaid} SAR (full deposit used for credit repayment)`
          : `Balance added: ${result.breakdown.balanceAdded} SAR`,
      },
      before: result.before,
      after: result.after,
    });

  } catch (error: any) {
    console.error("🔴 Approve Error:", error.message);

    const errorMap: Record<string, { msg: string; status: number }> = {
      DEPOSIT_NOT_FOUND: { msg: "Deposit not found", status: 404 },
      ALREADY_PROCESSED: { msg: "Deposit is already processed", status: 400 },
      AGENT_NOT_FOUND: { msg: "Agent not found", status: 404 },
    };

    const mapped = errorMap[error.message];
    if (mapped) {
      return NextResponse.json({ error: mapped.msg }, { status: mapped.status });
    }

    return NextResponse.json(
      { error: "Server error", message: error.message },
      { status: 500 }
    );
  }
}