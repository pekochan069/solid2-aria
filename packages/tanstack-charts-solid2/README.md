# @solid2-aria/tanstack-charts

Solid 2 SVG adapter for `@tanstack/charts`.

## Installation

```sh
bun add @solid2-aria/tanstack-charts @tanstack/charts solid-js@next @solidjs/web@next
```

## Usage

```tsx
import { Chart } from "@solid2-aria/tanstack-charts";
import { barY, defineChart } from "@tanstack/charts";
import { scaleBand } from "@tanstack/charts/scales/band";
import { scaleLinear } from "@tanstack/charts/scales/linear";

const definition = defineChart({
  marks: [
    barY([{ month: "January", visitors: 186 }], { x: "month", y: "visitors" }),
  ],
  scales: { x: { scale: scaleBand }, y: { scale: scaleLinear } },
});

export function VisitorsChart() {
  return (
    <Chart
      definition={definition}
      ariaLabel="Visitors"
      width={600}
      height={300}
    />
  );
}
```

## npm and Solid 2 release candidates

`@tanstack/charts` versions 1.0.0 and 1.1.0 declare an optional `solid-js` peer dependency of `>=1.8`. npm excludes prerelease versions such as `2.0.0-rc.17` from that range. If Solid 2 RC is installed, npm can fail with `ERESOLVE`.

If this happens, install with `--legacy-peer-deps`:

```sh
npm install --legacy-peer-deps @solid2-aria/tanstack-charts @tanstack/charts solid-js@next @solidjs/web@next
```

This option skips all peer dependency checks. Verify the project's peer dependencies before using it. Bun 1.4.4 installs this combination without the option.

See [NOTICE.txt](./NOTICE.txt) and [the TanStack license](./TANSTACK-LICENSE) for attribution.
