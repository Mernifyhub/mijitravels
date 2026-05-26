import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import fs from "fs";

async function getAuthUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return null;
    const decoded = jwt.verify(token, process.env.SECRET_KEY!) as { id: string };
    return decoded;
  } catch {
    return null;
  }
}

const ALLOWED_IMAGE = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const ALLOWED_ALL = [...ALLOWED_IMAGE, "application/pdf"];
const VALID_TYPES = ["nidCopy", "tradeLicense", "logo"];
const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type")?.toString();

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file uploaded" },
        { status: 400 }
      );
    }

    if (!type || !VALID_TYPES.includes(type)) {
      return NextResponse.json(
        { success: false, message: "Invalid type" },
        { status: 400 }
      );
    }

    const allowed = type === "logo" ? ALLOWED_IMAGE : ALLOWED_ALL;
    if (!allowed.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          message: type === "logo"
            ? "Logo must be JPG, PNG or WEBP"
            : "File must be JPG, PNG, WEBP or PDF",
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, message: "File too large. Max 5MB" },
        { status: 400 }
      );
    }

    // Delete old file
    const currentUser = await prisma.user.findUnique({
      where: { id: auth.id },
      select: { nidCopy: true, tradeLicense: true, logo: true },
    });

    if (currentUser) {
      const oldPath =
        type === "nidCopy" ? currentUser.nidCopy :
        type === "tradeLicense" ? currentUser.tradeLicense :
        currentUser.logo;

      if (oldPath && oldPath.startsWith("/uploads/")) {
        const oldFullPath = path.join(process.cwd(), "public", oldPath);
        try {
          if (fs.existsSync(oldFullPath)) await unlink(oldFullPath);
        } catch {
          // ignore
        }
      }
    }

    // Save new file
    const uploadDir = path.join(process.cwd(), "public/uploads");
    await mkdir(uploadDir, { recursive: true });

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `${type}-${auth.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const filePath = path.join(uploadDir, fileName);

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    const publicPath = `/uploads/${fileName}`;

    await prisma.user.update({
      where: { id: auth.id },
      data: {
        [type]: publicPath,
        updatedAt: new Date(),
      },
    });

    const messages: Record<string, string> = {
      nidCopy: "NID Copy uploaded successfully",
      tradeLicense: "Trade License uploaded successfully",
      logo: "Logo uploaded successfully",
    };

    return NextResponse.json({
      success: true,
      message: messages[type],
      path: publicPath,
    });

  } catch (error) {
    console.error("upload-document error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to upload" },
      { status: 500 }
    );
  }
}