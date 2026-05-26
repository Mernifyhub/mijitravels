import prisma from "@/lib/prisma";
import { Role } from "@prisma/client"; // ✅ ADD THIS
import bcrypt from "bcryptjs";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const firstName = formData.get("firstName")?.toString();
    const lastName = formData.get("lastName")?.toString();
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();
    const confirmPassword = formData.get("confirmPassword")?.toString();
    const agentName = formData.get("agentName")?.toString();
    const agentAddress = formData.get("agentAddress")?.toString();
    const phone = formData.get("phone")?.toString();
    const aviationNumber = formData.get("aviationNumber")?.toString();

    const nidCopy = formData.get("nidCopy") as File | null;
    const tradeLicense = formData.get("tradeLicense") as File | null;

    // ✅ Validation
    if (!email || !password) {
      return Response.json({ message: "Email & Password required" }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return Response.json({ message: "Passwords do not match" }, { status: 400 });
    }

    if (!nidCopy || !tradeLicense) {
      return Response.json({ message: "Files are required" }, { status: 400 });
    }

    // ✅ Ensure upload folder exists
    const uploadDir = path.join(process.cwd(), "public/uploads");
    await mkdir(uploadDir, { recursive: true });

    // ✅ Save files
    const nidBuffer = Buffer.from(await nidCopy.arrayBuffer());
    const licenseBuffer = Buffer.from(await tradeLicense.arrayBuffer());

    const nidPath = `${uploadDir}/nid-${Date.now()}-${nidCopy.name}`;
    const licensePath = `${uploadDir}/license-${Date.now()}-${tradeLicense.name}`;

    await writeFile(nidPath, nidBuffer);
    await writeFile(licensePath, licenseBuffer);

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ SAVE TO DATABASE (THIS WAS MISSING)
    const user = await prisma.user.create({
  data: {
    firstName,
    lastName,
    agentName,
    agentAddress,
    phone,
    aviationNumber,
    email,
    password: hashedPassword,
    nidCopy: nidPath,
    tradeLicense: licensePath,
    role:Role.USER, // 👈 add this
  },
});

    return Response.json({
      message: "Agent registered successfully!",
      user,
    });

  } catch (err) {
  console.error("🔥 FULL ERROR:", err);

  return Response.json({
    message: "Server error",
    error: err instanceof Error ? err.message : err
  }, { status: 500 });
}
}