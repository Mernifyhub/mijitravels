import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.SECRET_KEY!;

async function getUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, SECRET_KEY) as { id: string };
    return decoded.id;
  } catch {
    return null;
  }
}

const PERMISSION_META: Record<string, { label: string; description: string; category: string }> = {
  "dashboard.view":    { label: "View Dashboard",    description: "Can access the main dashboard",       category: "Dashboard" },
  "search.flights":    { label: "Search Flights",    description: "Can search and view flight results",  category: "Search Flights" },
  "bookings.view":     { label: "View Bookings",     description: "Can view all booking lists",          category: "My Booking" },
  "bookings.create":   { label: "Create Bookings",   description: "Can create new flight bookings",      category: "My Booking" },
  "bookings.cancel":   { label: "Cancel Bookings",   description: "Can cancel existing bookings",        category: "My Booking" },
  "bookings.void":     { label: "Void Bookings",     description: "Can void ticketed bookings",          category: "My Booking" },
  "bookings.refund":   { label: "Refund Bookings",   description: "Can request booking refunds",         category: "My Booking" },
  "deposits.view":     { label: "View Deposits",     description: "Can view deposit list and history",   category: "My Deposit" },
  "deposits.create":   { label: "Create Deposits",   description: "Can create new deposit requests",     category: "My Deposit" },
  "staff.view":        { label: "View Staff",        description: "Can view staff/sub-user list",        category: "My Staff" },
  "staff.manage":      { label: "Manage Staff",      description: "Can create, edit, delete sub-users",  category: "My Staff" },
  "profile.view":      { label: "View Profile",      description: "Can view account profile info",       category: "My Account" },
  "profile.edit":      { label: "Edit Profile",      description: "Can edit profile & change password",  category: "My Account" },
  "reports.sales":     { label: "Sales Report",      description: "Can view sales report",               category: "Sale Report" },
  "reports.ledger":    { label: "Account Ledger",     description: "Can view account ledger",             category: "Sale Report" },
  "reports.all":       { label: "All Reports",        description: "Can view all reports",                category: "Sale Report" },
};

function formatPermissions(enabledKeys: string[]) {
  return Object.entries(PERMISSION_META).map(([key, meta]) => ({
    key,
    ...meta,
    enabled: enabledKeys.includes(key),
  }));
}

const VALID_ROLES = ["USER", "OPERATOR", "VIEWER"];

// ==================== GET ====================
export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subUsers = await prisma.subUser.findMany({
      where: { agentId: userId },
      orderBy: { createdAt: "desc" },
    });

    const formatted = subUsers.map((u) => ({
      id: u.id,
      username: u.username,
      fullName: u.fullName ?? null,
      email: u.email ?? null,
      phone: u.phone ?? null,
      role: u.role,
      isActive: u.isActive,
      createdAt: u.createdAt.toISOString(),
      lastLogin: u.lastLogin?.toISOString() ?? null,
      depositsCreated: u.depositsCreated,
      withdrawalsCreated: u.withdrawalsCreated,
      permissions: formatPermissions(u.permissions ?? []),
    }));

    return NextResponse.json({
      subUsers: formatted,
      stats: {
        total: subUsers.length,
        active: subUsers.filter((u) => u.isActive).length,
        inactive: subUsers.filter((u) => !u.isActive).length,
      },
    });
  } catch (error) {
    console.error("GET /api/agent/staff error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// ==================== POST ====================
export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { username, password, role, fullName, email, phone, permissions } = body;

    if (!username || typeof username !== "string" || username.trim().length < 3) {
      return NextResponse.json({ error: "Username must be at least 3 characters" }, { status: 400 });
    }
    if (!/^[a-zA-Z0-9._-]+$/.test(username)) {
      return NextResponse.json({ error: "Username: only letters, numbers, dots, hyphens allowed" }, { status: 400 });
    }
    if (!password || password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }
    if (!role || !VALID_ROLES.includes(role)) {
      return NextResponse.json({ error: "Invalid role. Must be USER, OPERATOR, or VIEWER" }, { status: 400 });
    }

    const exists = await prisma.subUser.findUnique({
      where: { username: username.toLowerCase().trim() },
    });
    if (exists) {
      return NextResponse.json({ error: "Username already taken" }, { status: 400 });
    }

    const validPermissions: string[] = Array.isArray(permissions)
      ? permissions.filter((p: string) => PERMISSION_META[p])
      : [];

    const subUser = await prisma.subUser.create({
      data: {
        username: username.toLowerCase().trim(),
        password: await bcrypt.hash(password, 12),
        role,
        fullName: fullName?.trim() || null,
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        permissions: validPermissions,
        agentId: userId,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      subUser: {
        id: subUser.id,
        username: subUser.username,
        role: subUser.role,
        isActive: subUser.isActive,
        createdAt: subUser.createdAt.toISOString(),
        lastLogin: null,
        permissions: formatPermissions(subUser.permissions ?? []),
      },
    });
  } catch (error) {
    console.error("POST /api/agent/staff error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}