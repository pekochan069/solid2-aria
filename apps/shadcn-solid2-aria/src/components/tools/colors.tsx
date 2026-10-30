/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/app/(app)/colors/{page,layout}.tsx, apps/v4/components/{color,color-palette,color-format-selector}.tsx and apps/v4/lib/colors.ts.
 * Modified for Solid Aria: Solid 2 color filtering, native format selectors, and clipboard actions.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { For, createSignal } from "solid-js";

import { colors } from "../../lib/tool-data/colors";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from "../../registry/ui/select";
import { PageHeader } from "../docs/page-header";

import "../../styles/tools.css";

const palettes = Object.entries(colors).flatMap(([name, value]) =>
  Array.isArray(value) ? [{ colors: value, name }] : []
);

const formats = ["hex", "rgb", "hsl", "oklch", "var", "class"];

export function ColorsPage() {
  const [format, setFormat] = createSignal("hsl");
  const [copied, setCopied] = createSignal("");

  function formatted(
    name: string,
    color: (typeof palettes)[number]["colors"][number]
  ) {
    switch (format()) {
      case "var": {
        return `var(--color-${name}-${color.scale})`;
      }

      case "class": {
        return `bg-${name}-${color.scale}`;
      }

      case "rgb": {
        return color.rgb;
      }

      case "hsl": {
        return color.hsl;
      }

      case "oklch": {
        return color.oklch.replaceAll(",", " ");
      }

      default: {
        return color.hex;
      }
    }
  }

  async function copyColor(
    name: string,
    color: (typeof palettes)[number]["colors"][number]
  ) {
    try {
      await navigator.clipboard.writeText(formatted(name, color));
      setCopied(`Copied ${name} ${color.scale}`);
    } catch {
      setCopied("Unable to copy. Use the displayed color value.");
    }
  }

  return (
    <main id="main-content" class="colors-page">
      <PageHeader
        title="Tailwind Colors in Every Format"
        description="The complete Tailwind color palette in HEX, RGB, HSL, CSS variables, and classes. Ready to copy and paste into your project."
      >
        <a class="primary-link" href="#colors">
          Browse Colors
        </a>
        <a class="secondary-link" href="/docs/theming">
          Documentation
        </a>
      </PageHeader>
      <div class="container-wrapper">
        <div class="colors-content container">
          <span role="status" class="sr-only">
            {copied()}
          </span>
          <nav class="color-nav sr-only" aria-label="Color palettes">
            <For each={palettes}>
              {(palette) => <a href={`#${palette.name}`}>{palette.name}</a>}
            </For>
          </nav>
          <section id="colors" class="color-palettes">
            <For each={palettes}>
              {(palette) => (
                <section id={palette.name} class="color-palette">
                  <div class="color-palette-header">
                    <h2>{palette.name}</h2>
                    <Select
                      aria-label={`Color format for ${palette.name}`}
                      value={format()}
                      onChange={(key) => {
                        if (key !== null) {
                          setFormat(String(key));
                        }
                      }}
                    >
                      <SelectTrigger class="color-format-selector" size="sm">
                        <span>Format:</span>
                        <span class="text-muted-foreground font-mono">
                          {format()}
                        </span>
                      </SelectTrigger>
                      <SelectContent placement="bottom end">
                        <SelectGroup>
                          <For each={formats}>
                            {(value) => (
                              <SelectItem id={value}>{value}</SelectItem>
                            )}
                          </For>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <div class="color-swatches">
                    <For each={palette.colors}>
                      {(color) => (
                        <button
                          type="button"
                          class="color-swatch"
                          aria-label={`Copy ${palette.name} ${color.scale}`}
                          title={formatted(palette.name, color)}
                          onClick={() => {
                            void copyColor(palette.name, color);
                          }}
                        >
                          <span
                            class="swatch-fill"
                            style={{ background: color.hex }}
                          />
                          <span class="color-name">
                            {palette.name}-{color.scale}
                          </span>
                          <span class="color-scale">{color.scale}</span>
                        </button>
                      )}
                    </For>
                  </div>
                </section>
              )}
            </For>
          </section>
        </div>
      </div>
    </main>
  );
}
