import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authenticated", user: null },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY!) as {
      id: string;
      role: string;
      type?: string;
      agentId?: string;
      permissions?: string[];
    };

    if (decoded.type === "subuser") {
      const subUser = await prisma.subUser.findUnique({
        where: { id: decoded.id },
        include: {
          agent: {
            select: {
              status: true,
              agentName: true,
              email: true,
            },
          },
        },
      });

      const agentSuspended =
        subUser?.agent?.status === "SUSPENDED" ||
        subUser?.agent?.status === "INACTIVE";

      if (!subUser || !subUser.isActive || agentSuspended) {
        return NextResponse.json(
          { success: false, message: "Unauthorized", user: null },
          { status: 401 }
        );
      }

      return NextResponse.json({
        success: true,
        user: {
          id: subUser.id,
          firstName: subUser.fullName?.split(" ")[0] ?? subUser.username,
          lastName: subUser.fullName?.split(" ").slice(1).join(" ") ?? "",
          email: subUser.email ?? subUser.agent?.email ?? null,
          phone: subUser.phone ?? null,
          role: subUser.role,
          type: "subuser",
          agentId: subUser.agentId,
          permissions: subUser.permissions ?? [],
        },
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        agentName: true,
        agentAddress: true,
        aviationNumber: true,
        nidCopy: true,
        tradeLicense: true,
        logo: true,      // ✅ add
        agentId: true,   // ✅ add
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found", user: null },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: user,
    });

  } catch (err) {
    console.error("Auth ME Error:", err);
    return NextResponse.json(
      { success: false, message: "Invalid or expired token", user: null },
      { status: 401 }
    );
  }
}