// scripts/assign-agent-ids.ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // সব USER যাদের agentId নেই
  const agents = await prisma.user.findMany({
    where: { role: "USER" },
    orderBy: { createdAt: "asc" },
    select: { id: true, agentId: true },
  });

  console.log(`Total agents: ${agents.length}`);

  let count = 0;

  for (const agent of agents) {
    // যদি already agentId থাকে, skip করো
    if (agent.agentId) {
      console.log(`⏭️  Skipped ${agent.agentId}`);
      continue;
    }

    count++;
    const agentId = `MPA${String(count).padStart(3, "0")}`;

    await prisma.user.update({
      where: { id: agent.id },
      data: { agentId },
    });

    console.log(`✅ Assigned ${agentId}`);
  }

  console.log(`\n🎉 Done! ${count} agents updated.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error("❌ Error:", e);
    prisma.$disconnect();
    process.exit(1);
  });