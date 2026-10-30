/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/trace-tool-calls.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { TerminalIcon } from "@lucide/solid";
import { Switch, Match, createMemo, For } from "solid-js";

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
import type { DynamicToolUIPart, UIMessage } from "./_chat";

const chat = createChat()
  .user("Which package managers are installed?")
  .assistant(({ writer }) => {
    writer
      .tool("runCommand", {
        dynamic: true,
        input: { command: "node --version" },
      })
      .sleep(900)
      .output({ stdout: "v24.18.0" });
    writer
      .tool("runCommand", {
        dynamic: true,
        input: { command: "npm --version" },
      })
      .sleep(900)
      .output({ stdout: "11.6.2" });
    writer
      .tool("runCommand", {
        dynamic: true,
        input: { command: "pnpm --version" },
      })
      .sleep(900)
      .error("command not found: pnpm");
    writer.text("Node 24 and npm 11 are installed. pnpm is not.");
  });

const initialMessages = chat.get(0);
const transport = chat.transport({ delayMs: 20 });

function ToolTrace(componentProps: { part: DynamicToolUIPart; live: boolean }) {
  const command = createMemo(() => componentProps.part.input?.command);

  return (
    <Switch
      fallback={
        <>
          {componentProps.part.state === "output-denied" ? (
            <TraceLine>
              <TraceIcon>
                <TerminalIcon />
              </TraceIcon>
              <TraceTitle>Denied {command()}</TraceTitle>
            </TraceLine>
          ) : (
            <TraceLine status={componentProps.live ? "running" : "error"}>
              <TraceIcon>
                <TerminalIcon />
              </TraceIcon>
              <TraceTitle>
                {componentProps.live ? "Running" : "Failed to run"} {command()}
              </TraceTitle>
            </TraceLine>
          )}
        </>
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
            <TraceCollapsible>
              <TraceCollapsibleTrigger>
                <TraceLine status={failed() ? "error" : undefined}>
                  <TraceIcon>
                    <TerminalIcon />
                  </TraceIcon>
                  <TraceTitle>
                    {failed() ? "Failed to run" : "Ran"} {command()}
                  </TraceTitle>
                </TraceLine>
              </TraceCollapsibleTrigger>
              <TraceCollapsibleContent>
                <CodeBlock size="sm">
                  <CodeBlockContent wrap class="max-h-64">
                    {failed()
                      ? componentProps.part.errorText
                      : componentProps.part.output.stdout}
                  </CodeBlockContent>
                </CodeBlock>
              </TraceCollapsibleContent>
            </TraceCollapsible>
          );
        }}
      </Match>
    </Switch>
  );
}

function groupParts(parts: UIMessage["parts"]) {
  const runs: { trace: boolean; parts: UIMessage["parts"] }[] = [];

  for (const part of parts) {
    const trace = part.type === "dynamic-tool";

    if (!trace && part.type !== "text") {
      continue;
    }

    const last = runs.at(-1);

    if (last?.trace === trace) {
      last.parts.push(part);
    } else {
      runs.push({ parts: [part], trace });
    }
  }

  return runs;
}

export function TraceToolCalls() {
  const { messages, sendMessage, setMessages, status } = useChat({
    messages: initialMessages,
    transport,
  });

  const nextMessage = createMemo(() => chat.next(messages()));

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

            const live =
              status() === "streaming" && message === messages().at(-1);

            return (
              <Message>
                <MessageContent class="gap-4">
                  {
                    <For each={groupParts(message.parts)}>
                      {(run, _runIndex) =>
                        run.trace ? (
                          <Trace>
                            {
                              <For each={run.parts}>
                                {(part) =>
                                  part.type === "dynamic-tool" ? (
                                    <ToolTrace part={part} live={live} />
                                  ) : null
                                }
                              </For>
                            }
                          </Trace>
                        ) : (
                          <For each={run.parts}>
                            {(part, _index) =>
                              part.type === "text" ? <p>{part.text}</p> : null
                            }
                          </For>
                        )
                      }
                    </For>
                  }
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
            if (nextMessage()) {
              void sendMessage(nextMessage());
            } else {
              setMessages(initialMessages);
            }
          }}
        >
          {nextMessage() ? "Send message" : "Reset"}
        </Button>
      )}
    </div>
  );
}

export default TraceToolCalls;
