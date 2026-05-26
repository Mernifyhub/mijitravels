import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // শুধু USER role
  const users = await prisma.user.findMany({
    where: { role: "USER" },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      email: true,
      agentId: true,
      firstName: true,
      lastName: true,
    },
  });

  console.log(`Total USER records: ${users.length}`);

  // existing MPA ids থেকে max বের করো
  const existingNumbers = users
    .map((u) => u.agentId || "")
    .filter((id) => /^MPA\d+$/.test(id))
    .map((id) => parseInt(id.replace("MPA", ""), 10))
    .filter((n) => Number.isFinite(n));

  let currentMax = existingNumbers.length ? Math.max(...existingNumbers) : 0;

  console.log(`Current highest MPA number: ${currentMax}`);

  let updatedCount = 0;
  let skippedCount = 0;

  for (const user of users) {
    if (user.agentId) {
      console.log(`⏭️ Skipped ${user.email} → ${user.agentId}`);
      skippedCount++;
      continue;
    }

    currentMax++;
    const nextAgentId = `MPA${String(currentMax).padStart(4, "0")}`;

    await prisma.user.update({
      where: { id: user.id },
      data: { agentId: nextAgentId },
    });

    console.log(
      `✅ Assigned ${nextAgentId} → ${user.email} (${user.firstName || ""} ${user.lastName || ""})`
    );

    updatedCount++;
  }

  console.log("\n🎉 Done!");
  console.log(`Updated: ${updatedCount}`);
  console.log(`Skipped: ${skippedCount}`);
  console.log(`Last assigned number: ${currentMax}`);
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
  //node scripts/assign-agent-ids.mjs 