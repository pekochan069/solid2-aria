/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/app/(app)/(typeset)/typeset/page.tsx, components/{customizer,docs-panel,preview,toolbar}.tsx and lib/search-params.ts.
 * Modified for Solid Aria: Solid 2 typography state, history, URL sharing, accessible picker menus, locks, and transient fixture previews.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import ArrowHorizontalIcon from "@hugeicons/core-free-icons/ArrowHorizontalIcon";
import ParagraphSpacingIcon from "@hugeicons/core-free-icons/ParagraphSpacingIcon";
import TextSmallcapsIcon from "@hugeicons/core-free-icons/TextSmallcapsIcon";
import {
  For,
  Show,
  createMemo,
  createSignal,
  onSettled,
  untrack,
} from "solid-js";

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
import { HugeIcon } from "../huge-icon";
import { DesignerMenu } from "./designer-menu";
import { DesignerPicker } from "./designer-picker";
import { TypesetCodeDrawer, TypesetDocsContent } from "./typeset-docs";

import "../../styles/tools.css";

const measureWidths = {
  "60": "28em",
  "70": "33em",
  "80": "37em",
  "90": "42em",
} satisfies Record<TypesetConfig["measure"], string>;

type TypesetPickerField = Exclude<keyof TypesetConfig, "item">;

function optionLabel(key: TypesetPickerField, value: string) {
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

        return "Loose";
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

        return "Airy";
      })();

      return `${label} (${value})`;
    }

    case "body":
    case "heading":
    case "mono": {
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

    default: {
      const exhaustive: never = key;
      throw new Error("Unknown typeset picker", { cause: exhaustive });
    }
  }
}

function pickerIcon(field: TypesetPickerField, config: TypesetConfig) {
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
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M4.5 3.5H19.5M4.5 20.5H19.5M17 17L14.8905 11.4741C13.9109 8.90801 13.4211 7.625 12.625 7.625C11.8289 7.625 11.3391 8.90801 10.3595 11.4741L8.25 17M9.5 13H15.75"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-width="1.5"
          />
        </svg>
      );
    }

    case "body":
    case "heading":
    case "mono": {
      const font = config[field];

      return (
        <span
          class="font-picker-icon"
          style={{
            "font-family":
              fontFamilies[font === "inherit" ? config.body : font],
          }}
        >
          Aa
        </span>
      );
    }

    default: {
      const exhaustive: never = field;
      throw new Error("Unknown typeset picker", { cause: exhaustive });
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
  const state = createToolState(
    typesetSchema,
    untrack(() => props.initial)
  );

  const [mobile, setMobile] = createSignal(false);

  const [locks, setLocks] = createSignal<ReadonlySet<TypesetPickerField>>(
    new Set()
  );

  const [previewOverride, setPreviewOverride] = createSignal<
    Partial<TypesetConfig>
  >({});

  let previewTimer: ReturnType<typeof setTimeout> | undefined;

  const previewConfig = createMemo(() =>
    typesetSchema.parse({ ...state.value(), ...previewOverride() })
  );

  onSettled(() => {
    const media = window.matchMedia("(max-width: 767px)");

    const updateMobile = () => {
      setMobile(media.matches);
    };

    updateMobile();
    media.addEventListener("change", updateMobile);

    return () => {
      media.removeEventListener("change", updateMobile);
      clearTimeout(previewTimer);
    };
  });

  function preview(key: TypesetPickerField, value?: string) {
    clearTimeout(previewTimer);

    if (value === undefined) {
      setPreviewOverride({});

      return;
    }

    const next = typesetSchema.parse({ ...state.value(), [key]: value });
    previewTimer = setTimeout(() => {
      setPreviewOverride({ [key]: next[key] });
    }, 50);
  }

  const pick = (key: TypesetPickerField, label: string) => (
    <DesignerPicker
      label={label}
      mobile={mobile()}
      value={state.value()[key]}
      options={typesetSchema.shape[key]
        .unwrap()
        .options.map((value: string) => ({
          label: optionLabel(
            key,
            value === "inherit" ? state.value().body : value
          ),
          separator: key === "heading" && value === "geist",
          value,
        }))}
      icon={pickerIcon(key, state.value())}
      isLocked={locks().has(key)}
      onToggleLock={() => {
        setLocks((current) => {
          const next = new Set(current);

          if (next.has(key)) {
            next.delete(key);
          } else {
            next.add(key);
          }

          return next;
        });
      }}
      onPreview={(value) => {
        preview(key, value);
      }}
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
    const config = previewConfig();

    return config.heading === "inherit"
      ? fontFamilies[config.body]
      : fontFamilies[config.heading];
  };

  function randomize() {
    const config = state.value();

    const fields = typesetSchema
      .omit({ item: true })
      .keyof()
      .options.filter((key) => !locks().has(key))
      .map((key) => {
        const { options } = typesetSchema.shape[key].unwrap();

        const candidates = options.filter((value) =>
          key === "mono" ? value === "mono" : value !== "mono"
        );

        return [key, candidates[Math.floor(Math.random() * candidates.length)]];
      });

    state.change(
      typesetSchema.parse({ ...config, ...Object.fromEntries(fields) })
    );
  }

  return (
    <main
      id="main-content"
      class="tool-page designer-page typeset-page"
      data-slot="designer"
    >
      <div class="designer-layout">
        <aside
          class="tool-panel designer-customizer dark"
          aria-label="Typography settings"
        >
          <h1 class="sr-only">Typeset</h1>
          <div class="typeset-customizer-header">
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
          </div>
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
                Number(state.value().scale) *
                  Number(state.value().flow.slice(0, -2))
              )}
              px
            </div>
          </div>
          <div class="designer-main-actions tool-actions">
            <Button variant="outline" onPress={randomize}>
              Shuffle
            </Button>
            <TypesetCodeDrawer
              css={typesetCss(state.value())}
              mobile={mobile()}
            />
          </div>
        </aside>
        <section
          aria-label="Typography preview"
          class="tool-preview typeset-preview"
          style={{
            "--typeset-flow": previewConfig().flow,
            "--typeset-font-body": fontFamilies[previewConfig().body],
            "--typeset-font-heading": headingFamily(),
            "--typeset-font-mono": fontFamilies[previewConfig().mono],
            "--typeset-leading": previewConfig().leading,
            "--typeset-measure": measureWidths[previewConfig().measure],
            "--typeset-size": `${previewConfig().scale}px`,
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
          <TypesetDocsContent css={typesetCss(state.value())} />
        </aside>
      </div>
    </main>
  );
}
