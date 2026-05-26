// lib/auth.ts

import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

// ✅ Updated interface
interface DecodedToken {
  id: string;
  role: "ADMIN" | "MANAGER" | "USER";
  type?: "agent" | "subuser";
  agentId?: string;
  permissions?: string[];
  iat: number;
  exp: number;
}

interface AuthResult {
  authorized: boolean;
  error: string | null;
  status: number;
  user: DecodedToken | null;
}

// ✅ Get auth user from cookie
export async function getAuthUser(): Promise<DecodedToken | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return null;

    if (!process.env.SECRET_KEY) {
      console.error("SECRET_KEY not defined");
      return null;
    }

    const decoded = jwt.verify(
      token,
      process.env.SECRET_KEY
    ) as DecodedToken;

    // Expiry check
    if (decoded.exp && decoded.exp * 1000 < Date.now()) return null;

    return decoded;
  } catch {
    return null;
  }
}

// ✅ Admin only
export async function requireAdmin(): Promise<AuthResult> {
  const user = await getAuthUser();

  if (!user) {
    return {
      authorized: false,
      error: "Authentication required. Please login.",
      status: 401,
      user: null,
    };
  }

  if (user.role !== "ADMIN" && user.role !== "MANAGER") {
    return {
      authorized: false,
      error: "Admin access required.",
      status: 403,
      user: null,
    };
  }

  return { authorized: true, error: null, status: 200, user };
}

// ✅ Any logged in user
export async function requireAuth(): Promise<AuthResult> {
  const user = await getAuthUser();

  if (!user) {
    return {
      authorized: false,
      error: "Authentication required.",
      status: 401,
      user: null,
    };
  }

  return { authorized: true, error: null, status: 200, user };
}

// ✅ Agent only (main agent, not subuser)
export async function requireAgent(): Promise<AuthResult> {
  const user = await getAuthUser();

  if (!user) {
    return {
      authorized: false,
      error: "Authentication required.",
      status: 401,
      user: null,
    };
  }

  if (user.role !== "USER") {
    return {
      authorized: false,
      error: "Agent access required.",
      status: 403,
      user: null,
    };
  }

  return { authorized: true, error: null, status: 200, user };
}

// ✅ Get actual userId
// SubUser হলে agentId, agent হলে id
export function getActualUserId(user: DecodedToken): string {
  if (user.type === "subuser" && user.agentId) {
    return user.agentId;
  }
  return user.id;
}