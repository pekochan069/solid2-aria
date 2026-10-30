import {
  createMemo,
  createSignal,
  For,
  onSettled,
  Show,
  Match,
  Switch,
} from "solid-js";

import { Button } from "#components/ui/button";
import { CheckIcon } from "#icons/runeicons/check";
import { CopyIcon } from "#icons/runeicons/copy";
import { XIcon } from "#icons/runeicons/x";

import { highlightCode, isShellLanguage, parseCode } from "./code-highlight";

export interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
}

export function CodeBlock(props: CodeBlockProps) {
  const [copyState, setCopyState] = createSignal<
    "idle" | "copying" | "copied" | "error"
  >("idle");

  let resetTimer: ReturnType<typeof setTimeout> | undefined;
  let disposed = false;

  const source = createMemo(() =>
    parseCode(props.code, props.language ?? "text", props.title)
  );

  const lines = createMemo(() =>
    highlightCode(source().code, source().language)
  );

  onSettled(() => () => {
    disposed = true;
    clearTimeout(resetTimer);
  });

  async function copyCode() {
    clearTimeout(resetTimer);
    setCopyState("copying");

    try {
      await navigator.clipboard.writeText(source().code);

      if (!disposed) {
        setCopyState("copied");
        resetTimer = setTimeout(() => {
          setCopyState("idle");
        }, 2000);
      }
    } catch {
      if (!disposed) {
        setCopyState("error");
      }
    }
  }

  return (
    <div class="code-block group/code-block">
      <Show when={source().title}>
        {(title) => (
          <div class="code-block-header">
            <span class="code-block-title">{title()}</span>
          </div>
        )}
      </Show>
      <div class="code-block-body">
        <Button
          aria-label="Copy code"
          class="code-block-copy"
          isDisabled={copyState() === "copying"}
          onClick={() => {
            void copyCode();
          }}
          type="button"
          size="icon"
        >
          {() => (
            <Switch>
              <Match when={copyState() === "idle"}>
                <CopyIcon />
                <span class="sr-only" role="status">
                  Copy code
                </span>
              </Match>
              <Match when={copyState() === "copying"}>
                <CopyIcon />
                <span class="sr-only" role="status">
                  Copying code
                </span>
              </Match>
              <Match when={copyState() === "copied"}>
                <CheckIcon class="text-catppuccin-green" />
                <span class="sr-only" role="status">
                  Code copied to clipboard.
                </span>
              </Match>
              <Match when={copyState() === "error"}>
                <XIcon class="text-catppuccin-red" />
                <span class="sr-only" role="status">
                  Copy failed. Select the code and copy it manually, or try
                  again.
                </span>
              </Match>
            </Switch>
          )}
        </Button>
        <pre
          aria-label={source().title ?? `${source().language} code`}
          tabindex={0}
        >
          <code data-language={source().language}>
            <For each={lines()}>
              {(line, index) => (
                <>
                  {index() > 0 ? "\n" : ""}
                  <span
                    class={[
                      "code-block-line",
                      {
                        "code-block-command":
                          isShellLanguage(source().language) &&
                          line.some((token) => token.content.trim() !== ""),
                      },
                    ]}
                  >
                    <For each={line}>
                      {(token) => (
                        <span class="code-block-token" style={token.htmlStyle}>
                          {token.content}
                        </span>
                      )}
                    </For>
                  </span>
                </>
              )}
            </For>
          </code>
        </pre>
      </div>
    </div>
  );
}
