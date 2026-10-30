# shadcn Solid2 Aria

A Solid 2 implementation of the 61 shadcn/ui Aria components. The site follows the design of the sibling `shadcn-ui` checkout at revision `481d523374745e77d0cf9c53a4115ab5dd7c8481`.

The site includes component documentation and live examples, a component installation registry, 29 page compositions, 70 TanStack Charts examples, application examples, Colors, Create, Typeset, and Sera. Documentation covers the implemented Solid components and tools. React integrations, the third-party registry directory, and upstream release notes are excluded.

Each derived source file records its upstream path and modifications. The original shadcn MIT license is in [LICENSES/shadcn-ui-MIT.txt](./LICENSES/shadcn-ui-MIT.txt). The accessibility packages retain their separate Apache-2.0 notices.

## Run the site

From the repository root:

```sh
bun install
bunx turbo build --filter=shadcn-solid2-aria^...
```

Set `VITE_PUBLIC_URL` in this app's environment to its public origin. Vite reads `.env` during local development. Set the same variable in the deployment build environment. Canonical metadata, registry dependency URLs, installation commands, page links copied to the clipboard, and tool share URLs use this value.

From this directory:

```sh
bun run dev
bun run build
```

Use the URL printed by Vite for local development. To serve a production build, run `bun run start`.

## Deploy to Vercel

In the project's **Settings → Environment Variables**, add this variable for **Production** and any **Preview** deployments:

```dotenv
VITE_PUBLIC_URL=https://shadcn-solid2-aria.vercel.app
```

Redeploy after saving the variable. Vite embeds this value during the build, so changing the runtime environment alone does not update an existing deployment.

This app's `turbo.json` passes `VITE_PUBLIC_URL` through Turbo's strict environment filter and includes its value in the build cache key. Turbo detects the app as Nitro, whose inferred environment variables exclude `VITE_*`. The app configuration also caches Nitro's `.output` and `.vercel/output` directories.

The Vite configuration rejects a missing or invalid HTTP or HTTPS URL before building. Without that check, URL validation fails when the server loads the router, and requests return HTTP 500. When replacing a deployment built without the variable, redeploy with **Use existing Build Cache** disabled.

## Use components

Use the Command tab on a component page to install its Solid 2 source through the shadcn CLI. The registry resolves sibling components and versioned npm dependencies. Component installation preserves your stylesheet. New apps install the shared theme separately, as described in the site's [installation guide](./content/docs/installation.mdx). Manual source copying remains available.

The registry index is `/r/registries.json` (also `/r/registry.json`). Individual items use `/r/{name}.json`, including the optional `/r/theme.json` setup. It contains 61 components with Nova styling. `VITE_PUBLIC_URL` controls the public URLs, so use the local origin in that variable when testing CLI installation locally.

Installation and dark-mode guides cover all four framework setups:

| Framework | Installation | Dark mode |
| --- | --- | --- |
| Vite | [Setup](./content/docs/installation/vite.mdx) | [Theme setup](./content/docs/dark-mode/vite.mdx) |
| Vite with start mode | [Setup](./content/docs/installation/vite-start.mdx) | [Theme setup](./content/docs/dark-mode/vite-start.mdx) |
| TanStack Router | [Setup](./content/docs/installation/tanstack-router.mdx) | [Theme setup](./content/docs/dark-mode/tanstack-router.mdx) |
| TanStack Start | [Setup](./content/docs/installation/tanstack-start.mdx) | [Theme setup](./content/docs/dark-mode/tanstack-start.mdx) |

The [dark-mode overview](./content/docs/dark-mode.mdx) links to each framework's theme provider, root layout, and mode toggle.

Registry components contain Nova's Tailwind classes. Preserve source notices when distributing a modified copy.

Use `class`, callback refs, lowercase native attributes, and Solid2 Aria props such as `isDisabled` and `onPress`. Read reactive props through the props object and pass signal values at JSX boundaries.

## Verify changes

```sh
bun run test:build-env
bun run check-types
bun run build
bun run test:registry
```

The registry installation check uses the running site's origin from `REGISTRY_URL` (default `http://localhost:5500`). It checks component installation in dry-run mode, then installs the local theme and the upstream shadcn/ui Aria style with neutral tokens into temporary projects. The installed CSS must match byte for byte. The upstream checkout defaults to `../../../shadcn-ui`; set `SHADCN_UI_DIR` to use another path. The check also verifies that components preserve existing CSS and do not install license files.

## Source layout

```text
src/routes/              TanStack Start routes
src/components/docs/     Navigation, articles, search, and code previews
src/components/home/     Homepage compositions
src/components/catalog/  Blocks and charts
src/components/tools/    Colors, Create, and Typeset
src/components/showcase/ Application examples and Sera
src/examples/            Component examples and their copyable source
src/registry/            Component implementations and style presets
src/styles/              Site theme and responsive layouts
content/docs/            Supported Solid documentation
public/theme.css         Downloadable component theme
```
