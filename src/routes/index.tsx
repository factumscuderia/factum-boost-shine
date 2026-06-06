import { createFileRoute } from "@tanstack/react-router";
import siteHtml from "../generated/site.html?raw";

export const Route = createFileRoute("/")({
  server: {
    handlers: {
      GET: () =>
        new Response(siteHtml, {
          headers: { "content-type": "text/html; charset=utf-8" },
        }),
    },
  },
  component: () => null,
});
