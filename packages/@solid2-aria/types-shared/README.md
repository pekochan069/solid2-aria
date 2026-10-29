# @solid2-aria/types-shared

Accessible UI component types for Solid 2, ported from Adobe React Spectrum.

## Installation

```sh
bun add @solid2-aria/types-shared solid-js@next
```

## Usage

```ts
import type { Collection } from "@solid2-aria/types-shared";
```

State, collection, and component contracts use renderer-neutral types from `solid-js`. This package does not require `@solidjs/web`.

Web attributes, renderer refs, and style types are exported by `@solid2-aria/types-shared-web`. For example, import `Collection` from `@solid2-aria/types-shared` and `DOMAttributes` from `@solid2-aria/types-shared-web`.

Adobe-derived declarations retain their Apache-2.0 license and original notices. See [NOTICE.txt](./NOTICE.txt), [Apache-2.0](./LICENSES/Apache-2.0.txt), and [the upstream notices](./LICENSES/react-spectrum-NOTICE.txt). Independently authored Solid Aria material uses the [MIT license](./LICENSE).
