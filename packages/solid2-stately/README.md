# @solid2-aria/stately

State management for Solid 2 accessible components.

Install workspace dependencies from the repository root:

```bash
bun install
```

Build the library from this directory:

```bash
bun run build
```

tsdown emits ESM JavaScript, source maps, and TypeScript declarations into `dist/`. It generates the package export map from the source files. The build includes the third-party license texts and notices in `dist/LICENSES/` and `dist/NOTICE.txt`.

Import from the package root or a module subpath:

```ts
import { createListState, parseColor } from "@solid2-aria/stately";
import type { ListState } from "@solid2-aria/stately";
import { createToggleState } from "@solid2-aria/stately/toggle/create-toggle-state";
```

Install `solid-js` version `^2.0.0-rc.17` as a peer dependency. `@solid2-aria/stately` uses renderer-neutral `Element` types from `solid-js` and does not require `@solidjs/web`. TypeScript projects can use `moduleResolution: "bundler"` or `"NodeNext"`.

Watch source files and rebuild:

```bash
bun run dev
```

Check types and run tests:

```bash
bun run check-types
bun run test
```

Verify all built entry points and a state update in an isolated consumer without `@solidjs/web`:

```bash
bun run check-renderer-independence
```
