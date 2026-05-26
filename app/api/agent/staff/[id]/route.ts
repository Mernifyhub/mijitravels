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

// ==================== PUT ====================
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const subUser = await prisma.subUser.findFirst({
      where: { id, agentId: userId },
    });
    if (!subUser) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await req.json();
    const { role, isActive, password, fullName, email, phone, permissions } = body;

    const updateData: Record<string, unknown> = {};

    if (role && VALID_ROLES.includes(role)) updateData.role = role;
    if (typeof isActive === "boolean") updateData.isActive = isActive;
    if (password && typeof password === "string" && password.length >= 6) {
      updateData.password = await bcrypt.hash(password, 12);
    }
    if (fullName !== undefined) updateData.fullName = fullName?.trim() || null;
    if (email !== undefined) updateData.email = email?.trim() || null;
    if (phone !== undefined) updateData.phone = phone?.trim() || null;
    if (Array.isArray(permissions)) {
      updateData.permissions = permissions.filter((p: string) => PERMISSION_META[p]);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const updated = await prisma.subUser.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      subUser: {
        id: updated.id,
        username: updated.username,
        fullName: updated.fullName ?? null,
        email: updated.email ?? null,
        phone: updated.phone ?? null,
        role: updated.role,
        isActive: updated.isActive,
        createdAt: updated.createdAt.toISOString(),
        lastLogin: updated.lastLogin?.toISOString() ?? null,
        depositsCreated: updated.depositsCreated,
        withdrawalsCreated: updated.withdrawalsCreated,
        permissions: formatPermissions(updated.permissions ?? []),
      },
    });
  } catch (error) {
    console.error("PUT /api/agent/staff/[id] error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// ==================== DELETE ====================
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const subUser = await prisma.subUser.findFirst({
      where: { id, agentId: userId },
    });
    if (!subUser) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.subUser.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/agent/staff/[id] error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}