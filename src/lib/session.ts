import { useSession } from "@tanstack/react-start/server";

export type TtiSession = {
  userId?: string;
  oauthState?: string;
  oauthCodeVerifier?: string;
};

export function useTtiSession() {
  const password = process.env.SESSION_SECRET;
  if (!password || password.length < 32) {
    throw new Error("SESSION_SECRET must be at least 32 characters");
  }

  return useSession<TtiSession>({
    name: "tti-session",
    password,
    maxAge: 60 * 60 * 24 * 7,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    },
  });
}
