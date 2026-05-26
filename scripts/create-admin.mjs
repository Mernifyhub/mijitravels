// scripts/create-admin.mjs

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

// ==================== CONFIG ====================
// এখানে তোমার admin data দাও
const ADMINS_TO_CREATE = [
  {
    firstName: "Super",
    lastName: "Admin",
    agentName: "MIJI Admin",
    agentAddress: "Riyadh HQ, Saudi Arabia",
    email: "admin@miji.com",
    password: "Admin@123",
    phone: "0500000001",
    aviationNumber: "ADMIN001",
    city: "Riyadh",
    country: "Saudi Arabia",
    role: "ADMIN",
    agentId: "AD-000001",
  },
  {
    firstName: "Operations",
    lastName: "Manager",
    agentName: "MIJI Operations",
    agentAddress: "Dhaka Office, Bangladesh",
    email: "manager@miji.com",
    password: "Manager@123",
    phone: "0500000002",
    aviationNumber: "MGR001",
    city: "Dhaka",
    country: "Bangladesh",
    role: "MANAGER",
    agentId: "MN-000001",
  },
  {
    firstName: "System",
    lastName: "Admin",
    agentName: "MIJI System Admin",
    agentAddress: "Jeddah Branch, Saudi Arabia",
    email: "sysadmin@miji.com",
    password: "SysAdmin@123",
    phone: "0500000003",
    aviationNumber: "ADMIN002",
    city: "Jeddah",
    country: "Saudi Arabia",
    role: "ADMIN",
    agentId: "AD-000002",
  },
];

const SALT_ROUNDS = 12;

// ==================== MAIN ====================
async function main() {
  console.log("🚀 Starting admin creation script...\n");

  let created = 0;
  let skipped = 0;
  let failed = 0;

  for (const adminData of ADMINS_TO_CREATE) {
    try {
      // ── Check if already exists ──
      const existing = await prisma.user.findUnique({
        where: { email: adminData.email },
        select: { id: true, email: true, role: true },
      });

      if (existing) {
        console.log(`⏭️  Skipped: ${adminData.email} (already exists | role: ${existing.role})`);
        skipped++;
        continue;
      }

      // ── Hash password ──
      console.log(`🔐 Hashing password for ${adminData.email}...`);
      const hashedPassword = await bcrypt.hash(adminData.password, SALT_ROUNDS);

      // ── Create user ──
      const user = await prisma.user.create({
        data: {
          agentId: adminData.agentId,
          firstName: adminData.firstName,
          lastName: adminData.lastName,
          agentName: adminData.agentName,
          agentAddress: adminData.agentAddress,
          email: adminData.email,
          password: hashedPassword,
          phone: adminData.phone,
          aviationNumber: adminData.aviationNumber,
          city: adminData.city || "",
          country: adminData.country || "",
          nidCopy: "admin-document.pdf",
          tradeLicense: "admin-license.pdf",
          logo: "",
          role: adminData.role,
          status: "ACTIVE",
          tier: adminData.role === "ADMIN" ? "PLATINUM" : "GOLD",
          balance: 0,
          creditLimit: 0,
          usedLimit: 0,
          commission: 5,
          verified: true,
          preBookingEnabled: true,
        },
        select: {
          id: true,
          agentId: true,
          email: true,
          role: true,
          firstName: true,
          lastName: true,
        },
      });

      console.log(`✅ Created: ${user.email}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Agent ID: ${user.agentId}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Name: ${user.firstName} ${user.lastName}`);
      console.log(`   Password: ${adminData.password}\n`);

      created++;
    } catch (error) {
      console.error(`❌ Failed: ${adminData.email}`);
      console.error(`   Error: ${error.message}\n`);
      failed++;
    }
  }

  // ── Summary ──
  console.log("\n==================== SUMMARY ====================");
  console.log(`✅ Created : ${created}`);
  console.log(`⏭️  Skipped : ${skipped}`);
  console.log(`❌ Failed  : ${failed}`);
  console.log(`📊 Total   : ${ADMINS_TO_CREATE.length}`);
  console.log("=================================================\n");

  // ── Show all admins ──
  if (created > 0) {
    console.log("📋 All Admin/Manager users in DB:\n");

    const allAdmins = await prisma.user.findMany({
      where: {
        role: { in: ["ADMIN", "MANAGER"] },
      },
      select: {
        id: true,
        agentId: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    });

    allAdmins.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.email}`);
      console.log(`   UUID    : ${admin.id}`);
      console.log(`   AgentID : ${admin.agentId}`);
      console.log(`   Role    : ${admin.role}`);
      console.log(`   Status  : ${admin.status}`);
      console.log(`   Created : ${admin.createdAt.toLocaleDateString()}\n`);
    });
  }
}

main()
  .catch((error) => {
    console.error("💥 Script failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log("🔌 Database disconnected.");
  });