// /api/auth/logout

import { NextResponse } from "next/server";

// /api/auth/logout
export async function POST(req: Request) {
  const res = NextResponse.json({ ok: true });
  
  // Remove cookies
  res.cookies.delete("token");
  res.cookies.delete("role");
  
  return res;
}