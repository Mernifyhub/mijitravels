// scripts/rebuild-agent-ids.ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function pad(n: number, size = 2) {
  return String(n).padStart(size, "0");
}

// Format: MPA1904202601
function getDatePrefix(date: Date) {
  const day = pad(date.getUTCDate());
  const month = pad(date.getUTCMonth() + 1);
  const year = date.getUTCFullYear();

  return `MPA${day}${month}${year}`;
}

function getDisplayName(agent: {
  id: string;
  agentName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
}) {
  const fullName = [agent.firstName, agent.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return agent.agentName || fullName || agent.id;
}

async function main() {
  const agents = await prisma.user.findMany({
    where: { role: "USER" },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      agentId: true,
      agentName: true,
      firstName: true,
      lastName: true,
      createdAt: true,
    },
  });

  console.log(`Total agents found: ${agents.length}`);

  const dateCounters: Record<string, number> = {};
  let updatedCount = 0;

  for (const agent of agents) {
    const prefix = getDatePrefix(agent.createdAt);

    if (!dateCounters[prefix]) {
      dateCounters[prefix] = 1;
    } else {
      dateCounters[prefix]++;
    }

    const serial = pad(dateCounters[prefix]);
    const newAgentId = `${prefix}${serial}`;
    const displayName = getDisplayName(agent);

    if (agent.agentId === newAgentId) {
      console.log(`⏭️ Already correct: ${displayName} -> ${newAgentId}`);
      continue;
    }

    await prisma.user.update({
      where: { id: agent.id },
      data: { agentId: newAgentId },
    });

    updatedCount++;

    console.log(
      `✅ Updated ${displayName}: ${agent.agentId || "NULL"} -> ${newAgentId}`
    );
  }

  console.log(`\n🎉 Done! ${updatedCount} agents updated.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Error:", e);
    await prisma.$disconnect();
    process.exit(1);
  });