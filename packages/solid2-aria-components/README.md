# @solid2-aria/components

Styleable, accessible components for Solid 2, ported from Adobe React Aria Components. Components compose the local `@solid2-aria/core` behaviors and `@solid2-aria/stately` state managers.

## Installation

```sh
bun add @solid2-aria/components solid-js@next @solidjs/web@next
```

## Use a component

Configure your JSX compiler for Solid 2 and set TypeScript's `jsxImportSource` to `@solidjs/web`.

```tsx
import { Button, Input, Label, Text, TextField } from "@solid2-aria/components";
import { createSignal } from "solid-js";

export function NameField() {
  const [name, setName] = createSignal("");
  return (
    <TextField value={name()} onChange={setName}>
      <Label>Name</Label>
      <Input />
      <Text slot="description">Enter the name to show on your profile.</Text>
      <Button onPress={() => console.info(name())}>Save</Button>
    </TextField>
  );
}
```

Pass signal values at JSX boundaries. Components accept callback refs, slotted context props, `class`, and state-based render functions. Default classes use `solid2-aria-` instead of `react-aria-`. State attributes such as `data-disabled`, `data-selected`, and `data-focus-visible` support CSS styling.

The `class` prop accepts Solid class values (strings, arrays, and objects). Components with state-based classes also accept a `ClassOrFunction` callback, whose values include `defaultClass`.

For collection items with dynamic or composed children, provide `textValue`. Collection controls use that text for typeahead and closed-picker values.

The root entry exports the ported components and types. Imported hook factories also have `create` names, such as `createListData`, `createAsyncList`, `createDrag`, and `createFilter`. DOM references use native callback refs and accessors. Solid owns rendering and reactive lifecycle; the package has no React runtime dependency.

The build includes browser and server entry points, declaration files, component subpaths with kebab-case filenames, and upstream notices. Conditional exports select the browser build when the `browser` condition is active.

Subpaths point directly to implementation modules. Import `CheckboxGroup` from `@solid2-aria/components/checkbox` and `Label` from `@solid2-aria/components/label`, or import both from the package root. Each subpath exports the symbols defined in its source module.

## Verify the port

Run these commands from this package directory after installing the workspace dependencies:

```sh
bun run --cwd ../solid2-stately build
bun run --cwd ../solid2-aria build
bun run check-types
bun run test
bun run check-port-coverage
bun run generate-public-barrel
bun run build
bun run check-build
```

Components import the public built subpaths of `@solid2-aria/stately` and `@solid2-aria/core`. Rebuild those dependencies after changing their source.

`check-build` checks for declarations emitted beside source files. It then copies the built packages into a temporary consumer directory and verifies server rendering, browser interactions, and declaration imports without source files.

`check-port-coverage` compares all 71 upstream source modules and their original license notices with the sibling `react-spectrum` checkout. It also checks root runtime exports. The checker and export generator accept an optional path to another upstream `react-aria-components` package.

See [NOTICE.txt](./dist/NOTICE.txt) and [the Apache-2.0 license](./dist/LICENSES/Apache-2.0.txt) for provenance and license terms.
