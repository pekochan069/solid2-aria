/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/components/message-animated.tsx and apps/v4/lib/message-animations.ts.
 * Modified for Solid Aria: native Web Animations, Solid 2 message state, and a local scripted conversation transport.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { createEffect, createSignal, onSettled, For } from "solid-js";

import { Bubble, BubbleContent } from "../registry/ui/bubble";
import { Message, MessageContent } from "../registry/ui/message";
import { MessageScrollerItem } from "../registry/ui/message-scroller";

type ToolState =
  | "input-streaming"
  | "input-available"
  | "output-available"
  | "output-error"
  | "output-denied";

export interface DynamicToolUIPart {
  type: "dynamic-tool";
  toolName: string;
  toolCallId: string;
  input?: { command: string };
  output: { stdout: string };
  errorText?: string;
  state: ToolState;
}

type CommandPart = Omit<DynamicToolUIPart, "type"> & {
  type: "tool-runCommand";
};

interface TextPart {
  type: "text" | "reasoning";
  text: string;
  state?: "streaming" | "done";
}

interface SourcePart {
  type: "source-url";
  sourceId: string;
  url: string;
  title?: string;
}

export interface UIMessage {
  id: string;
  role: "user" | "assistant";
  parts: (TextPart | CommandPart | DynamicToolUIPart | SourcePart)[];
}

export function getMessageText(message: Pick<UIMessage, "parts"> | undefined) {
  return (
    message?.parts
      .map((part) => (part.type === "text" ? part.text : ""))
      .join("") ?? ""
  );
}

class Writer {
  parts: UIMessage["parts"] = [];
  text(text: string, _options?: { delayMs?: number }) {
    this.parts.push({ state: "done", text, type: "text" });

    return this;
  }
  reasoning(text: string, _options?: { delayMs?: number }) {
    this.parts.push({ state: "done", text, type: "reasoning" });

    return this;
  }
  sleep(_duration: number) {
    return this;
  }
  sourceUrl(source: { url: string; title?: string }) {
    this.parts.push({
      sourceId: `source-${this.parts.length}`,
      type: "source-url",
      ...source,
    });

    return this;
  }
  tool(
    name: string,
    options: { dynamic?: boolean; input: { command: string } }
  ) {
    const part: DynamicToolUIPart | CommandPart = {
      input: options.input,
      output: { stdout: "" },
      state: "input-available",
      toolCallId: `tool-${this.parts.length}`,
      toolName: name,
      type: options.dynamic === true ? "dynamic-tool" : "tool-runCommand",
    };

    this.parts.push(part);

    const result = {
      error: (errorText: string) => {
        part.errorText = errorText;
        part.state = "output-error";

        return result;
      },
      output: (output: { stdout: string }) => {
        part.output = output;
        part.state = "output-available";

        return result;
      },
      sleep: (_duration: number) => result,
    };

    return result;
  }
}

export function createChat() {
  const transcript: UIMessage[] = [];

  const builder = {
    assistant(value: string | ((context: { writer: Writer }) => void)) {
      const writer = new Writer();

      if (typeof value === "string") {
        writer.text(value);
      } else {
        value({ writer });
      }

      transcript.push({
        id: `message-${transcript.length}`,
        parts: writer.parts,
        role: "assistant",
      });

      return builder;
    },
    get(count?: number) {
      return structuredClone(
        count === undefined ? transcript : transcript.slice(0, count)
      );
    },
    next(messages: UIMessage[]) {
      return transcript.find(
        (message, index) => index >= messages.length && message.role === "user"
      );
    },
    sleep(_duration: number) {
      return builder;
    },
    transport(options?: { delayMs?: number }) {
      return { delayMs: options?.delayMs ?? 20, transcript };
    },
    user(text: string, options?: { id?: string }) {
      transcript.push({
        id: options?.id ?? `message-${transcript.length}`,
        parts: [{ text, type: "text" }],
        role: "user",
      });

      return builder;
    },
  };

  return builder;
}

export function useChat(options: {
  messages?: UIMessage[];
  transport: { transcript: UIMessage[]; delayMs: number };
}) {
  let currentMessages = options.messages ?? [];
  const [messages, writeMessages] = createSignal<UIMessage[]>(currentMessages);

  const [status, setStatus] = createSignal<"ready" | "submitted" | "streaming">(
    "ready"
  );

  let generation = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  onSettled(() => () => {
    generation += 1;
    clearTimeout(timer);
  });

  function setMessages(
    value: UIMessage[] | ((previous: UIMessage[]) => UIMessage[])
  ) {
    generation += 1;
    clearTimeout(timer);
    currentMessages =
      typeof value === "function" ? value(currentMessages) : value;
    writeMessages(currentMessages);
    setStatus("ready");
  }

  // oxlint-disable-next-line eslint/require-await -- The demo transport keeps the async send API while scheduling streamed updates with timers.
  async function sendMessage(value: UIMessage | { text: string } | undefined) {
    if (!value) {
      return;
    }

    generation += 1;
    const run = generation;

    const user: UIMessage =
      "parts" in value
        ? value
        : {
            id: `user-${Date.now()}`,
            parts: [{ text: value.text, type: "text" }],
            role: "user",
          };

    const before = currentMessages;
    currentMessages = [...before, user];
    writeMessages(currentMessages);
    setStatus("submitted");

    const sourceIndex = options.transport.transcript.findIndex(
      (item) => item.id === user.id
    );

    const assistant = options.transport.transcript[sourceIndex + 1];

    if (!assistant || assistant.role !== "assistant") {
      setStatus("ready");

      return;
    }

    const final = structuredClone(assistant);

    const lengths = final.parts.map((part) =>
      "text" in part ? part.text.length : 0
    );

    let length = 0;
    const total = Math.max(1, ...lengths);

    const tick = () => {
      if (run !== generation) {
        return;
      }

      length += 8;

      const partial = {
        ...final,
        parts: final.parts.map((part) =>
          "text" in part
            ? {
                ...part,
                state:
                  length >= part.text.length
                    ? ("done" as const)
                    : ("streaming" as const),
                text: part.text.slice(0, length),
              }
            : part
        ),
      };

      currentMessages = [...before, user, partial];
      writeMessages(currentMessages);
      setStatus(length >= total ? "ready" : "streaming");

      if (length < total) {
        timer = setTimeout(tick, options.transport.delayMs);
      }
    };

    timer = setTimeout(tick, options.transport.delayMs);
  }

  return { messages, sendMessage, setMessages, status };
}

export const MESSAGE_ANIMATIONS = {
  "blur-fade": {
    duration: 280,
    id: "blur-fade",
    initial: { filter: "blur(4px)", opacity: 0, transform: "translateY(6px)" },
    name: "Blur Fade",
  },
  fade: { duration: 220, id: "fade", initial: { opacity: 0 }, name: "Fade" },
  pop: {
    duration: 280,
    id: "pop",
    initial: { opacity: 0, transform: "translateY(6px) scale(.94)" },
    name: "Pop",
  },
  "scale-fade": {
    duration: 240,
    id: "scale-fade",
    initial: { opacity: 0, transform: "scale(.98)" },
    name: "Scale Fade",
  },
  "slide-side": {
    duration: 280,
    id: "slide-side",
    initial: { opacity: 0, transform: "translateX(18px)" },
    name: "Slide Side",
  },
  "slide-up": {
    duration: 260,
    id: "slide-up",
    initial: { opacity: 0, transform: "translateY(10px)" },
    name: "Slide Up",
  },
  "spring-bounce": {
    duration: 320,
    id: "spring-bounce",
    initial: { opacity: 0, transform: "translateY(12px) scale(.96)" },
    name: "Spring Bounce",
  },
} as const;

export type MessageAnimationId = keyof typeof MESSAGE_ANIMATIONS;

type MessageAnimationPreset = (typeof MESSAGE_ANIMATIONS)[MessageAnimationId];

export function getMessageAnimation(id: MessageAnimationId) {
  return MESSAGE_ANIMATIONS[id];
}

export function MessageAnimated(props: {
  message: UIMessage | { id: string; role: "user" | "assistant"; text: string };
  scrollAnchor?: boolean;
  userVariant?: "default" | "muted" | "tinted" | "ghost";
  assistantVariant?: "default" | "muted" | "tinted" | "ghost";
  animationPreset?: MessageAnimationPreset;
}) {
  let element: HTMLDivElement | undefined;
  createEffect(
    () => ({
      id: props.message.id,
      preset: props.animationPreset ?? MESSAGE_ANIMATIONS["slide-up"],
      role: props.message.role,
    }),
    ({ role, preset }) => {
      if (
        role !== "user" ||
        !element ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        return;
      }

      const animation = element.animate(
        [preset.initial, { filter: "none", opacity: 1, transform: "none" }],
        { duration: preset.duration, easing: "cubic-bezier(.16,1,.3,1)" }
      );

      // oxlint-disable-next-line typescript/consistent-return -- Setup returns cleanup only when the observed element exists.
      return () => {
        animation.cancel();
      };
    }
  );

  const text = () =>
    "text" in props.message
      ? props.message.text
      : getMessageText(props.message);

  return (
    <MessageScrollerItem
      ref={(node) => {
        element = node;
      }}
      id={props.message.id}
      scrollAnchor={props.scrollAnchor ?? props.message.role === "user"}
    >
      <Message align={props.message.role === "user" ? "end" : "start"}>
        <MessageContent>
          <Bubble
            variant={
              props.message.role === "user"
                ? (props.userVariant ?? "muted")
                : (props.assistantVariant ?? "ghost")
            }
          >
            <BubbleContent class="space-y-2">
              <For each={text().split(/\n\s*\n/u)}>
                {(paragraph) => <p class="whitespace-pre-wrap">{paragraph}</p>}
              </For>
            </BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
    </MessageScrollerItem>
  );
}
