/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/components/code-block-command.tsx.
 * Modified for Solid Aria: client-mounted Solid 2 command tabs, shared package manager selection, local syntax highlighting, and clipboard controls.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { CheckIcon, CopyIcon, TerminalIcon } from "@lucide/solid";
import type { JSX } from "@solidjs/web";
import { ClientOnly } from "@tanstack/solid-router";
import { createHighlighterCoreSync } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import bash from "shiki/langs/bash.mjs";
import css from "shiki/langs/css.mjs";
import html from "shiki/langs/html.mjs";
import json from "shiki/langs/json.mjs";
import tsx from "shiki/langs/tsx.mjs";
import typescript from "shiki/langs/typescript.mjs";
import light from "shiki/themes/github-light-default.mjs";
import dark from "shiki/themes/vesper.mjs";
import {
  createMemo,
  createSignal,
  For,
  onSettled,
  Show,
  useContext,
} from "solid-js";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../registry/ui/tabs";
import type { PackageManagerCommands } from "./package-manager";
import {
  getPackageManagerCommands,
  PackageManagerContext,
  packageManagers,
} from "./package-manager";

const highlighter = createHighlighterCoreSync({
  engine: createJavaScriptRegexEngine(),
  langs: [bash, css, json, tsx, typescript, html],
  themes: [light, dark],
});

export function CopyButton(props: { value: string | (() => Promise<string>) }) {
  const [status, setStatus] = createSignal("Copy");
  let timer: ReturnType<typeof setTimeout> | undefined;
  onSettled(() => () => {
    clearTimeout(timer);
  });

  async function copy() {
    try {
      const value =
        typeof props.value === "function" ? await props.value() : props.value;

      await navigator.clipboard.writeText(value);
      setStatus("Copied");
    } catch {
      setStatus("Unable to copy");
    }

    clearTimeout(timer);
    timer = setTimeout(() => {
      setStatus("Copy");
    }, 2000);
  }

  return (
    <button
      type="button"
      class="copy-button"
      onClick={() => {
        void copy();
      }}
      aria-label={status()}
      title={status()}
    >
      {status() === "Copied" ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
      <span class="sr-only" aria-live="polite">
        {status()}
      </span>
    </button>
  );
}

export interface CodeBlockProps {
  code: string;
  title?: string;
  titleIcon?: JSX.Element;
  language?: string;
  showLineNumbers?: boolean;
}

function CommandCode(props: { commands: PackageManagerCommands }) {
  const { selected, select } = useContext(PackageManagerContext);

  return (
    <figure
      class="docs-code docs-command"
      data-not-typeset
      data-language="bash"
    >
      <TerminalIcon class="docs-command-icon" size={16} />
      <CopyButton value={props.commands[selected()]} />
      <ClientOnly
        fallback={
          <pre tabindex="0">
            <code>{props.commands[selected()]}</code>
          </pre>
        }
      >
        <Tabs
          selectedKey={selected()}
          onSelectionChange={(key) => {
            const value = packageManagers.find((manager) => manager === key);

            if (value) {
              select(value);
            }
          }}
        >
          <TabsList aria-label="Package manager">
            <For each={packageManagers}>
              {(manager) => <TabsTrigger id={manager}>{manager}</TabsTrigger>}
            </For>
          </TabsList>
          <For each={packageManagers}>
            {(manager) => (
              <TabsContent id={manager}>
                <pre tabindex="0">
                  <code>{props.commands[manager]}</code>
                </pre>
              </TabsContent>
            )}
          </For>
        </Tabs>
      </ClientOnly>
    </figure>
  );
}

export function Code(props: CodeBlockProps) {
  const language = () => {
    const requested =
      props.language ??
      (props.title === "Terminal" ? "bash" : props.title?.split(".").at(-1)) ??
      "tsx";

    return /^(?:sh|shell|shellscript|zsh)$/u.test(requested)
      ? "bash"
      : requested;
  };

  const commands = createMemo(() =>
    language() === "bash" ? getPackageManagerCommands(props.code) : undefined
  );

  const tokens = createMemo(
    () =>
      highlighter.codeToTokens(props.code, {
        defaultColor: false,
        lang: highlighter.getLoadedLanguages().includes(language())
          ? language()
          : "text",
        themes: { dark: "vesper", light: "github-light-default" },
      }).tokens
  );

  return (
    <Show
      when={commands()}
      fallback={
        <figure class="docs-code" data-not-typeset data-language={language()}>
          <div class="docs-code-header">
            <Show
              when={language() === "bash"}
              fallback={
                <Show when={props.title} fallback={<span>{language()}</span>}>
                  {(title) => (
                    <figcaption>
                      {props.titleIcon}
                      <span>{title()}</span>
                    </figcaption>
                  )}
                </Show>
              }
            >
              <div class="code-terminal-label">
                <TerminalIcon size={16} />
                <span>Terminal</span>
              </div>
            </Show>
            <CopyButton value={props.code} />
          </div>
          <pre tabindex="0">
            <code
              data-line-numbers={
                props.showLineNumbers === true ? "" : undefined
              }
            >
              <For each={tokens()}>
                {(line, index) => (
                  <>
                    {index() > 0 ? "\n" : ""}
                    <span data-line>
                      <For each={line}>
                        {(token) => (
                          <span style={token.htmlStyle}>{token.content}</span>
                        )}
                      </For>
                    </span>
                  </>
                )}
              </For>
            </code>
          </pre>
        </figure>
      }
    >
      {(value) => <CommandCode commands={value()} />}
    </Show>
  );
}

export { Code as CodeBlock };
