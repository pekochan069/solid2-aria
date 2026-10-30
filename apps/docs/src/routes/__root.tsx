import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRoute,
} from "@tanstack/solid-router";
import { TanStackRouterDevtools } from "@tanstack/solid-router-devtools";
import { Loading } from "solid-js";

import { Header } from "#components/header/index.jsx";
import { PackageManagerProvider } from "#components/markdown/package-manager";
import { ThemeWatcher } from "#components/theme-watcher";

import appCss from "../styles/global.css?url";

export const Route = createRootRoute({
  component: RootComponent,
  head: () => ({
    links: [{ href: appCss, rel: "stylesheet" }],
    meta: [
      { charSet: "utf-8" },
      { content: "width=device-width, initial-scale=1.0", name: "viewport" },
      { title: "Solid2 Aria" },
    ],
  }),
  notFoundComponent: () => (
    <div>
      <p>This is the notFoundComponent configured on root route</p>
      <Link to="/">Start Over</Link>
    </div>
  ),
});

function RootComponent() {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <PackageManagerProvider>
          <Header />
          <Loading>
            <Outlet />
          </Loading>
          <ThemeWatcher />
        </PackageManagerProvider>
        <TanStackRouterDevtools position="bottom-right" />
        <Scripts />
      </body>
    </html>
  );
}
