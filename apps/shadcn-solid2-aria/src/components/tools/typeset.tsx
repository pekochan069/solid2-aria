/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/app/(app)/(typeset)/typeset/page.tsx, components/{customizer,docs-panel,preview,toolbar}.tsx and lib/search-params.ts.
 * Modified for Solid Aria: Solid 2 typography state, history, URL sharing, native controls, and local fixture previews.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import ArrowHorizontalIcon from "@hugeicons/core-free-icons/ArrowHorizontalIcon";
import ParagraphSpacingIcon from "@hugeicons/core-free-icons/ParagraphSpacingIcon";
import TextSmallcapsIcon from "@hugeicons/core-free-icons/TextSmallcapsIcon";
import { For, Show, createSignal, untrack } from "solid-js";

import { absoluteUrl } from "../../lib/site";
import { FIXTURES } from "../../lib/tool-data/typeset";
import { CHAT_QUESTION } from "../../lib/tool-data/typeset/chat";
import {
  createToolState,
  fontFamilies,
  typesetSchema,
} from "../../lib/tool-state";
import type { TypesetConfig } from "../../lib/tool-state";
import { Button } from "../../registry/ui/button";
import { Code } from "../docs/code";
import { HugeIcon } from "../huge-icon";
import { DesignerMenu } from "./designer-menu";
import { CopyAction, Picker } from "./shared";

import "../../styles/tools.css";

const measureWidths = {
  "60": "28em",
  "70": "33em",
  "80": "37em",
  "90": "42em",
} satisfies Record<TypesetConfig["measure"], string>;

function optionLabel(key: keyof TypesetConfig, value: string) {
  switch (key) {
    case "measure": {
      return `${value}ch`;
    }

    case "scale": {
      return `${value}px`;
    }

    case "leading": {
      const label = (() => {
        if (value === "1.75") {
          return "Regular";
        }

        if (value === "1.6") {
          return "Tight";
        }

        return "Relaxed";
      })();

      return `${label} (${value})`;
    }

    case "flow": {
      const label = (() => {
        if (value === "1.25em") {
          return "Regular";
        }

        if (value === "1em") {
          return "Compact";
        }

        return "Loose";
      })();

      return `${label} (${value})`;
    }

    case "body": {
      throw new Error('Not implemented yet: "body" case');
    }

    case "heading": {
      throw new Error('Not implemented yet: "heading" case');
    }

    case "item": {
      throw new Error('Not implemented yet: "item" case');
    }

    case "mono": {
      throw new Error('Not implemented yet: "mono" case');
    }

    default: {
      switch (value) {
        case "inherit":
        case "geist": {
          return "Geist";
        }

        case "inter": {
          return "Inter";
        }

        case "mono": {
          return "Geist Mono";
        }

        case "sans": {
          return "System Sans";
        }

        case "serif": {
          return "Georgia";
        }

        default: {
          return value;
        }
      }
    }
  }
}

function pickerIcon(field: keyof TypesetConfig) {
  switch (field) {
    case "measure": {
      return <HugeIcon icon={ArrowHorizontalIcon} size={16} />;
    }

    case "scale": {
      return <HugeIcon icon={TextSmallcapsIcon} size={16} />;
    }

    case "flow": {
      return <HugeIcon icon={ParagraphSpacingIcon} size={16} />;
    }

    case "leading": {
      return <span class="leading-picker-icon">A̅</span>;
    }

    case "body": {
      throw new Error('Not implemented yet: "body" case');
    }

    case "heading": {
      throw new Error('Not implemented yet: "heading" case');
    }

    case "item": {
      throw new Error('Not implemented yet: "item" case');
    }

    case "mono": {
      throw new Error('Not implemented yet: "mono" case');
    }

    default: {
      return <span class="font-picker-icon">Aa</span>;
    }
  }
}

export function typesetCss(config: TypesetConfig) {
  return `.typeset-custom {\n  --typeset-font-body: ${fontFamilies[config.body]};\n  --typeset-font-heading: ${fontFamilies[config.heading === "inherit" ? config.body : config.heading]};\n  --typeset-font-mono: ${fontFamilies[config.mono]};\n  --typeset-size: ${config.scale}px;\n  --typeset-leading: ${config.leading};\n  --typeset-flow: ${config.flow};\n  max-width: ${measureWidths[config.measure]};\n}`;
}

export function TypesetFixture(props: { name: keyof typeof FIXTURES }) {
  return (
    <div class="typeset-fixture">
      <Show when={props.name === "chat"}>
        <p class="typeset-chat-question">{CHAT_QUESTION}</p>
      </Show>
      {/* oxlint-disable-next-line solid/no-innerhtml -- Render the checked-in typography fixtures. */}
      <article class="typeset" innerHTML={FIXTURES[props.name]} />
    </div>
  );
}

export function TypesetPage(props: { initial: TypesetConfig }) {
  const [docsTab, setDocsTab] = createSignal("docs");

  const state = createToolState(
    typesetSchema,
    untrack(() => props.initial)
  );

  const pick = (key: keyof TypesetConfig, label: string) => (
    <Picker
      label={label}
      value={state.value()[key]}
      options={typesetSchema.shape[key].unwrap().options.map((value) => ({
        label: optionLabel(key, value),
        value,
      }))}
      icon={pickerIcon(key)}
      onChange={(value) => {
        const parsed = typesetSchema.shape[key].safeParse(value);

        if (parsed.success) {
          state.change(
            typesetSchema.parse({ ...state.value(), [key]: parsed.data })
          );
        }
      }}
    />
  );

  const headingFamily = () => {
    const config = state.value();

    return config.heading === "inherit"
      ? fontFamilies[config.body]
      : fontFamilies[config.heading];
  };

  function randomize() {
    const fields = Object.entries(typesetSchema.shape).map(([key, schema]) => [
      key,
      schema.unwrap().options[
        Math.floor(Math.random() * schema.unwrap().options.length)
      ],
    ]);

    state.change(typesetSchema.parse(Object.fromEntries(fields)));
  }

  return (
    <main
      id="main-content"
      class="tool-page designer-page typeset-page"
      data-slot="designer"
    >
      <div class="designer-layout">
        <aside class="tool-panel designer-customizer dark">
          <h1 class="sr-only">Typeset</h1>
          <DesignerMenu
            canUndo={state.canUndo()}
            canRedo={state.canRedo()}
            undo={state.undo}
            redo={state.redo}
            reset={state.reset}
            shuffle={randomize}
            shareUrl={absoluteUrl(
              `/typeset?${new URLSearchParams(Object.entries(state.value())).toString()}`
            )}
          />
          <div class="designer-fields">
            {pick("measure", "Measure")}
            <div class="designer-field-separator" />
            {pick("heading", "Heading")}
            {pick("body", "Body")}
            {pick("mono", "Mono")}
            <div class="designer-field-separator" />
            {pick("scale", "Size")}
            {pick("leading", "Leading")}
            {pick("flow", "Flow")}
            <div class="typeset-rhythm">
              {state.value().scale}px /{" "}
              {Math.round(
                Number(state.value().scale) * Number(state.value().leading)
              )}
              px /{" "}
              {Math.round(
                Number(state.value().scale) * Number(state.value().flow)
              )}
              px
            </div>
          </div>
          <div class="designer-main-actions tool-actions">
            <Button variant="outline" onPress={randomize}>
              Shuffle
            </Button>
          </div>
        </aside>
        <section
          aria-label="Typography preview"
          class="tool-preview typeset-preview"
          style={{
            "--typeset-flow": state.value().flow,
            "--typeset-font-body": fontFamilies[state.value().body],
            "--typeset-font-heading": headingFamily(),
            "--typeset-font-mono": fontFamilies[state.value().mono],
            "--typeset-leading": state.value().leading,
            "--typeset-measure": measureWidths[state.value().measure],
            "--typeset-size": `${state.value().scale}px`,
          }}
        >
          <div class="typeset-preview-scroll">
            <TypesetFixture name={state.value().item} />
          </div>
          <div class="typeset-preview-toolbar">
            <div role="group" aria-label="Typography examples">
              <For each={typesetSchema.shape.item.unwrap().options.slice(0, 5)}>
                {(item, index) => (
                  <button
                    type="button"
                    aria-label={`Preview ${item}`}
                    aria-pressed={
                      state.value().item === item ? "true" : "false"
                    }
                    onClick={() => {
                      state.update("item", item);
                    }}
                  >
                    {String(index() + 1).padStart(2, "0")}
                  </button>
                )}
              </For>
            </div>
            <a
              href={`/preview/typeset/${state.value().item}?${new URLSearchParams(Object.entries(state.value())).toString()}`}
              target="_blank"
              rel="noreferrer"
            >
              Open in New Tab
            </a>
          </div>
        </section>
        <aside class="typeset-docs-panel">
          <div class="tool-panel tool-code-panel">
            <div
              class="typeset-docs-tabs"
              role="tablist"
              aria-label="Typeset setup"
            >
              <button
                type="button"
                role="tab"
                aria-selected={docsTab() === "docs" ? "true" : "false"}
                onClick={() => {
                  setDocsTab("docs");
                }}
              >
                Docs
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={docsTab() === "prompt" ? "true" : "false"}
                onClick={() => {
                  setDocsTab("prompt");
                }}
              >
                Prompt
              </button>
              <span>Solid 2</span>
            </div>
            <div class="typeset-docs-content" role="tabpanel">
              <Show
                when={docsTab() === "docs"}
                fallback={
                  <>
                    <p>Copy these settings into your Solid 2 project.</p>
                    <Code code={typesetCss(state.value())} language="css" />
                    <CopyAction value={typesetCss(state.value())}>
                      Copy CSS
                    </CopyAction>
                  </>
                }
              >
                <section>
                  <h2>1. Create typeset.css</h2>
                  <p>
                    Copy the stylesheet into a <code>typeset.css</code> file
                    next to your main CSS file, then import it:
                  </p>
                  <a
                    href="/typeset.css"
                    download="typeset.css"
                    class="typeset-download"
                  >
                    Copy typeset.css
                  </a>
                  <Code
                    code={'@import "tailwindcss";\n@import "./typeset.css";'}
                    language="css"
                  />
                </section>
                <section>
                  <h2>2. Add the fonts</h2>
                  <p>
                    Load your fonts in the main stylesheet and use their font
                    family names in your preset.
                  </p>
                  <Code
                    code={
                      '@font-face {\n  font-family: "Geist";\n  src: url("/fonts/geist-latin.woff2");\n  font-weight: 100 900;\n  font-display: swap;\n}'
                    }
                    language="css"
                  />
                </section>
                <section>
                  <h2>3. Create your custom typeset</h2>
                  <Code code={typesetCss(state.value())} language="css" />
                  <CopyAction value={typesetCss(state.value())}>
                    Copy CSS
                  </CopyAction>
                </section>
                <section>
                  <h2>4. Wrap your content</h2>
                  <Code
                    code={
                      '<article class="typeset typeset-custom">\n  {content}\n</article>'
                    }
                    language="tsx"
                  />
                </section>
              </Show>
            </div>
          </div>
          <a class="typeset-read-docs" href="/docs/typeset">
            Read the docs
          </a>
        </aside>
      </div>
    </main>
  );
}
