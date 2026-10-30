/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/components/language-selector.tsx.
 * Modified for Solid Aria: Solid 2 language context and a local Aria Select for the supported Arabic and Hebrew previews.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import type { JSX } from "@solidjs/web";
import { createContext, createSignal, useContext } from "solid-js";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../registry/ui/select";

type Language = "ar" | "he";

const Context = createContext<{
  language: Language;
  setLanguage: (language: Language) => void;
}>();

export function LanguageProvider(props: { children: JSX.Element }) {
  const [language, setLanguage] = createSignal<Language>("ar");

  const context = {
    get language() {
      return language();
    },
    setLanguage,
  };

  return <Context value={context}>{props.children}</Context>;
}

export function useLanguageContext() {
  return useContext(Context);
}

export function LanguageSelector() {
  const context = useLanguageContext();

  return (
    <Select
      class="rtl-language-selector"
      dir="ltr"
      aria-label="Language"
      value={context.language}
      onChange={(value) => {
        if (value === "ar" || value === "he") {
          context.setLanguage(value);
        }
      }}
    >
      <SelectTrigger size="sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent dir="ltr">
        <SelectItem id="ar">
          <span data-lang="ar">Arabic (العربية)</span>
        </SelectItem>
        <SelectItem id="he">
          <span data-lang="he">Hebrew (עברית)</span>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
