import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email/username and password are required" },
        { status: 400 }
      );
    }

    const input = email.toLowerCase().trim();

    // ==================== SUBUSER LOGIN ====================
    const subUser = await prisma.subUser.findFirst({
      where: {
        OR: [
          { username: input },
          { email: input },
        ],
      },
      include: {
        agent: {
          select: {
            status: true,
            agentName: true,
          },
        },
      },
    });

    if (subUser) {
      if (!subUser.isActive) {
        return NextResponse.json(
          { message: "Your account is deactivated. Contact your agency admin." },
          { status: 403 }
        );
      }

      if (
        subUser.agent?.status === "SUSPENDED" ||
        subUser.agent?.status === "INACTIVE"
      ) {
        return NextResponse.json(
          { message: "Agency account is suspended." },
          { status: 403 }
        );
      }

      const subIsMatch = await bcrypt.compare(password, subUser.password);

      if (!subIsMatch) {
        return NextResponse.json(
          { message: "Invalid password" },
          { status: 401 }
        );
      }

      await prisma.subUser.update({
        where: { id: subUser.id },
        data: { lastLogin: new Date() },
      });

      const subToken = jwt.sign(
        {
          id: subUser.id,
          agentId: subUser.agentId,
          role: subUser.role,
          type: "subuser",
          permissions: subUser.permissions ?? [],
        },
        process.env.SECRET_KEY!,
        { expiresIn: "1h" }
      );

      const subRes = NextResponse.json({
        success: true,
        Role: subUser.role,
        type: "subuser",
        redirectTo: "/user/dashboard",
        // ✅ User info for localStorage
        userId: subUser.id,
        userName: subUser.name || subUser.username || subUser.email || "Sub User",
        userEmail: subUser.email,
      });

      subRes.cookies.set("role", subUser.role, {
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60,
      });

      subRes.cookies.set("token", subToken, {
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60,
      });

      return subRes;
    }

    // ==================== MAIN USER LOGIN ====================
    const user = await prisma.user.findUnique({
      where: { email: input },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json(
        { message: "Invalid password" },
        { status: 401 }
      );
    }

    // ✅ Check agent status
    if (user.role === "USER") {
      if (user.status === "SUSPENDED" || user.status === "INACTIVE") {
        return NextResponse.json(
          { message: "Your account is suspended. Contact admin." },
          { status: 403 }
        );
      }

      if (user.status === "PENDING") {
        return NextResponse.json(
          { message: "Your account is pending approval." },
          { status: 403 }
        );
      }
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        type: "agent",
      },
      process.env.SECRET_KEY!,
      { expiresIn: "1h" }
    );

    let redirectTo = "/user/dashboard";

    if (user.role === "ADMIN") {
      redirectTo = "/admin/dashboard";
    } else if (user.role === "MANAGER") {
      redirectTo = "/manager/dashboard";
    } else {
      redirectTo = "/user/dashboard";
    }

    // ✅ Update last active
    await prisma.user.update({
      where: { id: user.id },
      data: { lastActive: new Date() },
    });

    const res = NextResponse.json({
      success: true,
      Role: user.role,
      type: "agent",
      redirectTo,
      // ✅ User info for localStorage
      userId: user.id,
      userName:
        user.agentName ||
        `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
        user.email,
      userEmail: user.email,
    });

    res.cookies.set("role", user.role, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60,
    });

    res.cookies.set("token", token, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60,
    });

    return res;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}