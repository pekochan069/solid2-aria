# @solid2-aria/core

Solid 2 accessibility primitives ported from Adobe React Spectrum's `packages/react-aria/src`. The upstream reference revision and attribution are recorded in [NOTICE.txt](./dist/NOTICE.txt).

## Installation

```sh
bun add @solid2-aria/core solid-js@next @solidjs/web@next
```

## Usage

```ts
import { createButton } from "@solid2-aria/core";
```

Factories use the `create` prefix, such as `createButton` and `createPress`. Source paths use kebab case, such as `button/create-button`. Pass reactive objects to factories and read their returned properties inside JSX or a computation. Create factories within an owned Solid scope so effects and event listeners are disposed with their owner. DOM arguments are native Solid accessors, such as `createButton(props, button)`, where `button` reads an element signal. Assign elements with JSX callback refs. Internal state uses native signals and two-phase effects.

## Development

Run these commands from this package:

```sh
bun run check-types
bun run test
bun run check-port-coverage
bun run build
bun run check-build
bun run check-package-types
```

The coverage check compares retained upstream source modules and JSON translations with the sibling `react-spectrum` checkout. Pass another upstream source directory as the first argument when that checkout is elsewhere. The build compiles JSX with the Solid 2 compiler and produces browser and server entries, declarations, source maps, and third-party notices.

To regenerate the public API barrel after an upstream update, run `bun run generate-public-barrel`. To regenerate translation barrels, run `bun run generate-intl-barrel-files`.
