/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/app/(app)/(create)/create/page.tsx and components/{customizer,preview,preview-override,project-form,history-buttons,random-button}.tsx.
 * Modified for Solid Aria: Solid 2 configuration, transient hover previews, in-place iframe synchronization, URL presets, history, and workspace component generation.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import Menu02Icon from "@hugeicons/core-free-icons/Menu02Icon";
import { Portal } from "@solidjs/web";
import {
  createEffect,
  createMemo,
  createSignal,
  For,
  onSettled,
  Show,
  untrack,
} from "solid-js";

import { designThemeCss } from "../../lib/design-theme";
import { absoluteUrl } from "../../lib/site";
import { baseColorNames, designThemes } from "../../lib/tool-data/themes";
import {
  createToolState,
  designFields,
  designSchema,
} from "../../lib/tool-state";
import type { DesignConfig } from "../../lib/tool-state";
import { Button } from "../../registry/ui/button";
import { blocks as blockEntries } from "../catalog/inventory";
import { Code } from "../docs/code";
import { HugeIcon } from "../huge-icon";
import { CreateWelcome } from "./create-welcome";
import { LucideLogo, RadiusIcon, StyleIcon } from "./designer-icons";
import { DesignerMenu } from "./designer-menu";
import { DesignerPicker } from "./designer-picker";
import { CopyAction, Picker } from "./shared";

import "../../styles/tools.css";

function sendPreview(
  frame: HTMLIFrameElement | undefined,
  config: DesignConfig
) {
  frame?.contentWindow?.postMessage(
    { data: config, type: "design-system-params" },
    window.location.origin
  );
}

export function CreatePage(props: { initial: DesignConfig }) {
  const state = createToolState(
    designSchema,
    untrack(() => props.initial)
  );

  const [codeOpen, setCodeOpen] = createSignal(false);
  const [preset, setPreset] = createSignal("");
  const [presetError, setPresetError] = createSignal("");
  const [width, setWidth] = createSignal("100%");
  const [presetOpen, setPresetOpen] = createSignal(false);
  const [previewOptionsOpen, setPreviewOptionsOpen] = createSignal(false);
  const [headerElement, setHeaderElement] = createSignal<Element>();
  const [mobile, setMobile] = createSignal(false);
  const [previewFrame, setPreviewFrame] = createSignal<HTMLIFrameElement>();

  const [previewOverride, setPreviewOverride] = createSignal<
    Partial<DesignConfig>
  >({});

  let previewTimer: ReturnType<typeof setTimeout> | undefined;

  const previewConfig = createMemo(() =>
    designSchema.parse({ ...state.value(), ...previewOverride() })
  );

  const previewItem = createMemo(() => state.value().item);

  const previewSrc = createMemo(() => {
    const item = previewItem();

    return untrack(
      () =>
        `/preview/aria/${item}?${new URLSearchParams(Object.entries(state.value())).toString()}`
    );
  });

  createEffect(
    () => ({ config: previewConfig(), frame: previewFrame() }),
    ({ frame, config }) => {
      sendPreview(frame, config);
    }
  );

  function preview(key: keyof DesignConfig, value: string | undefined) {
    clearTimeout(previewTimer);
    previewTimer = undefined;

    if (value === undefined) {
      setPreviewOverride((current) =>
        Object.keys(current).length === 0 ? current : {}
      );

      return;
    }

    previewTimer = setTimeout(() => {
      previewTimer = undefined;
      setPreviewOverride((current) =>
        current[key] === value ? current : { [key]: value }
      );
    }, 50);
  }

  const [locks, setLocks] = createSignal<ReadonlySet<keyof DesignConfig>>(
    new Set()
  );

  onSettled(() => {
    const media = window.matchMedia("(max-width: 767px)");

    const updateMobile = () => {
      setMobile(media.matches);
    };

    updateMobile();
    media.addEventListener("change", updateMobile);

    const element = document.querySelector("#designer-header-actions");

    if (element !== null) {
      setHeaderElement(element);
    }

    return () => {
      media.removeEventListener("change", updateMobile);
      clearTimeout(previewTimer);
    };
  });

  const previewUrl = () =>
    `/preview/aria/${state.value().item}?${new URLSearchParams(Object.entries(state.value())).toString()}`;

  function optionLabel(
    key: Exclude<keyof DesignConfig, "item">,
    value: string
  ) {
    if (key === "fontHeading" && value === "inherit") {
      const { font } = state.value();

      return font.charAt(0).toUpperCase() + font.slice(1);
    }

    if (key === "radius") {
      const labels = {
        "0": "None",
        "0.3": "Small",
        "0.625": "Default",
        "1": "Large",
      };

      return (
        Object.entries(labels).find(([radius]) => radius === value)?.[1] ??
        value
      );
    }

    if (key === "menuColor" && value === "default") {
      return "Default / Solid";
    }

    if (key === "menuColor" && value === "inverted") {
      return "Inverted / Solid";
    }

    if (key === "font" || key === "fontHeading") {
      const labels = {
        geist: "Geist",
        inter: "Inter",
        mono: "Geist Mono",
        sans: "System Sans",
        serif: "Georgia",
      };

      return (
        Object.entries(labels).find(([font]) => font === value)?.[1] ?? value
      );
    }

    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  function pickerIcon(key: Exclude<keyof DesignConfig, "item">) {
    if (key === "font" || key === "fontHeading") {
      return <span class="font-picker-icon">Aa</span>;
    }

    if (key === "style") {
      return <StyleIcon name={state.value().style} />;
    }

    if (key === "radius") {
      return (
        <span class="designer-radius-icon">
          <RadiusIcon />
        </span>
      );
    }

    if (key === "menuColor") {
      return <HugeIcon icon={Menu02Icon} size={16} />;
    }

    if (key === "baseColor" || key === "theme" || key === "chartColor") {
      return (
        <span
          class="picker-color"
          style={{
            background:
              key === "baseColor" ||
              baseColorNames.some((name) => name === state.value()[key])
                ? designThemes[state.value().baseColor].dark["muted-foreground"]
                : designThemes[state.value()[key]].dark.primary,
          }}
        />
      );
    }

    return null;
  }

  const pick = (key: Exclude<keyof DesignConfig, "item">, label: string) => (
    <DesignerPicker
      label={label}
      mobile={mobile()}
      isDisabled={
        key === "radius" &&
        (state.value().style === "lyra" || state.value().style === "sera")
      }
      value={
        key === "radius" &&
        (state.value().style === "lyra" || state.value().style === "sera")
          ? "0"
          : state.value()[key]
      }
      options={designFields.shape[key]
        .unwrap()
        .options.filter(
          (value) =>
            (key !== "theme" && key !== "chartColor") ||
            value === state.value().baseColor ||
            !baseColorNames.some((name) => name === value)
        )
        .toSorted((a, b) =>
          key === "radius" ? Number(b === "0.625") - Number(a === "0.625") : 0
        )
        .map((value, index) => ({
          label: optionLabel(key, value),
          separator:
            index === 1 &&
            (key === "theme" ||
              key === "chartColor" ||
              key === "radius" ||
              key === "fontHeading"),
          value,
        }))}
      icon={pickerIcon(key)}
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
      onChange={(value) => {
        state.change(designSchema.parse({ ...state.value(), [key]: value }));
      }}
      onPreview={(value) => {
        preview(key, value);
      }}
    />
  );

  const code = () =>
    `bun add @solid2-aria/components@^0.0.1 cn class-variance-authority @lucide/solid\n\n/* globals.css */\n${designThemeCss(state.value())}\n\n/* App container */\n<div class="style-${state.value().style}" dir="${state.value().rtl === "true" ? "rtl" : "ltr"}">\n  {children}\n</div>`;

  function randomize() {
    const config = state.value();

    const preserveBaseColor = (["theme", "chartColor"] as const).some(
      (key) =>
        locks().has(key) && baseColorNames.some((name) => name === config[key])
    );

    state.change(
      designSchema.parse({
        ...config,
        ...Object.fromEntries(
          designFields
            .omit({ item: true })
            .keyof()
            .options.filter(
              (key) =>
                !locks().has(key) && (key !== "baseColor" || !preserveBaseColor)
            )
            .map((key) => {
              const { options } = designFields.shape[key].unwrap();

              return [key, options[Math.floor(Math.random() * options.length)]];
            })
        ),
      })
    );
  }

  function loadPreset() {
    try {
      const url = new URL(preset());
      state.change(designSchema.parse(Object.fromEntries(url.searchParams)));
      setPresetError("");
    } catch {
      setPresetError("Paste a complete shared Create URL.");
    }
  }

  return (
    <main
      id="main-content"
      class="tool-page designer-page create-page"
      data-slot="designer"
    >
      <CreateWelcome />
      <Show when={headerElement()}>
        {(element) => (
          <Portal mount={element()}>
            <a
              href={previewUrl()}
              target="_blank"
              rel="noreferrer"
              class="designer-header-link"
            >
              Open in New Tab ↗
            </a>
            <Button
              size="sm"
              onPress={() => {
                setCodeOpen(true);
              }}
            >
              Get Code
            </Button>
          </Portal>
        )}
      </Show>
      <div class="designer-layout create-layout">
        <aside class="tool-panel designer-customizer dark">
          <h1 class="sr-only">New Project</h1>
          <div class="create-customizer-header">
            <DesignerMenu
              canUndo={state.canUndo()}
              canRedo={state.canRedo()}
              undo={state.undo}
              redo={state.redo}
              reset={state.reset}
              shuffle={randomize}
              shareUrl={absoluteUrl(
                `/create?${new URLSearchParams(Object.entries(state.value())).toString()}`
              )}
              onNavigate={() => {
                setPreviewOptionsOpen(true);
              }}
              onOpenPreset={() => {
                setPresetOpen(true);
              }}
            />
          </div>
          <div class="designer-fields">
            {pick("style", "Style")}
            <div class="designer-field-separator" />
            {pick("baseColor", "Base Color")}
            {pick("theme", "Theme")}
            {pick("chartColor", "Chart Color")}
            <div class="designer-field-separator" />
            {pick("fontHeading", "Heading")}
            {pick("font", "Font")}
            <div class="designer-field-separator" />
            <DesignerPicker
              label="Icon Library"
              value="lucide"
              options={[{ label: "Lucide", value: "lucide" }]}
              icon={<LucideLogo />}
              mobile={mobile()}
            />
            {pick("radius", "Radius")}
            <div class="designer-field-separator" />
            {pick("menuColor", "Menu")}
            {pick("menuAccent", "Menu Accent")}
          </div>
          <div class="designer-main-actions tool-actions">
            <CopyAction
              value={absoluteUrl(
                `/create?${new URLSearchParams(Object.entries(state.value())).toString()}`
              )}
            >
              Copy Preset
            </CopyAction>
            <Button
              variant="outline"
              onPress={() => {
                setPresetOpen(true);
              }}
            >
              <Show when={mobile()} fallback="Open Preset">
                Open
              </Show>
            </Button>
            <Button variant="outline" onPress={randomize}>
              Shuffle
            </Button>
          </div>
          <div class="create-customizer-code tool-actions">
            <Button
              onPress={() => {
                setCodeOpen((open) => !open);
              }}
            >
              Get Code
            </Button>
          </div>
        </aside>
        <section
          class="create-preview-shell"
          aria-label="Design system preview"
        >
          <Show when={previewOptionsOpen()}>
            <div class="preview-toolbar">
              <Picker
                label="Preview"
                value={state.value().item}
                options={blockEntries.map((block) => ({
                  label: block.title,
                  value: block.name,
                }))}
                onChange={(value) => {
                  state.update("item", value);
                }}
              />
              <Picker
                label="Viewport"
                value={width()}
                options={[
                  { label: "Desktop", value: "100%" },
                  { label: "Tablet", value: "768px" },
                  { label: "Mobile", value: "390px" },
                ]}
                onChange={(value) => {
                  setWidth(value);
                }}
              />
              {pick("rtl", "Right to left")}
            </div>
          </Show>
          <div class="create-preview-scroll">
            <iframe
              class="create-preview"
              title="Design system preview"
              src={previewSrc()}
              ref={(element) => {
                setPreviewFrame(element);
              }}
              onLoad={(event) => {
                sendPreview(event.currentTarget, previewConfig());
              }}
              style={{ width: width() }}
            />
          </div>
          <div class="create-preview-switcher">
            <For
              each={[
                { label: "01", name: "preview-02" },
                { label: "02", name: "preview" },
              ]}
            >
              {(item) => (
                <button
                  type="button"
                  aria-label={`Preview ${item.label}`}
                  aria-pressed={
                    state.value().item === item.name ? "true" : "false"
                  }
                  onClick={() => {
                    state.update("item", item.name);
                  }}
                >
                  {item.label}
                </button>
              )}
            </For>
          </div>
          <button
            type="button"
            class="create-preview-options"
            aria-expanded={previewOptionsOpen() ? "true" : "false"}
            onClick={() => {
              setPreviewOptionsOpen((open) => !open);
            }}
          >
            Preview options
          </button>
        </section>
      </div>
      <Show when={presetOpen()}>
        <section class="tool-panel generated-code" aria-label="Open preset">
          <h2>Open preset</h2>
          <label class="tool-picker">
            <span>Shared URL</span>
            <input
              type="url"
              value={preset()}
              onInput={(event) => {
                setPreset(event.currentTarget.value);
              }}
            />
          </label>
          <Button variant="outline" onPress={loadPreset}>
            Apply preset
          </Button>
          <p role="status">{presetError()}</p>
          <Button
            variant="ghost"
            onPress={() => {
              setPresetOpen(false);
            }}
          >
            Close
          </Button>
        </section>
      </Show>
      <Show when={codeOpen()}>
        <section class="tool-panel generated-code" aria-label="Project code">
          <h2>Your theme configuration</h2>
          <p>
            Copy these settings into your application. Follow the{" "}
            <a href="/docs/installation">installation guide</a> to use the
            component source and theme in your Solid 2 app.
          </p>
          <Code code={code()} language="tsx" />
          <CopyAction value={code()}>Copy setup</CopyAction>
          <Button
            variant="ghost"
            onPress={() => {
              setCodeOpen(false);
            }}
          >
            Close
          </Button>
        </section>
      </Show>
    </main>
  );
}
