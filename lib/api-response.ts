// lib/api-response.ts

import { NextResponse } from "next/server";

export function success(data: any, status: number = 200) {
  return NextResponse.json({ success: true, ...data }, { status });
}

export function error(message: string, status: number = 400, details?: any) {
  return NextResponse.json(
    { success: false, message, ...(details !== undefined && { details }) },
    { status }
  );
}

export function validationError(errors: string[]) {
  return NextResponse.json(
    { success: false, message: "Validation failed", errors },
    { status: 422 }
  );
}