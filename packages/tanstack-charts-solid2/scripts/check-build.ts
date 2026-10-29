import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import manifest from "../package.json" with { type: "json" };

const consumer = process.argv[2] ?? new URL("..", import.meta.url).pathname;

await Promise.all(
  Object.values(manifest.exports["."]).map(async (entry) => {
    const source = await readFile(
      new URL(`../${entry}`, import.meta.url),
      "utf-8"
    );

    assert.match(source, /Modified for Solid Aria:/u);
    assert.doesNotMatch(source, /solid-js\/web|react\/jsx-runtime/u);
  })
);

const definition = `
import { barY, defineChart } from '@tanstack/charts';
import { scaleBand } from '@tanstack/charts/scales/band';
import { scaleLinear } from '@tanstack/charts/scales/linear';
const chart = (value) => defineChart({
  marks: [barY([{month: 'January', visitors: value}], {x: 'month', y: 'visitors'})],
  scales: {x: {scale: scaleBand}, y: {scale: scaleLinear}},
});
`;

const server = `
import assert from 'node:assert/strict';
import { renderToString } from '@solidjs/web';
import { Chart } from '@solid2-aria/tanstack-charts';
${definition}
const html = renderToString(() => Chart({definition: chart(186), ariaLabel: 'Visitors', width: 600, height: 300}));
assert.match(html, /<svg/u);
assert.match(html, /Visitors/u);
assert.match(html, /January/u);
console.info('Server export and SVG prerender passed.');
`;

const browser = `
import assert from 'node:assert/strict';
import { Window } from 'happy-dom';
const window = new Window({url: 'https://charts.test'});
for (const key of ['window', 'document', 'navigator', 'HTMLElement', 'SVGElement', 'SVGSVGElement', 'Element', 'Node', 'Text', 'Event', 'CustomEvent', 'MouseEvent', 'KeyboardEvent', 'PointerEvent', 'CSS', 'DOMRect', 'MutationObserver', 'ResizeObserver', 'NodeFilter', 'ShadowRoot', 'DocumentFragment', 'getComputedStyle', 'requestAnimationFrame', 'cancelAnimationFrame']) {
  Object.defineProperty(globalThis, key, {configurable: true, value: window[key], writable: true});
}
const { render } = await import('@solidjs/web');
const { createSignal, flush } = await import('solid-js');
const { Chart } = await import('@solid2-aria/tanstack-charts');
${definition}
const host = document.createElement('div');
document.body.append(host);
let setValue;
let lastValue;
let renders = 0;
const dispose = render(() => {
  const [value, update] = createSignal(186);
  setValue = update;
  return Chart({
    get definition() { return chart(value()); },
    ariaLabel: 'Visitors', width: 600, height: 300,
    onRender({scene}) { lastValue = scene.points[0]?.datum.visitors; renders++; },
  });
}, host);
flush();
await Promise.resolve();
flush();
assert.ok(host.querySelector('svg'));
assert.equal(lastValue, 186);
setValue(305);
flush();
assert.equal(lastValue, 305);
dispose();
const rendered = renders;
setValue(999);
flush();
assert.equal(renders, rendered);
assert.equal(host.childElementCount, 0);
await window.happyDOM.close();
console.info('Browser export, mounting, reactive updates, and disposal passed.');
`;

for (const [source, conditions] of [
  [server, []],
  [browser, ["--conditions=browser", "--conditions=development"]],
] as const) {
  const result = Bun.spawnSync(
    [process.execPath, ...conditions, "--eval", source],
    {
      cwd: consumer,
      stderr: "pipe",
      stdout: "pipe",
    }
  );

  assert.equal(
    result.exitCode,
    0,
    result.stdout.toString() + result.stderr.toString()
  );
  console.info(result.stdout.toString().trim());
}
