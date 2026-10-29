# solid2-aria

Accessibility libraries for Solid 2.

## Installation

Install the components with Solid 2 and its web renderer:

```sh
bun add @solid2-aria/components solid-js@next @solidjs/web@next
```

Set TypeScript's `jsxImportSource` to `@solidjs/web` when using JSX. See the package READMEs for installation and usage:

| Package | Purpose |
| --- | --- |
| [@solid2-aria/components](packages/solid2-aria-components/README.md) | Accessible, styleable components |
| [@solid2-aria/core](packages/solid2-aria/README.md) | Accessibility and interaction behaviors |
| [@solid2-aria/stately](packages/solid2-stately/README.md) | State management |
| [@solid2-aria/types](packages/solid2-aria-types/README.md) | Component types |
| [@solid2-aria/types-shared](packages/@solid2-aria/types-shared/README.md) | Shared, renderer-neutral types |
| [@solid2-aria/types-shared-web](packages/@solid2-aria/types-shared-web/README.md) | Shared web types |
| [@solid2-aria/sonner](packages/solid2-sonner/README.md) | Toast notifications |
| [@solid2-aria/vaul](packages/solid2-vaul/README.md) | Draggable drawers |
| [@solid2-aria/tanstack-charts](packages/tanstack-charts-solid2/README.md) | TanStack Charts adapter |

## Development

From the repository root, install dependencies and run the checks:

```sh
bun install
bun run build
bun run check
bun run check-types
```

## npm and Solid 2 release candidates

`@tanstack/charts` can cause an npm peer dependency conflict with Solid 2 release candidates. See the [chart adapter installation notes](packages/tanstack-charts-solid2/README.md#npm-and-solid-2-release-candidates) for the cause and workaround.
