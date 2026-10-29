import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";

import { Toaster, toast, useSonner } from "@solid2-aria/sonner";
import { generateHydrationScript, renderToString } from "@solidjs/web";

assert.equal(typeof toast.promise, "function");

assert.equal(typeof useSonner, "function");

const html = renderToString(() =>
  Toaster({ closeButton: true, duration: Infinity, richColors: true })
);

assert.match(html, /aria-label="Notifications/u);

assert.match(html, /aria-live="polite"/u);

assert.doesNotMatch(html, /data-sonner-toast=/u);

assert.equal(toast.getToasts().length, 0);

await writeFile("toaster.html", html);

const script = /<script>(?<script>[\s\S]*?)<\/script>/u.exec(
  generateHydrationScript()
)?.groups?.script;

assert.ok(script !== undefined);

await writeFile("hydration.js", script);

console.info("Server import and SSR rendering passed.");
