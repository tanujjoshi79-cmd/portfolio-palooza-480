import { createFileRoute } from "@tanstack/react-router";
import { getGoogleAuthorizationUrl } from "@/lib/google-oauth.server";

export const Route = createFileRoute("/auth/google")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = await getGoogleAuthorizationUrl(request.url);
        return Response.redirect(url, 302);
      },
    },
  },
});
