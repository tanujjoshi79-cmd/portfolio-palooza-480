import crypto from "node:crypto";
import { db } from "@/lib/db";
import { publicUser } from "@/lib/auth.server";
import { useTtiSession } from "@/lib/session";

const GOOGLE_AUTHORIZE_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";

function requiredEnv(name: "GOOGLE_CLIENT_ID" | "GOOGLE_CLIENT_SECRET") {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

function base64Url(value: Buffer) {
  return value.toString("base64url");
}

function createPkce() {
  const verifier = base64Url(crypto.randomBytes(32));
  const challenge = base64Url(crypto.createHash("sha256").update(verifier).digest());
  return { verifier, challenge };
}

function redirectUri(requestUrl: string) {
  return new URL("/auth/google/callback", requestUrl).toString();
}

export async function getGoogleAuthorizationUrl(requestUrl: string) {
  const session = await useTtiSession();
  const state = base64Url(crypto.randomBytes(32));
  const { verifier, challenge } = createPkce();

  await session.update({
    ...session.data,
    oauthState: state,
    oauthCodeVerifier: verifier,
  });

  const url = new URL(GOOGLE_AUTHORIZE_URL);
  url.searchParams.set("client_id", requiredEnv("GOOGLE_CLIENT_ID"));
  url.searchParams.set("redirect_uri", redirectUri(requestUrl));
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", state);
  url.searchParams.set("code_challenge", challenge);
  url.searchParams.set("code_challenge_method", "S256");
  url.searchParams.set("access_type", "online");

  return url.toString();
}

export async function finishGoogleSignIn(requestUrl: string, code: string, state: string) {
  const session = await useTtiSession();
  if (!session.data.oauthState || state !== session.data.oauthState) {
    throw new Error("Invalid Google OAuth state");
  }

  const verifier = session.data.oauthCodeVerifier;
  if (!verifier) throw new Error("Missing Google OAuth verifier");

  const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: requiredEnv("GOOGLE_CLIENT_ID"),
      client_secret: requiredEnv("GOOGLE_CLIENT_SECRET"),
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri(requestUrl),
      code_verifier: verifier,
    }),
  });

  if (!tokenResponse.ok) throw new Error("Google token exchange failed");
  const tokens = (await tokenResponse.json()) as { access_token?: string };
  if (!tokens.access_token) throw new Error("Google did not return an access token");

  const userResponse = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  if (!userResponse.ok) throw new Error("Google user info request failed");

  const googleUser = (await userResponse.json()) as {
    sub?: string;
    email?: string;
    email_verified?: boolean;
    name?: string;
  };

  if (!googleUser.sub || !googleUser.email || googleUser.email_verified !== true) {
    throw new Error("Google account email is not verified");
  }

  const email = googleUser.email.trim().toLowerCase();
  let user = await db.user.findUnique({ where: { email } });

  if (!user) {
    const randomPasswordHash = await import("bcryptjs").then(({ default: bcrypt }) =>
      bcrypt.hash(crypto.randomBytes(32).toString("hex"), 12),
    );

    user = await db.user.create({
      data: {
        fullName: googleUser.name?.trim() || email.split("@")[0],
        email,
        passwordHash: randomPasswordHash,
      },
    });
  }

  await session.update({ userId: user.id });
  await session.update({
    userId: user.id,
    oauthState: undefined,
    oauthCodeVerifier: undefined,
  });

  return publicUser(user);
}
