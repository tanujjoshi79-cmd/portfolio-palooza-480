import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const urlSchema = z.object({ requestUrl: z.string().url() });

export const startGoogleOAuthFn = createServerFn({ method: "POST" })
  .validator(urlSchema)
  .handler(async ({ data }) => {
    const { getGoogleAuthorizationUrl } = await import("@/lib/google-oauth.server");
    return getGoogleAuthorizationUrl(data.requestUrl);
  });

export const completeGoogleOAuthFn = createServerFn({ method: "POST" })
  .validator(z.object({
    requestUrl: z.string().url(),
    code: z.string().min(1),
    state: z.string().min(1),
  }))
  .handler(async ({ data }) => {
    const { finishGoogleSignIn } = await import("@/lib/google-oauth.server");
    await finishGoogleSignIn(data.requestUrl, data.code, data.state);
    return { success: true };
  });
