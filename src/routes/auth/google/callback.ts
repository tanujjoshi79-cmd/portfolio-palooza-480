import { createFileRoute } from "@tanstack/react-router";
import { finishGoogleSignIn } from "@/lib/google-oauth.server";

export const Route = createFileRoute("/auth/google/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");
        const error = url.searchParams.get("error");

        if (error || !code || !state) {
          return Response.redirect(new URL("/account?google=cancelled", request.url), 302);
        }

        try {
          await finishGoogleSignIn(request.url, code, state);
          return Response.redirect(new URL("/account?google=success", request.url), 302);
        } catch (oauthError) {
          console.error("Google OAuth callback failed", oauthError);
          return Response.redirect(new URL("/account?google=error", request.url), 302);
        }
      },
    },
  },
});
