// lib/validation.ts

export function validateAgentInput(data: any, isUpdate: boolean = false) {
  const errors: string[] = [];

  if (!isUpdate) {
    if (!data.firstName?.trim()) errors.push("First name is required");
    if (!data.lastName?.trim()) errors.push("Last name is required");
    if (!data.agentName?.trim() && !data.company?.trim()) errors.push("Agent/Company name is required");
    if (!data.agentAddress?.trim() && !data.address?.trim()) errors.push("Address is required");
    if (!data.phone?.trim()) errors.push("Phone is required");
    if (!data.aviationNumber?.trim()) errors.push("Aviation number is required");
    if (!data.email?.trim()) errors.push("Email is required");
    if (!data.password?.trim()) errors.push("Password is required");
  }

  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
    errors.push("Invalid email format");
  }

  if (data.password && data.password.length < 6) {
    errors.push("Password must be at least 6 characters");
  }

  if (data.commission !== undefined) {
    const comm = Number(data.commission);
    if (isNaN(comm) || comm < 0 || comm > 100) errors.push("Commission must be 0-100");
  }

  if (data.creditLimit !== undefined) {
    const cl = Number(data.creditLimit);
    if (isNaN(cl) || cl < 0) errors.push("Credit limit must be positive");
  }

  return errors;
}

export function sanitizeString(str: string): string {
  if (!str) return "";
  return str.trim().replace(/<[^>]*>/g, "").replace(/[<>]/g, "");
}

export function sanitizeAgentData(data: any) {
  const s: any = {};
  const fields = [
    "firstName", "lastName", "agentName", "agentAddress", "phone",
    "aviationNumber", "email", "nidCopy", "tradeLicense", "city", "country",
  ];
  fields.forEach((f) => {
    if (data[f] !== undefined) s[f] = sanitizeString(String(data[f]));
  });

  // Handle aliases from frontend
  if (!s.agentName && data.company) s.agentName = sanitizeString(data.company);
  if (!s.agentAddress && data.address) s.agentAddress = sanitizeString(data.address);
  if (!s.firstName && data.name) {
    const parts = data.name.trim().split(" ");
    s.firstName = sanitizeString(parts[0] || "");
    s.lastName = sanitizeString(parts.slice(1).join(" ") || "");
  }

  if (s.email) s.email = s.email.toLowerCase();
  if (data.password) s.password = data.password;

  return s;
}