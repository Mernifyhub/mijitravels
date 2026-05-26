import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const role = request.cookies.get("role")?.value;
  const path = request.nextUrl.pathname;

  if (path === "/login" || path === "/register") {
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (path.startsWith("/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (path.startsWith("/manager") && role !== "MANAGER") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (path.startsWith("/user")) {
    const allowedRoles = ["USER", "OPERATOR", "VIEWER"];
    if (!allowedRoles.includes(role || "")) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/manager/:path*", "/user/:path*"],
};