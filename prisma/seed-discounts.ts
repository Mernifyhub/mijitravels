import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedDiscounts() {
  console.log("🌱 Seeding discount rules...");

  // Clear existing
  await prisma.discountUsageLog.deleteMany();
  await prisma.discountRule.deleteMany();

  // 1. Global — সবার জন্য
  await prisma.discountRule.create({
    data: {
      type: "GLOBAL",
      name: "Launch Offer",
      description: "Flat SAR 50 off on all flights",
      discountType: "FLAT",
      discountValue: 50,
      discountOn: "TOTAL",
      priority: 5,
      isActive: true,
      currency: "SAR",
    },
  });
  console.log("  ✅ Global discount created");

  // 2. Emirates airline discount
  await prisma.discountRule.create({
    data: {
      type: "AIRLINE",
      name: "Emirates Special",
      description: "5% off on Emirates flights",
      discountType: "PERCENT",
      discountValue: 5,
      discountOn: "TOTAL",
      maxDiscount: 500,
      airlineCode: "EK",
      priority: 30,
      isActive: true,
      currency: "SAR",
    },
  });
  console.log("  ✅ Emirates airline discount created");

  // 3. Qatar Airways
  await prisma.discountRule.create({
    data: {
      type: "AIRLINE",
      name: "Qatar Airways Deal",
      description: "SAR 75 off on Qatar Airways",
      discountType: "FLAT",
      discountValue: 75,
      discountOn: "TOTAL",
      airlineCode: "QR",
      priority: 30,
      isActive: true,
      currency: "SAR",
    },
  });
  console.log("  ✅ Qatar Airways discount created");

  // 4. Route: DAC → DXB
  await prisma.discountRule.create({
    data: {
      type: "ROUTE",
      name: "DAC-DXB Route Offer",
      description: "SAR 100 off on Dhaka to Dubai flights",
      discountType: "FLAT",
      discountValue: 100,
      discountOn: "TOTAL",
      origin: "DAC",
      destination: "DXB",
      routeMatchType: "BIDIRECTIONAL",
      priority: 40,
      isActive: true,
      currency: "SAR",
    },
  });
  console.log("  ✅ DAC-DXB route discount created");

  // 5. Route: DAC → JED
  await prisma.discountRule.create({
    data: {
      type: "ROUTE",
      name: "Hajj Route Special",
      description: "SAR 150 off on Dhaka to Jeddah",
      discountType: "FLAT",
      discountValue: 150,
      discountOn: "TOTAL",
      origin: "DAC",
      destination: "JED",
      routeMatchType: "BIDIRECTIONAL",
      minFare: 500,
      priority: 45,
      isActive: true,
      currency: "SAR",
    },
  });
  console.log("  ✅ DAC-JED Hajj route discount created");

  // 6. Promo code
  await prisma.discountRule.create({
    data: {
      type: "PROMO",
      name: "Eid Special Promo",
      description: "Use code EID2025 for 10% off",
      discountType: "PERCENT",
      discountValue: 10,
      discountOn: "TOTAL",
      maxDiscount: 300,
      promoCode: "EID2025",
      validFrom: new Date("2025-06-01"),
      validTo: new Date("2025-07-31"),
      maxUsageTotal: 1000,
      priority: 50,
      isActive: true,
      currency: "SAR",
    },
  });
  console.log("  ✅ EID2025 promo created");

  // 7. Campaign — summer
  await prisma.discountRule.create({
    data: {
      type: "CAMPAIGN",
      name: "Summer Sale 2025",
      description: "SAR 75 off during summer — stackable",
      discountType: "FLAT",
      discountValue: 75,
      discountOn: "TOTAL",
      validFrom: new Date("2025-06-15"),
      validTo: new Date("2025-08-31"),
      priority: 15,
      isActive: true,
      isStackable: true,
      currency: "SAR",
    },
  });
  console.log("  ✅ Summer Sale campaign created");

  // 8. Gold tier agent discount
  await prisma.discountRule.create({
    data: {
      type: "AGENT",
      name: "Gold Agent Benefit",
      description: "3% extra off for Gold tier agents",
      discountType: "PERCENT",
      discountValue: 3,
      discountOn: "TOTAL",
      maxDiscount: 200,
      agentTier: "GOLD",
      priority: 25,
      isActive: true,
      isStackable: true,
      currency: "SAR",
    },
  });
  console.log("  ✅ Gold agent discount created");

  console.log("\n🎉 All discount rules seeded successfully!");

  // Summary
  const count = await prisma.discountRule.count();
  console.log(`📊 Total rules in DB: ${count}`);
}

seedDiscounts()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

  //npx tsx prisma/seed-discounts.ts