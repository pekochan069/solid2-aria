/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/kbd-rtl.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { Kbd, KbdGroup } from "../registry/ui/kbd";
import { useTranslation } from "./_support";
import type { Translations } from "./_support";

const translations = {
  ar: {
    dir: "rtl",
    values: {},
  },
  en: {
    dir: "ltr",
    values: {},
  },
  he: {
    dir: "rtl",
    values: {},
  },
} satisfies Translations;

export function KbdRtl() {
  const { dir } = useTranslation(translations, "ar");

  return (
    <div class="flex flex-col items-center gap-4" dir={dir}>
      <KbdGroup>
        <Kbd>⌘</Kbd>
        <Kbd>⇧</Kbd>
        <Kbd>⌥</Kbd>
        <Kbd>⌃</Kbd>
      </KbdGroup>
      <KbdGroup>
        <Kbd>Ctrl</Kbd>
        <span>+</span>
        <Kbd>B</Kbd>
      </KbdGroup>
    </div>
  );
}

export default KbdRtl;
