import { createRouter } from "@tanstack/solid-router";

import { routeTree } from "./routeTree.gen";

export function getRouter() {
  return createRouter({
    defaultPreload: "intent",
    defaultStaleTime: 5000,
    routeTree,
    scrollRestoration: true,
  });
}

declare module "@tanstack/solid-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
