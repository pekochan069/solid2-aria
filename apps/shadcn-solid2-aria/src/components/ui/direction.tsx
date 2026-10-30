/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/ui/direction.tsx.
 * Modified for Solid Aria: Solid 2 reactive props, native JSX, Solid Aria primitives, and Lucide icons.
 * Generated for docs with nova styling from apps/v4/registry/styles/style-nova.css.
 * Regenerate with bun run generate:ui; local edits are replaced.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { I18nProvider, createLocale } from "@solid2-aria/components";
import type { ComponentProps } from "@solidjs/web";
import { omit } from "solid-js";

function DirectionProvider(
  props: ComponentProps<typeof I18nProvider> & {
    direction?: "ltr" | "rtl";
  }
) {
  const current = createLocale();
  const rest = omit(props, "direction");

  return (
    <I18nProvider
      {...rest}
      locale={
        props.locale ??
        (props.direction
          ? new Intl.Locale(current.locale, {
              script: props.direction === "rtl" ? "Arab" : "Latn",
            }).toString()
          : current.locale)
      }
    />
  );
}

function useDirection() {
  const locale = createLocale();

  return () => locale.direction;
}

export { DirectionProvider, useDirection };

export { I18nProvider, createLocale } from "@solid2-aria/components";
