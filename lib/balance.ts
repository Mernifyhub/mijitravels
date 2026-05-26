// lib/balance.ts

import prisma from "@/lib/prisma";

/**
 * ✅ Primary function — Get normalized agent balance
 */
export async function getAgentBalance(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      balance: true,
      creditLimit: true,
      usedLimit: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // ✅ DB তে যা আছে সেটাই actual balance
  const storedBalance = Math.max(0, Number(user.balance) || 0);
  const creditLimit = Math.max(0, Number(user.creditLimit) || 0);
  const usedLimit = Math.max(0, Number(user.usedLimit) || 0);

  // ✅ wallet = DB balance
  const walletBalance = storedBalance;
  const availableCredit = Math.max(0, creditLimit - usedLimit);
  const totalAvailable = walletBalance + availableCredit;

  return {
    balance: walletBalance,
    walletBalance,
    storedBalance,
    creditLimit,
    usedLimit,
    availableCredit,
    remainingCredit: availableCredit,
    totalAvailable,
  };
}

/**
 * @deprecated Use getAgentBalance() instead
 */
export async function calculateAgentBalance(userId: string): Promise<{
  balance: number;
  walletBalance: number;
  storedBalance: number;
  creditLimit: number;
  usedLimit: number;
  availableCredit: number;
  totalAvailable: number;
  totalDeposits: number;
  totalBookings: number;
  manualEffect: number;
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      balance: true,
      creditLimit: true,
      usedLimit: true,
    },
  });

  // ✅ DB তে যা আছে সেটাই actual balance
  const storedBalance = Math.max(0, Number(user?.balance) || 0);
  const creditLimit = Math.max(0, Number(user?.creditLimit) || 0);
  const usedLimit = Math.max(0, Number(user?.usedLimit) || 0);

  // ✅ wallet = DB balance
  const walletBalance = storedBalance;
  const availableCredit = Math.max(0, creditLimit - usedLimit);
  const totalAvailable = walletBalance + availableCredit;

  const [depositAgg, bookingAgg] = await Promise.all([
    prisma.deposit.aggregate({
      where: { userId, status: "SUCCESS" },
      _sum: { amount: true },
    }),
    prisma.booking.aggregate({
      where: { agentId: userId },
      _sum: { net: true },
    }),
  ]);

  return {
    balance: walletBalance,
    walletBalance,
    storedBalance,
    creditLimit,
    usedLimit,
    availableCredit,
    totalAvailable,
    totalDeposits: Number(depositAgg._sum.amount) || 0,
    totalBookings: Number(bookingAgg._sum.net) || 0,
    manualEffect: 0,
  };
}