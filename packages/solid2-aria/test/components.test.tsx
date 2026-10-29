import { test } from "bun:test";
import assert from "node:assert/strict";

import { render } from "@solidjs/web";
import { createSignal, flush } from "solid-js";

import { createCollator } from "../src/i18n/create-collator";
import { createNumberFormatter } from "../src/i18n/create-number-formatter";
import { I18nProvider, createLocale } from "../src/i18n/i18n-provider";
import { VisuallyHidden } from "../src/visually-hidden/visually-hidden";

function ReadLocale() {
  const current = createLocale();

  return (
    <span lang={current.locale} dir={current.direction}>
      {current.locale}
    </span>
  );
}

test("locale context preserves reactive locale and direction", () => {
  const [locale, setLocale] = createSignal("en-US");
  const host = document.createElement("div");
  document.body.append(host);

  const dispose = render(
    () => (
      <I18nProvider locale={locale()}>
        <ReadLocale />
      </I18nProvider>
    ),
    host
  );

  flush();
  assert.equal(host.querySelector("span")?.lang, "en-US");
  assert.equal(host.querySelector("span")?.dir, "ltr");
  setLocale("ar-AE");
  flush();
  assert.equal(host.querySelector("span")?.lang, "ar-AE");
  assert.equal(host.querySelector("span")?.dir, "rtl");
  dispose();
  host.remove();
});

test("visually hidden content renders with accessible children", () => {
  const host = document.createElement("div");
  document.body.append(host);

  const dispose = render(
    () => (
      <VisuallyHidden>
        <button>Dismiss dialog</button>
      </VisuallyHidden>
    ),
    host
  );

  flush();
  const button = host.querySelector("button");
  assert.equal(button?.textContent, "Dismiss dialog");
  assert.equal(
    host.firstElementChild
      ?.getAttribute("style")
      ?.includes("position: absolute"),
    true
  );
  assert.equal(button?.getAttribute("aria-hidden"), null);
  dispose();
  assert.equal(host.childNodes.length, 0);
  host.remove();
});

function Number() {
  const formatter = createNumberFormatter();

  return <output>{formatter.format(1234.5)}</output>;
}

test("number formatters update their methods when the provider locale changes", () => {
  const [locale, setLocale] = createSignal("en-US");
  const host = document.createElement("div");
  document.body.append(host);

  const dispose = render(
    () => (
      <I18nProvider locale={locale()}>
        <Number />
      </I18nProvider>
    ),
    host
  );

  flush();
  assert.equal(host.textContent, "1,234.5");
  setLocale("de-DE");
  flush();
  assert.equal(host.textContent, "1.234,5");
  dispose();
  host.remove();
});

function Collation() {
  const collator = createCollator();

  return (
    <output data-locale={collator.resolvedOptions().locale}>
      {collator.compare("ä", "z")}
    </output>
  );
}

test("collator methods retain their native receiver and follow locale changes", () => {
  const [locale, setLocale] = createSignal("de-DE");
  const host = document.createElement("div");
  document.body.append(host);

  const dispose = render(
    () => (
      <I18nProvider locale={locale()}>
        <Collation />
      </I18nProvider>
    ),
    host
  );

  try {
    flush();
    assert.ok(globalThis.Number(host.textContent) < 0);
    assert.equal(
      host.querySelector("output")?.dataset.locale?.startsWith("de"),
      true
    );
    setLocale("sv-SE");
    flush();
    assert.ok(globalThis.Number(host.textContent) > 0);
    assert.equal(
      host.querySelector("output")?.dataset.locale?.startsWith("sv"),
      true
    );
  } finally {
    dispose();
    host.remove();
  }
});
