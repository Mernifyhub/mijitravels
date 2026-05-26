import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { z } from "zod";

const SECRET_KEY = process.env.SECRET_KEY!;

async function getAdminUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return null;

    const decoded: any = jwt.verify(token, SECRET_KEY);

    if (decoded.role === "ADMIN" || decoded.role === "MANAGER") {
      return {
        id: decoded.id,
        role: decoded.role,
        email: decoded.email || null,
      };
    }
    return null;
  } catch {
    return null;
  }
}

const ALL_OPERATION_TYPES = [
  "refund",
  "acm",
  "adm",
  "manual_booking",
  "amount_deduct",
  "date_change",
  "add_credit",
  "limit_add",
  "amount_add",
  "adjustment",
  "bonus",
  "penalty",
] as const;

type OperationType = (typeof ALL_OPERATION_TYPES)[number];

const CREDIT_TYPES: OperationType[] = [
  "refund",
  "acm",
  "amount_add",
  "bonus",
  "adjustment",
];

const DEBIT_TYPES: OperationType[] = [
  "adm",
  "manual_booking",
  "amount_deduct",
  "date_change",
  "penalty",
];

const LIMIT_TYPES: OperationType[] = ["add_credit", "limit_add"];

function isCredit(type: OperationType): boolean {
  return CREDIT_TYPES.includes(type);
}

function isLimitType(type: OperationType): boolean {
  return LIMIT_TYPES.includes(type);
}

const manualOperationSchema = z.object({
  agentId: z.string().min(1).optional(),
  userId: z.string().min(1).optional(),
  operationType: z.string().optional(),
  type: z.string().optional(),
  amount: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val > 0, {
      message: "Amount must be a positive number",
    }),
  description: z.string().optional(),
  note: z.string().optional(),
  reference: z.string().optional(),
  pnr: z.string().optional(),
  passengerName: z.string().optional(),
  route: z.string().optional(),
  travelDate: z.string().optional(),
  newLimit: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .optional(),
  previousLimit: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .optional(),
});

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminUser();

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const parsed = manualOperationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: parsed.error.flatten().fieldErrors,
          received: body,
        },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const userId = data.agentId || data.userId;
    const type = (data.operationType || data.type) as OperationType;
    const amountNum = Number(data.amount);
    const description = data.description || data.note || "";
    const reference = data.reference || `MOP-${Date.now()}`;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User/Agent ID is required" },
        { status: 400 }
      );
    }

    if (!ALL_OPERATION_TYPES.includes(type as any)) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid operation type: "${type}". Valid types: ${ALL_OPERATION_TYPES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        balance: true,
        creditLimit: true,
        usedLimit: true,
        firstName: true,
        lastName: true,
        email: true,
        agentName: true,
      },
    });

    if (!targetUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // ✅ Normalize — balance কখনো negative না
    const rawBalance = Number(targetUser.balance || 0);
    const walletBalance = Math.max(0, rawBalance);
    const currentCreditLimit = Number(targetUser.creditLimit || 0);
    const currentUsedLimit = Number(targetUser.usedLimit || 0);
    const availableCredit = Math.max(0, currentCreditLimit - currentUsedLimit);
    const totalAvailable = walletBalance + availableCredit;

    // ============================================
    // CREDIT LIMIT OPERATION
    // ============================================
    if (isLimitType(type)) {
      const newLimit = Number(data.newLimit || amountNum);

      const result = await prisma.$transaction(async (tx) => {
        const operation = await tx.manualOperation.create({
          data: {
            userId,
            createdBy: admin.email || admin.id,
            type,
            amount: amountNum,
            status: "COMPLETED",
            description: description || `Credit limit set to ${newLimit}`,
            reference,
            newLimit,
            previousLimit: currentCreditLimit,
          },
        });

        const updatedUser = await tx.user.update({
          where: { id: userId },
          data: {
            creditLimit: newLimit,
          },
          select: {
            id: true,
            balance: true,
            creditLimit: true,
            usedLimit: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        });

        return { operation, updatedUser };
      });

      const userName =
        targetUser.agentName ||
        `${targetUser.firstName} ${targetUser.lastName}`.trim() ||
        targetUser.email;

      console.log(`
╔══════════════════════════════════════════╗
║       CREDIT LIMIT UPDATED ✅            ║
╠══════════════════════════════════════════╣
║ Agent:          ${userName}
║ Previous Limit: ${currentCreditLimit}
║ New Limit:      ${newLimit}
║ Available:      ${Math.max(0, newLimit - currentUsedLimit)}
╚══════════════════════════════════════════╝
      `);

      return NextResponse.json(
        {
          success: true,
          message: `Credit limit updated to ${newLimit} SAR`,
          data: {
            operationId: result.operation.id,
            userId,
            userName,
            type,
            previousLimit: currentCreditLimit,
            newLimit,
            availableCredit: Math.max(0, newLimit - currentUsedLimit),
            reference: result.operation.reference,
            status: "COMPLETED",
          },
        },
        { status: 201 }
      );
    }

    // ============================================
    // BALANCE OPERATION (Credit / Debit)
    // ============================================
    const credit = isCredit(type);

    // ✅ CREDIT operation — deposit logic follow করবে
    // আগে usedLimit clear হবে, তারপে balance এ যাবে
    if (credit) {
      const result = await prisma.$transaction(async (tx) => {
        const operation = await tx.manualOperation.create({
          data: {
            userId,
            createdBy: admin.email || admin.id,
            type,
            amount: amountNum,
            status: "COMPLETED",
            description: description || `Manual ${type}`,
            reference,
            pnr: data.pnr || null,
            passengerName: data.passengerName || null,
            route: data.route || null,
            travelDate: data.travelDate ? new Date(data.travelDate) : null,
          },
        });

        // ✅ Same deposit logic — আগে credit clear, তারপর balance add
        let creditRepaid = 0;
        let balanceAdded = 0;
        let newUsedLimit = currentUsedLimit;
        let newBalance = walletBalance;

        if (currentUsedLimit > 0) {
          creditRepaid = Math.min(amountNum, currentUsedLimit);
          balanceAdded = amountNum - creditRepaid;

          newUsedLimit = currentUsedLimit - creditRepaid;
          newBalance = walletBalance + balanceAdded;
        } else {
          balanceAdded = amountNum;
          newBalance = walletBalance + amountNum;
        }

        const updatedUser = await tx.user.update({
          where: { id: userId },
          data: {
            balance: newBalance,
            usedLimit: newUsedLimit,
          },
          select: {
            id: true,
            balance: true,
            creditLimit: true,
            usedLimit: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        });

        return {
          operation,
          updatedUser,
          creditRepaid,
          balanceAdded,
          newBalance,
          newUsedLimit,
        };
      });

      const newBalance = Number(result.updatedUser.balance);
      const userName =
        targetUser.agentName ||
        `${targetUser.firstName} ${targetUser.lastName}`.trim() ||
        targetUser.email;

      console.log(`
╔══════════════════════════════════════════╗
║       MANUAL CREDIT ✅                   ║
╠══════════════════════════════════════════╣
║ Agent:          ${userName}
║ Type:           ${type} (CREDIT)
║ Amount:         ${amountNum} SAR
║ Credit Repaid:  ${result.creditRepaid} SAR
║ Balance Added:  ${result.balanceAdded} SAR
║ Before Wallet:  ${walletBalance} SAR
║ After Wallet:   ${newBalance} SAR
║ Before Used:    ${currentUsedLimit} SAR
║ After Used:     ${result.newUsedLimit} SAR
╚══════════════════════════════════════════╝
      `);

      return NextResponse.json(
        {
          success: true,
          message: `Manual ${type} completed successfully`,
          data: {
            operationId: result.operation.id,
            userId,
            userName,
            type,
            amount: amountNum,
            balanceEffect: `+${amountNum}`,
            creditRepaid: result.creditRepaid,
            balanceAdded: result.balanceAdded,
            previousBalance: walletBalance,
            currentBalance: newBalance,
            reference: result.operation.reference,
            status: "COMPLETED",
            createdAt: result.operation.createdAt,
          },
        },
        { status: 201 }
      );
    }

    // ✅ DEBIT operation — booking logic follow করবে
    // আগে wallet থেকে, তারপর credit থেকে
    if (totalAvailable < amountNum) {
      return NextResponse.json(
        {
          success: false,
          message: `Insufficient funds. Wallet: ${walletBalance.toFixed(2)} SAR, Credit: ${availableCredit.toFixed(2)} SAR, Total: ${totalAvailable.toFixed(2)} SAR, Required: ${amountNum.toFixed(2)} SAR`,
        },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const operation = await tx.manualOperation.create({
        data: {
          userId,
          createdBy: admin.email || admin.id,
          type,
          amount: amountNum,
          status: "COMPLETED",
          description: description || `Manual ${type}`,
          reference,
          pnr: data.pnr || null,
          passengerName: data.passengerName || null,
          route: data.route || null,
          travelDate: data.travelDate ? new Date(data.travelDate) : null,
        },
      });

      // ✅ Same booking logic — আগে wallet, তারপর credit
      const deductFromWallet = Math.min(walletBalance, amountNum);
      const deductFromCredit = amountNum - deductFromWallet;

      const newBalance = walletBalance - deductFromWallet;
      const newUsedLimit = currentUsedLimit + deductFromCredit;

      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          balance: newBalance,
          usedLimit: newUsedLimit,
        },
        select: {
          id: true,
          balance: true,
          creditLimit: true,
          usedLimit: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      });

      return {
        operation,
        updatedUser,
        deductFromWallet,
        deductFromCredit,
        newBalance,
        newUsedLimit,
      };
    });

    const newBalance = Number(result.updatedUser.balance);
    const userName =
      targetUser.agentName ||
      `${targetUser.firstName} ${targetUser.lastName}`.trim() ||
      targetUser.email;

    console.log(`
╔══════════════════════════════════════════╗
║       MANUAL DEBIT ✅                    ║
╠══════════════════════════════════════════╣
║ Agent:          ${userName}
║ Type:           ${type} (DEBIT)
║ Amount:         ${amountNum} SAR
║ From Wallet:    ${result.deductFromWallet} SAR
║ From Credit:    ${result.deductFromCredit} SAR
║ Before Wallet:  ${walletBalance} SAR
║ After Wallet:   ${newBalance} SAR
║ Before Used:    ${currentUsedLimit} SAR
║ After Used:     ${result.newUsedLimit} SAR
╚══════════════════════════════════════════╝
    `);

    return NextResponse.json(
      {
        success: true,
        message: `Manual ${type} completed successfully`,
        data: {
          operationId: result.operation.id,
          userId,
          userName,
          type,
          amount: amountNum,
          balanceEffect: `-${amountNum}`,
          fromWallet: result.deductFromWallet,
          fromCredit: result.deductFromCredit,
          previousBalance: walletBalance,
          currentBalance: newBalance,
          reference: result.operation.reference,
          status: "COMPLETED",
          createdAt: result.operation.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Manual operation error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to create manual operation",
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminUser();

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 10);
    const type = searchParams.get("type") || "";
    const userId = searchParams.get("userId") || "";
    const status = searchParams.get("status") || "";

    const skip = (page - 1) * limit;

    const whereClause: any = {
      ...(type ? { type } : {}),
      ...(userId ? { userId } : {}),
      ...(status ? { status } : {}),
    };

    const [operations, total] = await Promise.all([
      prisma.manualOperation.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          type: true,
          amount: true,
          status: true,
          description: true,
          reference: true,
          pnr: true,
          passengerName: true,
          route: true,
          newLimit: true,
          previousLimit: true,
          createdBy: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              agentName: true,
              balance: true,
              creditLimit: true,
              usedLimit: true,
            },
          },
        },
      }),
      prisma.manualOperation.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      success: true,
      data: operations.map((op) => ({
        ...op,
        amount: Number(op.amount),
        user: {
          ...op.user,
          balance: Math.max(0, Number(op.user?.balance || 0)),
          name:
            op.user?.agentName ||
            `${op.user?.firstName || ""} ${op.user?.lastName || ""}`.trim() ||
            op.user?.email,
        },
        isCredit: CREDIT_TYPES.includes(op.type as OperationType),
        isLimitOp: LIMIT_TYPES.includes(op.type as OperationType),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Manual operation list error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch manual operations",
      },
      { status: 500 }
    );
  }
}