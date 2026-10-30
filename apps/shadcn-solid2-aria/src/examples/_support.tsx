import type { ComponentProps, JSX } from "@solidjs/web";
import { createHighlighterCoreSync } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import bash from "shiki/langs/bash.mjs";
import css from "shiki/langs/css.mjs";
import html from "shiki/langs/html.mjs";
import json from "shiki/langs/json.mjs";
import python from "shiki/langs/python.mjs";
import tsx from "shiki/langs/tsx.mjs";
import typescript from "shiki/langs/typescript.mjs";
import light from "shiki/themes/github-light-default.mjs";
import dark from "shiki/themes/vesper.mjs";
import { createMemo, createSignal, onSettled, omit } from "solid-js";

const highlighter = createHighlighterCoreSync({
  engine: createJavaScriptRegexEngine(),
  langs: [bash, css, json, tsx, typescript, html, python],
  themes: [light, dark],
});

export type Translations<T = Record<string, string>> = Record<
  string,
  { dir: "ltr" | "rtl"; values: T }
>;

export function useTranslation<T>(
  translations: Translations<T>,
  language: string
) {
  const translation = translations[language] ?? translations.en;

  if (!translation) {
    throw new Error(`Missing translation: ${language}`);
  }

  return {
    dir: translation.dir,
    language,
    locale: language,
    t: translation.values,
  };
}

export function Image(
  props: ComponentProps<"img"> & {
    fill?: boolean;
    priority?: boolean;
    quality?: number;
  }
) {
  const rest = omit(props, "fill", "priority", "quality");

  return (
    <img
      {...rest}
      loading={props.priority === true ? "eager" : "lazy"}
      style={
        props.fill === true
          ? {
              height: "100%",
              inset: 0,
              "object-fit": "cover",
              position: "absolute",
              width: "100%",
            }
          : undefined
      }
    />
  );
}

export function Link(props: ComponentProps<"a">) {
  return <a {...props} />;
}

export function Fragment(props: { children?: JSX.Element }) {
  return <>{props.children}</>;
}

export function useHighlightedCode(code: () => string, language: () => string) {
  return createMemo(() => {
    const lang = language();

    const result = highlighter.codeToTokens(code(), {
      defaultColor: false,
      lang: highlighter.getLoadedLanguages().includes(lang) ? lang : "text",
      themes: { dark: "vesper", light: "github-light-default" },
    });

    return result.tokens.map((line) =>
      line.map((token) => <span style={token.htmlStyle}>{token.content}</span>)
    );
  });
}

export function useMediaQuery(query: string) {
  const [matches, setMatches] = createSignal(false);
  onSettled(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const change = () => {
      setMatches(media.matches);
    };

    media.addEventListener("change", change);

    return () => {
      media.removeEventListener("change", change);
    };
  });

  return matches;
}

export function useIsMobile() {
  return useMediaQuery("(max-width: 767px)");
}

export function useCopyToClipboard() {
  const [isCopied, setIsCopied] = createSignal(false);
  let timer: ReturnType<typeof setTimeout> | undefined;
  onSettled(() => () => {
    clearTimeout(timer);
  });

  const copyToClipboard = async (value: string) => {
    await navigator.clipboard.writeText(value);
    setIsCopied(true);
    clearTimeout(timer);
    timer = setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  return { copyToClipboard, isCopied };
}

export type Language = "en" | "ar" | "he";

export const REGEXP_ONLY_DIGITS = "^[0-9]+$";
export const REGEXP_ONLY_DIGITS_AND_CHARS = "^[a-zA-Z0-9]+$";

export function TextareaAutosize(
  props: ComponentProps<"textarea"> & { minRows?: number; maxRows?: number }
) {
  const rest = omit(props, "minRows", "maxRows");

  return (
    <textarea
      {...rest}
      rows={props.minRows ?? 2}
      onInput={(event) => {
        event.currentTarget.style.height = "auto";
        event.currentTarget.style.height = `${event.currentTarget.scrollHeight}px`;
      }}
    />
  );
}

export { Markdown } from "./_markdown";

export type QuestionnaireItemStatus = "unanswered" | "answered" | "skipped";
