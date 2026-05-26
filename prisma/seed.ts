import { PrismaClient, Role, BookingStatus, TripType, PassengerType, PaymentMethod, PaymentStatus } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  try {
    const hashedPassword = await bcrypt.hash("123456", 10);

    console.log("🔹 Creating user...");

    // ✅ USER
    const user = await prisma.user.create({
      data: {
        firstName: "MOHAMMAD",
        lastName: "ROBIN",
        agentName: "RR TRAVELS",
        agentAddress: "Riyadh",
        phone: "05000079987",
        aviationNumber: "AVI-012",
        email: "rr@test.com",
        password: hashedPassword,
        role: Role.USER,
        nidCopy: "nid.pdf",
        tradeLicense: "license.pdf",
      },
    });

    console.log("✅ User created:", user.id);
    console.log("\n📦 Creating 5 bookings...\n");

    // ==================== BOOKING 1: CONFIRMED ====================
    const booking1 = await prisma.booking.create({
      data: {
        bookingId: "BK-2024-001",
        status: BookingStatus.CONFIRMED,
        tripType: TripType.ROUND_TRIP,
        route: "RUH-DAC-RUH",
        departureDate: new Date("2025-05-01"),
        returnDate: new Date("2025-05-15"),
        pnr: "ABC123",
        carrier: "Saudia",
        agentId: user.id,
        net: 2500,
        gross: 2650,
        remarks: "VIP Customer - Window Seat",

        passengers: {
          create: [
            {
              firstName: "Ibrahim",
              lastName: "Mohammad",
              type: PassengerType.ADULT,
              email: "ibrahim@example.com",
              phone: "+966501234567",
              passportNumber: "P1234567",
            },
            {
              firstName: "Fatima",
              lastName: "Mohammad",
              type: PassengerType.ADULT,
              email: "fatima@example.com",
              passportNumber: "P7654321",
            },
          ],
        },

        segments: {
          create: [
            {
              from: "RUH",
              to: "DAC",
              departure: new Date("2025-05-01T10:00:00"),
              arrival: new Date("2025-05-01T20:30:00"),
              flightNo: "SV-803",
              airline: "Saudia",
            },
            {
              from: "DAC",
              to: "RUH",
              departure: new Date("2025-05-15T22:00:00"),
              arrival: new Date("2025-05-16T03:30:00"),
              flightNo: "SV-804",
              airline: "Saudia",
            },
          ],
        },

        payments: {
          create: {
            userId: user.id,
            amount: 2650,
            currency: "USD",
            method: PaymentMethod.CARD,
            status: PaymentStatus.SUCCESS,
            transactionId: "TXN-001-2024",
            paidAt: new Date(),
          },
        },
      },
    });
    console.log("✅ Booking 1 (CONFIRMED):", booking1.bookingId);

    // ==================== BOOKING 2: PENDING ====================
    const booking2 = await prisma.booking.create({
      data: {
        bookingId: "BK-2024-002",
        status: BookingStatus.ON_HOLD,
        tripType: TripType.ONE_WAY,
        route: "JED-DXB",
        departureDate: new Date("2025-06-10"),
        pnr: "DEF456",
        carrier: "Emirates",
        agentId: user.id,
        net: 1800,
        gross: 1950,
        remarks: "Awaiting payment confirmation",

        passengers: {
          create: [
            {
              firstName: "Ahmed",
              lastName: "Ali",
              type: PassengerType.ADULT,
              email: "ahmed@example.com",
              phone: "+966502345678",
              passportNumber: "P9876543",
            },
            {
              firstName: "Sara",
              lastName: "Ali",
              type: PassengerType.CHILD,
              passportNumber: "P1357924",
            },
          ],
        },

        segments: {
          create: {
            from: "JED",
            to: "DXB",
            departure: new Date("2025-06-10T14:30:00"),
            arrival: new Date("2025-06-10T18:45:00"),
            flightNo: "EK-803",
            airline: "Emirates",
          },
        },

        payments: {
          create: {
            userId: user.id,
            amount: 1950,
            currency: "USD",
            method: PaymentMethod.BANK_TRANSFER,
            status: PaymentStatus.PENDING,
            transactionId: "TXN-002-2024",
          },
        },
      },
    });
    console.log("✅ Booking 2 (ON_HOLD):", booking2.bookingId);

    // ==================== BOOKING 3: CANCELLED ====================
    const booking3 = await prisma.booking.create({
      data: {
        bookingId: "BK-2024-003",
        status: BookingStatus.CANCELLED,
        tripType: TripType.MULTI_CITY,
        route: "RUH-CAI-IST",
        departureDate: new Date("2025-04-20"),
        pnr: "GHI789",
        carrier: "Egypt Air",
        agentId: user.id,
        net: 3200,
        gross: 3400,
        remarks: "Cancelled by customer - Full refund",

        passengers: {
          create: {
            firstName: "Omar",
            lastName: "Hassan",
            type: PassengerType.ADULT,
            email: "omar@example.com",
            phone: "+966503456789",
            passportNumber: "P2468135",
          },
        },

        segments: {
          create: [
            {
              from: "RUH",
              to: "CAI",
              departure: new Date("2025-04-20T08:00:00"),
              arrival: new Date("2025-04-20T11:30:00"),
              flightNo: "MS-151",
              airline: "Egypt Air",
            },
            {
              from: "CAI",
              to: "IST",
              departure: new Date("2025-04-22T15:00:00"),
              arrival: new Date("2025-04-22T18:00:00"),
              flightNo: "MS-735",
              airline: "Egypt Air",
            },
          ],
        },

        payments: {
          create: {
            userId: user.id,
            amount: 3400,
            currency: "USD",
            method: PaymentMethod.CARD,
            status: PaymentStatus.REFUNDED,
            transactionId: "TXN-003-2024",
            paidAt: new Date("2024-12-20"),
          },
        },
      },
    });
    console.log("✅ Booking 3 (CANCELLED):", booking3.bookingId);

    // ==================== BOOKING 4: CONFIRMED (Family) ====================
    const booking4 = await prisma.booking.create({
      data: {
        bookingId: "BK-2024-004",
        status: BookingStatus.CONFIRMED,
        tripType: TripType.ROUND_TRIP,
        route: "RUH-LHR-RUH",
        departureDate: new Date("2025-07-01"),
        returnDate: new Date("2025-07-14"),
        pnr: "JKL012",
        carrier: "British Airways",
        agentId: user.id,
        net: 5600,
        gross: 5850,
        remarks: "Family package with infant",

        passengers: {
          create: [
            {
              firstName: "Khalid",
              lastName: "Rahman",
              type: PassengerType.ADULT,
              email: "khalid@example.com",
              phone: "+966504567890",
              passportNumber: "P3691472",
            },
            {
              firstName: "Aisha",
              lastName: "Rahman",
              type: PassengerType.ADULT,
              email: "aisha@example.com",
              passportNumber: "P8520369",
            },
            {
              firstName: "Yusuf",
              lastName: "Rahman",
              type: PassengerType.CHILD,
              passportNumber: "P1593574",
            },
            {
              firstName: "Maryam",
              lastName: "Rahman",
              type: PassengerType.INFANT,
              passportNumber: "P7531598",
            },
          ],
        },

        segments: {
          create: [
            {
              from: "RUH",
              to: "LHR",
              departure: new Date("2025-07-01T02:00:00"),
              arrival: new Date("2025-07-01T08:30:00"),
              flightNo: "BA-263",
              airline: "British Airways",
            },
            {
              from: "LHR",
              to: "RUH",
              departure: new Date("2025-07-14T12:00:00"),
              arrival: new Date("2025-07-14T22:30:00"),
              flightNo: "BA-262",
              airline: "British Airways",
            },
          ],
        },

        payments: {
          create: {
            userId: user.id,
            amount: 5850,
            currency: "USD",
            method: PaymentMethod.CASH,
            status: PaymentStatus.SUCCESS,
            transactionId: "TXN-004-2024",
            paidAt: new Date(),
          },
        },
      },
    });
    console.log("✅ Booking 4 (CONFIRMED - Family):", booking4.bookingId);

    // ==================== BOOKING 5: VOIDED ====================
    const booking5 = await prisma.booking.create({
      data: {
        bookingId: "BK-2024-005",
        status: BookingStatus.VOIDED,
        tripType: TripType.ONE_WAY,
        route: "DMM-BOM",
        departureDate: new Date("2025-03-15"),
        pnr: "MNO345",
        carrier: "Air India",
        agentId: user.id,
        net: 1400,
        gross: 1550,
        remarks: "Ticket voided due to name mismatch",

        passengers: {
          create: {
            firstName: "Tariq",
            lastName: "Malik",
            type: PassengerType.ADULT,
            email: "tariq@example.com",
            phone: "+966505678901",
            passportNumber: "P9517532",
          },
        },

        segments: {
          create: {
            from: "DMM",
            to: "BOM",
            departure: new Date("2025-03-15T23:30:00"),
            arrival: new Date("2025-03-16T05:00:00"),
            flightNo: "AI-965",
            airline: "Air India",
          },
        },

        payments: {
          create: {
            userId: user.id,
            amount: 1550,
            currency: "USD",
            method: PaymentMethod.MOBILE_BANKING,
            status: PaymentStatus.FAILED,
            transactionId: "TXN-005-2024",
          },
        },
      },
    });
    console.log("✅ Booking 5 (VOIDED):", booking5.bookingId);

    console.log("\n🎉 ========================================");
    console.log("✅ ALL 5 BOOKINGS CREATED SUCCESSFULLY!");
    console.log("========================================");
    console.log("\n📊 Summary:");
    console.log("   • 1 User created");
    console.log("   • 5 Bookings created");
    console.log("   • Status distribution:");
    console.log("     - CONFIRMED: 2");
    console.log("     - ON_HOLD: 1");
    console.log("     - CANCELLED: 1");
    console.log("     - VOIDED: 1");
    console.log("   • 11 Passengers");
    console.log("   • 9 Flight Segments");
    console.log("   • 5 Payment Records\n");

  } catch (err) {
    console.error("❌ ERROR:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();