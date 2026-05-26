// scripts/reset.mjs

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const AGENT_ID = "9562ae0e-7b0f-4aa0-bb87-937c1267be8a"; // ← এখানে UUID দাও

async function main() {
  console.log("🗑️ Deleting data for agent:", AGENT_ID);

  const [manualOps, deposits, bookings] = await Promise.all([
    prisma.manualOperation.deleteMany({
      where: { userId: AGENT_ID },
    }),
    prisma.deposit.deleteMany({
      where: { userId: AGENT_ID },
    }),
    prisma.booking.deleteMany({
      where: { agentId: AGENT_ID },
    }),
  ]);

  console.log("✅ Done!");
  console.log("Manual Operations deleted:", manualOps.count);
  console.log("Deposits deleted:", deposits.count);
  console.log("Bookings deleted:", bookings.count);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

  //node scripts/reset.mjs