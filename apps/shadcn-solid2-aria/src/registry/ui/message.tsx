/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/ui/message.tsx.
 * Modified for Solid Aria: Solid 2 reactive props, native JSX, Solid Aria primitives, and Lucide icons.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import type { ComponentProps } from "@solidjs/web";
import { cn } from "cn";
import { merge, omit } from "solid-js";

function MessageGroup(props: ComponentProps<"div">) {
  const rest = omit(props, "class");

  return (
    <div
      data-slot="message-group"
      class={cn("cn-message-group flex min-w-0 flex-col", props.class)}
      {...rest}
    />
  );
}

function Message(
  props: ComponentProps<"div"> & {
    align?: "start" | "end";
  }
) {
  const merged = merge({ align: "start" } as const, props);
  const rest = omit(merged, "class", "align");

  return (
    <div
      data-slot="message"
      data-align={merged.align}
      class={cn(
        "cn-message group/message relative flex w-full min-w-0 data-[align=end]:flex-row-reverse",
        merged.class
      )}
      {...rest}
    />
  );
}

function MessageAvatar(props: ComponentProps<"div">) {
  const rest = omit(props, "class");

  return (
    <div
      data-slot="message-avatar"
      class={cn(
        "cn-message-avatar bg-muted flex w-fit shrink-0 items-center justify-center self-end overflow-hidden rounded-full",
        props.class
      )}
      {...rest}
    />
  );
}

function MessageContent(props: ComponentProps<"div">) {
  const rest = omit(props, "class");

  return (
    <div
      data-slot="message-content"
      class={cn(
        "cn-message-content flex w-full min-w-0 flex-col wrap-break-word",
        props.class
      )}
      {...rest}
    />
  );
}

function MessageHeader(props: ComponentProps<"div">) {
  const rest = omit(props, "class");

  return (
    <div
      data-slot="message-header"
      class={cn(
        "cn-message-header flex max-w-full min-w-0 items-center",
        props.class
      )}
      {...rest}
    />
  );
}

function MessageFooter(props: ComponentProps<"div">) {
  const rest = omit(props, "class");

  return (
    <div
      data-slot="message-footer"
      class={cn(
        "cn-message-footer flex max-w-full min-w-0 items-center group-data-[align=end]/message:justify-end",
        props.class
      )}
      {...rest}
    />
  );
}

export {
  MessageGroup,
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageHeader,
};
