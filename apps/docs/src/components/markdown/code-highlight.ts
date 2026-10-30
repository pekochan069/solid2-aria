import { createHighlighterCoreSync } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import bash from "shiki/langs/bash.mjs";
import css from "shiki/langs/css.mjs";
import html from "shiki/langs/html.mjs";
import javascript from "shiki/langs/javascript.mjs";
import json from "shiki/langs/json.mjs";
import jsx from "shiki/langs/jsx.mjs";
import markdown from "shiki/langs/markdown.mjs";
import tsx from "shiki/langs/tsx.mjs";
import typescript from "shiki/langs/typescript.mjs";
import yaml from "shiki/langs/yaml.mjs";
import light from "shiki/themes/catppuccin-latte.mjs";
import dark from "shiki/themes/catppuccin-macchiato.mjs";

const highlighter = createHighlighterCoreSync({
  engine: createJavaScriptRegexEngine(),
  langs: [
    bash,
    css,
    html,
    javascript,
    json,
    jsx,
    markdown,
    tsx,
    typescript,
    yaml,
  ],
  themes: [light, dark],
});

export function isShellLanguage(language: string) {
  return /^(?:sh|bash|shell|shellscript|zsh|console)$/iu.test(language);
}

export function parseCode(code: string, language: string, title?: string) {
  const normalized = code.replaceAll(/\r\n?/gu, "\n").replace(/\n$/u, "");
  const [firstLine = ""] = normalized.split("\n", 1);

  const comment =
    /^\s*(?:\/\/\s+(?<line>.+?)|\/\*\s*(?<block>.+?)\s*\*\/|#\s+(?<hash>.+?)|<!--\s*(?<html>.+?)\s*-->)\s*$/u.exec(
      firstLine
    );

  const filename = Object.values(comment?.groups ?? {})
    .find(Boolean)
    ?.trim();

  // Only filename-shaped comments are metadata; ordinary comments remain code.
  const hasFilename =
    filename !== undefined &&
    /^(?:[\w@.~-]+\/)*(?:[\w@~-]+(?:\.[\w.-]+)+|\.[\w.-]+|Dockerfile|Makefile)$/u.test(
      filename
    );

  return {
    code: hasFilename ? normalized.slice(firstLine.length + 1) : normalized,
    language: language.toLowerCase(),
    title: title ?? (hasFilename ? filename : undefined),
  };
}

export function highlightCode(code: string, language: string) {
  const lang = isShellLanguage(language) ? "bash" : language;

  return highlighter.codeToTokens(code, {
    defaultColor: false,
    lang: highlighter.getLoadedLanguages().includes(lang) ? lang : "text",
    themes: {
      dark: "catppuccin-macchiato",
      light: "catppuccin-latte",
    },
  }).tokens;
}
