import { createFileRoute } from "@tanstack/solid-router";

import {
  getComponentRegistry,
  getRegistryItem,
} from "../../lib/component-registry";

export const Route = createFileRoute("/r/{$name}.json")({
  server: {
    handlers: {
      GET: ({ params }) => {
        if (params.name === "registry") {
          return Response.json(getComponentRegistry());
        }

        const item = getRegistryItem(params.name);

        return item
          ? Response.json(item)
          : Response.json({ error: "Unknown registry item" }, { status: 404 });
      },
    },
  },
});
