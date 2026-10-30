/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/ui/message.tsx.
 * Modified for Solid Aria: Solid 2 reactive props, native JSX, Solid Aria primitives, and Lucide icons.
 * Generated for docs with nova styling from apps/v4/registry/styles/style-nova.css.
 * Maintained locally for the Solid Aria documentation site.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import type { ComponentProps } from "@solidjs/web";
import { merge, omit } from "solid-js";

import { cn } from "#lib/cn";

function MessageGroup(props: ComponentProps<"div">) {
  const rest = omit(props, "class");

  return (
    <div
      data-slot="message-group"
      class={cn("flex min-w-0 flex-col gap-2", props.class)}
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
        "group/message relative flex w-full min-w-0 gap-2 text-sm data-[align=end]:flex-row-reverse",
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
        "bg-muted flex w-fit min-w-8 shrink-0 items-center justify-center self-end overflow-hidden rounded-full group-has-data-[slot=message-footer]/message:-translate-y-8",
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
        "flex w-full min-w-0 flex-col gap-2.5 wrap-break-word group-data-[align=end]/message:*:data-slot:self-end",
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
        "text-muted-foreground flex max-w-full min-w-0 items-center px-3 text-xs font-medium group-has-data-[variant=ghost]/message:px-0",
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
        "text-muted-foreground flex max-w-full min-w-0 items-center px-3 text-xs font-medium group-has-data-[variant=ghost]/message:px-0 group-data-[align=end]/message:justify-end",
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
