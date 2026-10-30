/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/code-block-rtl.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { TerminalIcon } from "@lucide/solid";
import { For } from "solid-js";

import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockLine,
  CodeBlockTitle,
} from "../registry/ui/code-block";
import { useTranslation, useHighlightedCode } from "./_support";
import type { Translations } from "./_support";

const translations = {
  ar: {
    dir: "rtl",
    values: {
      description: "ثبّت الحزم، ثم شغّل خادم التطوير.",
      title: "الطرفية",
    },
  },
  en: {
    dir: "ltr",
    values: {
      description: "Install the packages, then start the dev server.",
      title: "Terminal",
    },
  },
  he: {
    dir: "rtl",
    values: {
      description: "התקן את החבילות, ואז הפעל את שרת הפיתוח.",
      title: "מסוף",
    },
  },
} satisfies Translations;

const code = `bun add @solid2-aria/components@^0.0.1
pnpm dev`;

export function CodeBlockRtl() {
  const { dir, t } = useTranslation(translations, "ar");

  const lines = useHighlightedCode(
    () => code,
    () => "bash"
  );

  return (
    <div class="flex w-full max-w-md flex-col gap-3 text-sm" dir={dir}>
      <p>{t.description}</p>
      <CodeBlock>
        <CodeBlockHeader>
          <CodeBlockTitle>
            <TerminalIcon />
            {t.title}
          </CodeBlockTitle>
          <CodeBlockActions>
            <CodeBlockCopyButton value={code} />
          </CodeBlockActions>
        </CodeBlockHeader>
        <CodeBlockContent lineNumbers>
          {
            <For each={lines()}>
              {(line, _index) => <CodeBlockLine>{line}</CodeBlockLine>}
            </For>
          }
        </CodeBlockContent>
      </CodeBlock>
    </div>
  );
}

export default CodeBlockRtl;
