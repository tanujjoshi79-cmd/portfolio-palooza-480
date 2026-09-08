import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function createUser(fullName: string, email: string, password: string) {
  const passwordHash = await bcrypt.hash(password, 12);
  return db.user.create({
    data: {
      fullName: fullName.trim(),
      email: normalizeEmail(email),
      passwordHash,
    },
  });
}

export async function authenticateUser(email: string, password: string) {
  const user = await db.user.findUnique({ where: { email: normalizeEmail(email) } });
  if (!user) return null;

  const valid = await bcrypt.compare(password, user.passwordHash);
  return valid ? user : null;
}

export async function getUserById(id: string) {
  return db.user.findUnique({ where: { id } });
}

export function publicUser(user: {
  id: string;
  fullName: string;
  email: string;
  isAdmin: boolean;
  coursePaid: boolean;
}) {
  return {
    id: user.id,
    name: user.fullName,
    email: user.email,
    isAdmin: user.isAdmin,
    coursePaid: user.coursePaid,
  };
}
