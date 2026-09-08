import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authenticateUser, createUser, getUserById, normalizeEmail, publicUser } from "@/lib/auth.server";
import { useTtiSession } from "@/lib/session";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const signupSchema = credentialsSchema.extend({
  fullName: z.string().min(2).max(100),
});

export const getCurrentUserFn = createServerFn({ method: "GET" }).handler(async () => {
  const session = await useTtiSession();
  const userId = session.data.userId;
  if (!userId) return null;

  const user = await getUserById(userId);
  if (!user) {
    await session.clear();
    return null;
  }

  return publicUser(user);
});

export const signupFn = createServerFn({ method: "POST" })
  .validator(signupSchema)
  .handler(async ({ data }) => {
    const email = normalizeEmail(data.email);
    const existing = await import("@/lib/db").then(({ db }) =>
      db.user.findUnique({ where: { email } }),
    );

    if (existing) return { error: "Account already exists. Please login." };

    const user = await createUser(data.fullName, email, data.password);
    const session = await useTtiSession();
    await session.update({ userId: user.id });

    return { user: publicUser(user) };
  });

export const loginFn = createServerFn({ method: "POST" })
  .validator(credentialsSchema)
  .handler(async ({ data }) => {
    const user = await authenticateUser(data.email, data.password);
    if (!user) return { error: "Invalid email or password." };

    const session = await useTtiSession();
    await session.update({ userId: user.id });

    return { user: publicUser(user) };
  });

export const logoutFn = createServerFn({ method: "POST" }).handler(async () => {
  const session = await useTtiSession();
  await session.clear();
  return { success: true };
});
