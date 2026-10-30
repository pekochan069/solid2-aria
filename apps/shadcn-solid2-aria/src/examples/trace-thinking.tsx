/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/trace-thinking.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { BrainIcon } from "@lucide/solid";
import { createMemo, createSignal, For } from "solid-js";

import { Bubble, BubbleContent } from "../registry/ui/bubble";
import { Button } from "../registry/ui/button";
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

const chat = createChat()
  .user("Why is the checkout deploy so slow?")
  .assistant(({ writer }) => {
    writer.reasoning(
      "The build log shows install and compile finish in under a minute. Image optimization takes almost four, and it reruns on every deploy because the cache key includes the commit hash.",
      { delayMs: 60 }
    );
    writer.sleep(400);
    writer.text(
      "Image optimization is the bottleneck. Key its cache on the lockfile and the image directory instead of the commit hash."
    );
  });

const initialMessages = chat.get(0);
const transport = chat.transport({ delayMs: 20 });

function ThinkingTrace(componentProps: { text: string; running: boolean }) {
  const [open, setOpen] = createSignal<boolean>();

  const line = createMemo(() => (
    <TraceLine status={componentProps.running ? "running" : undefined}>
      <TraceIcon>
        <BrainIcon />
      </TraceIcon>
      <TraceTitle>{componentProps.running ? "Thinking" : "Thought"}</TraceTitle>
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

function groupParts(parts: UIMessage["parts"]) {
  const runs: { trace: boolean; parts: UIMessage["parts"] }[] = [];

  for (const part of parts) {
    const trace = part.type === "reasoning";

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

export function TraceThinking() {
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
                                {(part, _index) =>
                                  part.type === "reasoning" ? (
                                    <ThinkingTrace
                                      text={part.text}
                                      running={
                                        live && part.state === "streaming"
                                      }
                                    />
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

export default TraceThinking;
