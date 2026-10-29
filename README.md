# solid2-aria

Accessibility libraries for Solid 2.

From the repository root, install dependencies and run the checks:

```sh
bun install
bun run build
bun run check
bun run check-types
```

## npm and Solid 2 release candidates

`@tanstack/charts` can cause an npm peer dependency conflict with Solid 2 release candidates. See the [chart adapter installation notes](packages/tanstack-charts-solid2/README.md#npm-and-solid-2-release-candidates) for the cause and workaround.
