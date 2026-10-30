import { createFileRoute } from "@tanstack/solid-router";

import { getComponentRegistry } from "../../lib/component-registry";

export const Route = createFileRoute("/r/registries.json")({
  server: {
    handlers: {
      GET: () => Response.json(getComponentRegistry()),
    },
  },
});
