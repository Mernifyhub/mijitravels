// lib/generate-agent-id.ts

import prisma from "@/lib/prisma";

/**
 * MPA1904202601 format এ unique agent ID generate করে
 * Format: MPA + DDMMYYYY + 2 digit serial
 * Example: MPA1904202601, MPA1904202602, MPA2004202601
 */
export async function generateAgentId(): Promise<string> {
  const prefix = "MPA";

  // ✅ আজকের তারিখ DDMMYYYY format এ
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yyyy = String(now.getFullYear());
  const dateStr = `${dd}${mm}${yyyy}`; // 19042026

  // ✅ আজকের prefix = MPA19042026
  const todayPrefix = `${prefix}${dateStr}`;

  // ✅ আজকে কয়টা agent create হয়েছে
  const todayAgents = await prisma.user.findMany({
    where: {
      role: "USER",
      agentId: {
        startsWith: todayPrefix,
      },
    },
    select: { agentId: true },
  });

  // ✅ আজকের সর্বোচ্চ serial number বের করো
  let maxSerial = 0;

  todayAgents.forEach((agent) => {
    if (agent.agentId) {
      // MPA19042026XX থেকে শেষ 2 digit নাও
      const serialStr = agent.agentId.slice(todayPrefix.length);
      const serial = parseInt(serialStr, 10);
      if (!isNaN(serial) && serial > maxSerial) {
        maxSerial = serial;
      }
    }
  });

  // ✅ Next serial (2 digit)
  const nextSerial = String(maxSerial + 1).padStart(2, "0");

  // ✅ Final ID
  return `${todayPrefix}${nextSerial}`;
}