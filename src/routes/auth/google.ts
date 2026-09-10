import { createFileRoute } from "@tanstack/react-router";
import { startGoogleOAuthFn } from "@/lib/google-oauth.functions";

export const Route = createFileRoute("/auth/google")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = await startGoogleOAuthFn({ data: { requestUrl: request.url } });
        return Response.redirect(url, 302);
      },
    },
  },
});
