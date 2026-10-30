/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/blocks/preview/cards/style-overview.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { createMemo, For } from "solid-js";

import { Card, CardContent } from "../../../registry/ui/card";
import { STYLES, FONTS, useDesignSystemSearchParams } from "../../_config";

export function StyleOverview() {
  const [params] = useDesignSystemSearchParams();

  const currentFont = createMemo(() =>
    FONTS.find((font) => font.value === params.font)
  );

  const currentFontHeading = createMemo(() =>
    FONTS.find((font) => font.value === params.fontHeading)
  );

  const currentStyle = createMemo(() =>
    STYLES.find((style) => style.name === params.style)
  );

  return (
    <Card>
      <CardContent class="style-lyra:gap-4 style-mira:gap-4 flex flex-col gap-6">
        <div class="flex flex-col gap-1">
          <div class="cn-font-heading style-lyra:text-lg style-mira:text-lg style-sera:text-lg style-sera:font-semibold style-sera:tracking-wide style-sera:uppercase text-2xl font-medium">
            {currentStyle()?.title} -{" "}
            {Boolean(currentFontHeading()?.name) &&
            currentFontHeading()?.name !== currentFont()?.name
              ? currentFontHeading()?.name
              : currentFont()?.name}
          </div>
          <div class="text-muted-foreground style-lyra:text-sm style-mira:text-sm style-sera:text-sm style-sera:leading-relaxed line-clamp-2 text-base">
            Designers love packing quirky glyphs into test phrases. This is a
            preview of the typography styles.
          </div>
        </div>
        <div class="grid grid-cols-6 gap-3">
          {
            <For
              each={[
                "--background",
                "--foreground",
                "--primary",
                "--secondary",
                "--muted",
                "--accent",
                "--border",
                "--chart-1",
                "--chart-2",
                "--chart-3",
                "--chart-4",
                "--chart-5",
              ]}
            >
              {(variant) => (
                <div class="flex flex-col flex-wrap items-center gap-2">
                  <div
                    class="after:border-border style-sera:rounded-none style-sera:after:rounded-none relative aspect-square w-full rounded-lg bg-(--color) after:absolute after:inset-0 after:rounded-lg after:border after:mix-blend-darken dark:after:mix-blend-lighten"
                    style={{
                      "--color": `var(${variant})`,
                    }}
                  />
                  <div class="style-lyra:max-w-10 style-mira:max-w-10 hidden max-w-14 truncate font-mono text-[0.60rem] md:block">
                    {variant}
                  </div>
                </div>
              )}
            </For>
          }
        </div>
      </CardContent>
    </Card>
  );
}

export default StyleOverview;
