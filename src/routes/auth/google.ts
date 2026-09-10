import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/google")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { getGoogleAuthorizationUrl } = await import("@/lib/google-oauth.server");
        const url = await getGoogleAuthorizationUrl(request.url);
        return Response.redirect(url, 302);
      },
    },
  },
});
