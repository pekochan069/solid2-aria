/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/trace-demo.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import {
  ArrowUpRightIcon,
  CircleAlertIcon,
  CircleCheckIcon,
  GlobeIcon,
  LoaderCircleIcon,
} from "@lucide/solid";
import { Switch, Match, createMemo, createSignal, For } from "solid-js";

import { Bubble, BubbleContent } from "../registry/ui/bubble";
import { Button } from "../registry/ui/button";
import { CodeBlock, CodeBlockContent } from "../registry/ui/code-block";
import { Message, MessageContent } from "../registry/ui/message";
import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceIcon,
  TraceLine,
  TraceTitle,
} from "../registry/ui/trace";
import { useChat, createChat, getMessageText } from "./_chat";
import type { UIMessage } from "./_chat";

type ChatMessage = UIMessage;

type Part = ChatMessage["parts"][number];

const chat = createChat()
  .user("Why does pnpm install fail in CI?")
  .assistant(({ writer }) => {
    writer.reasoning(
      "CI installs with a frozen lockfile, so the install stops when package.json and pnpm-lock.yaml disagree. I should check what the last commit changed, then reproduce the install.",
      { delayMs: 40 }
    );
    writer
      .tool("runCommand", { input: { command: "pnpm --version" } })
      .sleep(700)
      .output({ stdout: "10.18.0" });
    writer
      .tool("runCommand", {
        input: {
          command: "git diff --stat HEAD~1 -- package.json pnpm-lock.yaml",
        },
      })
      .sleep(900)
      .output({
        stdout:
          " package.json | 2 +-\n 1 file changed, 1 insertion(+), 1 deletion(-)",
      });
    writer
      .tool("runCommand", {
        input: { command: "pnpm install --frozen-lockfile" },
      })
      .sleep(1200)
      .error(
        'ERR_PNPM_OUTDATED_LOCKFILE  Cannot install with "frozen-lockfile" because pnpm-lock.yaml is not up to date with package.json'
      );
    writer.sourceUrl({
      title: "pnpm install | pnpm.io",
      url: "https://pnpm.io/cli/install#--frozen-lockfile",
    });
    writer.sourceUrl({
      title: "Continuous Integration | pnpm.io",
      url: "https://pnpm.io/continuous-integration",
    });
    writer.sleep(1000);
    writer.text(
      "The last commit bumped a version in package.json without updating pnpm-lock.yaml, so the frozen install fails. Run pnpm install locally and commit the lockfile."
    );
  });

const transcript = chat.get();
const [question] = chat.get(1);
const transport = chat.transport({ delayMs: 20 });

function ThinkingRow(componentProps: { text: string; running: boolean }) {
  const [open, setOpen] = createSignal<boolean>();

  const line = createMemo(() => (
    <TraceLine status={componentProps.running ? "running" : undefined}>
      <TraceIcon>
        {componentProps.running ? (
          <LoaderCircleIcon class="animate-spin" />
        ) : (
          <CircleCheckIcon />
        )}
      </TraceIcon>
      <TraceTitle>
        {componentProps.running ? "Thinking" : "Thought for 5s"}
      </TraceTitle>
    </TraceLine>
  ));

  return (
    <>
      {componentProps.text.length === 0 ? (
        line()
      ) : (
        <TraceCollapsible
          isExpanded={open() ?? componentProps.running}
          onExpandedChange={(value) => {
            setOpen(value);
          }}
        >
          <TraceCollapsibleTrigger>{line()}</TraceCollapsibleTrigger>
          <TraceCollapsibleContent class="whitespace-pre-wrap">
            {componentProps.text}
          </TraceCollapsibleContent>
        </TraceCollapsible>
      )}
    </>
  );
}

function ToolRow(componentProps: {
  part: Extract<Part, { type: "tool-runCommand" }>;
  streaming: boolean;
  defaultOpen?: boolean;
}) {
  const command = createMemo(() => componentProps.part.input?.command);

  return (
    <Switch
      fallback={
        <TraceLine status={componentProps.streaming ? "running" : "error"}>
          <TraceIcon>
            {componentProps.streaming ? (
              <LoaderCircleIcon class="animate-spin" />
            ) : (
              <CircleAlertIcon />
            )}
          </TraceIcon>
          <TraceTitle>
            {componentProps.streaming ? "Running" : "Failed to run"} {command()}
          </TraceTitle>
        </TraceLine>
      }
    >
      <Match
        when={
          componentProps.part.state === "output-available" ||
          componentProps.part.state === "output-error"
        }
      >
        {() => {
          const failed = createMemo(
            () => componentProps.part.state === "output-error"
          );

          return (
            <TraceCollapsible defaultExpanded={componentProps.defaultOpen}>
              <TraceCollapsibleTrigger>
                <TraceLine status={failed() ? "error" : undefined}>
                  <TraceIcon>
                    {failed() ? <CircleAlertIcon /> : <CircleCheckIcon />}
                  </TraceIcon>
                  <TraceTitle>
                    {failed() ? "Failed to run" : "Ran"} {command()}
                  </TraceTitle>
                </TraceLine>
              </TraceCollapsibleTrigger>
              <TraceCollapsibleContent>
                {failed() ? (
                  <CodeBlock size="sm" variant="destructive">
                    <CodeBlockContent wrap class="max-h-64">
                      {componentProps.part.errorText}
                    </CodeBlockContent>
                  </CodeBlock>
                ) : (
                  <CodeBlock size="sm">
                    <CodeBlockContent wrap class="max-h-64">
                      {componentProps.part.output.stdout}
                    </CodeBlockContent>
                  </CodeBlock>
                )}
              </TraceCollapsibleContent>
            </TraceCollapsible>
          );
        }}
      </Match>
    </Switch>
  );
}

function SourcesRow(componentProps: {
  sources: Extract<Part, { type: "source-url" }>[];
  running: boolean;
}) {
  return (
    <TraceCollapsible>
      <TraceCollapsibleTrigger>
        <TraceLine status={componentProps.running ? "running" : undefined}>
          <TraceIcon>
            {componentProps.running ? (
              <LoaderCircleIcon class="animate-spin" />
            ) : (
              <GlobeIcon />
            )}
          </TraceIcon>
          <TraceTitle>
            {componentProps.running ? "Using" : "Used"}{" "}
            {componentProps.sources.length} sources
          </TraceTitle>
        </TraceLine>
      </TraceCollapsibleTrigger>
      <TraceCollapsibleContent>
        <Trace>
          {
            <For each={componentProps.sources}>
              {(source) => (
                <a href={source.url} target="_blank" rel="noreferrer">
                  <TraceLine>
                    <TraceIcon>
                      <GlobeIcon />
                    </TraceIcon>
                    <TraceTitle>
                      {source.title ?? new URL(source.url).hostname}
                      <span class="sr-only"> (opens in a new tab)</span>
                    </TraceTitle>
                    <TraceIcon>
                      <ArrowUpRightIcon />
                    </TraceIcon>
                  </TraceLine>
                </a>
              )}
            </For>
          }
        </Trace>
      </TraceCollapsibleContent>
    </TraceCollapsible>
  );
}

export function TraceDemo() {
  const { messages, sendMessage, setMessages, status } = useChat({
    messages: transcript,
    transport,
  });

  const busy = createMemo(
    () => status() === "submitted" || status() === "streaming"
  );

  return (
    <div class="flex min-h-72 w-full max-w-sm flex-col gap-4 py-6 text-sm">
      {
        <For each={messages()}>
          {(message) => {
            if (message.role === "user") {
              return (
                <Message align="end">
                  <MessageContent>
                    <Bubble align="end" variant="muted">
                      <BubbleContent>{getMessageText(message)}</BubbleContent>
                    </Bubble>
                  </MessageContent>
                </Message>
              );
            }

            const streaming = () => busy() && message === messages().at(-1);

            const rows = message.parts.filter(
              (part) =>
                part.type === "reasoning" || part.type === "tool-runCommand"
            );

            const sources = message.parts.filter(
              (part) => part.type === "source-url"
            );

            const text = getMessageText(message);

            return (
              <Message>
                <MessageContent class="gap-4">
                  {rows.length + sources.length > 0 && (
                    <Trace>
                      {
                        <For each={rows}>
                          {(part, index) => (
                            <Switch fallback={null}>
                              <Match
                                when={
                                  part.type === "reasoning" && "text" in part
                                    ? part
                                    : false
                                }
                              >
                                {(reasoning) => (
                                  <ThinkingRow
                                    text={reasoning().text}
                                    running={
                                      streaming() &&
                                      reasoning().state === "streaming"
                                    }
                                  />
                                )}
                              </Match>
                              <Match
                                when={
                                  part.type === "tool-runCommand" ? part : false
                                }
                              >
                                {(tool) => (
                                  <ToolRow
                                    part={tool()}
                                    streaming={streaming()}
                                    defaultOpen={index() === 2}
                                  />
                                )}
                              </Match>
                            </Switch>
                          )}
                        </For>
                      }
                      {sources.length > 0 && (
                        <SourcesRow
                          sources={sources}
                          running={streaming() && text.length === 0}
                        />
                      )}
                    </Trace>
                  )}
                  {text && <p>{text}</p>}
                </MessageContent>
              </Message>
            );
          }}
        </For>
      }
      {!busy() && (
        <Button
          variant="outline"
          size="sm"
          class="mt-auto self-start"
          onPress={() => {
            setMessages([]);
            void sendMessage(question);
          }}
        >
          Replay
        </Button>
      )}
    </div>
  );
}

export default TraceDemo;
