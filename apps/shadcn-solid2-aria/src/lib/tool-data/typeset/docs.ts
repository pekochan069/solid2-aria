/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/app/(app)/(typeset)/lib/fixtures/docs.ts.
 * Modified for Solid Aria: Solid 2 component tutorial, local documentation links, code samples, and typography fixtures.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

export const DOCS_HTML = `
<h1>Building an Accessible Solid 2 Interface</h1>
<p>Solid2 Aria components provide keyboard interactions, focus management, and accessible names. Copy the styled component source into your application, then customize it for your design system.</p>
<p>The component layer separates presentation from interaction:</p>
<ul>
<li><strong>Accessible behavior</strong>: Solid2 Aria manages focus, keyboard input, and ARIA attributes.</li>
<li><strong>Reactive state</strong>: Solid 2 signals update the interface when the user interacts with a control.</li>
<li><strong>Local styling</strong>: Tailwind classes and semantic theme tokens define the appearance.</li>
</ul>
<p>Start with the <a href="/docs/installation">installation guide</a>, then copy the components you need.</p>
<h2>Example</h2>
<p>A counter connects reactive state to an accessible button:</p>
<ol>
<li>Create a signal with the initial count.</li>
<li>Pass an activation handler to the button's <code>onPress</code> prop.</li>
<li>Read the signal inside JSX to display its current value.</li>
</ol>
<pre><code>import { createSignal } from "solid-js";
import { Button } from "#components/ui/button";

export function Counter() {
  const [count, setCount] = createSignal(0);

  return (
    &lt;Button onPress={() =&gt; setCount(value =&gt; value + 1)}&gt;
      Clicked {count()} times
    &lt;/Button&gt;
  );
}</code></pre>
<blockquote><p>Read reactive values inside JSX or a reactive computation. Keep component props as property accesses so updates remain reactive.</p></blockquote>
<h3>Controlled state</h3>
<p>Pass a signal's current value and its setter when a component supports controlled state.</p>
<pre><code>const [selected, setSelected] = createSignal(false);

&lt;Checkbox isSelected={selected()} onChange={setSelected}&gt;
  Receive updates
&lt;/Checkbox&gt;</code></pre>
<h2>Component reference</h2>
<table><thead><tr><th>Prop</th><th>Purpose</th><th>Example</th></tr></thead><tbody>
<tr><td><code>class</code></td><td>Tailwind styling</td><td><code>rounded-full</code></td></tr>
<tr><td><code>isDisabled</code></td><td>Disable a control</td><td><code>isDisabled={saving()}</code></td></tr>
<tr><td><code>onPress</code></td><td>Handle accessible activation</td><td><code>onPress={save}</code></td></tr>
<tr><td><code>aria-label</code></td><td>Name an icon-only control</td><td><code>aria-label="Close"</code></td></tr>
</tbody></table>
<h2>Theme tokens</h2>
<p>Semantic colors keep controls consistent. Update both background and foreground tokens when changing a theme.</p>
<pre><code>:root {
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
}</code></pre>
<hr>
<h2>Math</h2>
<p>Display math sits in the flow rhythm and scrolls when it runs long. Inline math like <math><msup><mi>e</mi><mrow><mi>i</mi><mi>π</mi></mrow></msup><mo>+</mo><mn>1</mn><mo>=</mo><mn>0</mn></math> rides the line without stretching it.</p>
<h3>Display</h3>
<p>The quadratic formula, as a block:</p>
<math display="block">
  <mi>x</mi><mo>=</mo>
  <mfrac>
    <mrow><mo>−</mo><mi>b</mi><mo>±</mo><msqrt><mrow><msup><mi>b</mi><mn>2</mn></msup><mo>−</mo><mn>4</mn><mi>a</mi><mi>c</mi></mrow></msqrt></mrow>
    <mrow><mn>2</mn><mi>a</mi></mrow>
  </mfrac>
</math>
<p>Prose continues after the block at the normal distance, so equations read as part of the argument, not decoration.</p>
<h3>Overflow</h3>
<p>A long expansion scrolls inside its own box instead of breaking the column:</p>
<math display="block">
  <msup><mrow><mo>(</mo><mi>a</mi><mo>+</mo><mi>b</mi><mo>)</mo></mrow><mn>4</mn></msup><mo>=</mo>
  <msup><mi>a</mi><mn>4</mn></msup><mo>+</mo>
  <mn>4</mn><msup><mi>a</mi><mn>3</mn></msup><mi>b</mi><mo>+</mo>
  <mn>6</mn><msup><mi>a</mi><mn>2</mn></msup><msup><mi>b</mi><mn>2</mn></msup><mo>+</mo>
  <mn>4</mn><mi>a</mi><msup><mi>b</mi><mn>3</mn></msup><mo>+</mo>
  <msup><mi>b</mi><mn>4</mn></msup>
</math>
`;
