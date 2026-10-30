/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/ui/attachment.tsx.
 * Modified for Solid Aria: Solid 2 reactive props, native JSX, Solid Aria primitives, and Lucide icons.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import type { JSX, ComponentProps } from "@solidjs/web";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import { cn } from "cn";
import { Show, merge, omit } from "solid-js";

import { Button } from "./button";

const attachmentVariants = cva(
  "cn-attachment group/attachment bg-card text-card-foreground has-[>a,>button]:hover:bg-muted/50 data-[state=error]:border-destructive/30 relative flex max-w-full min-w-0 shrink-0 flex-wrap border transition-colors data-[state=idle]:border-dashed",
  {
    variants: {
      orientation: {
        horizontal: "cn-attachment-orientation-horizontal items-center",
        vertical: "cn-attachment-orientation-vertical flex-col",
      },
      size: {
        default: "cn-attachment-size-default",
        sm: "cn-attachment-size-sm",
        xs: "cn-attachment-size-xs",
      },
    },
  }
);

function Attachment(
  props: ComponentProps<"div"> &
    VariantProps<typeof attachmentVariants> & {
      state?: "idle" | "uploading" | "processing" | "error" | "done";
    }
) {
  const merged = merge(
    { orientation: "horizontal", size: "default", state: "done" } as const,
    props
  );

  const rest = omit(merged, "class", "state", "size", "orientation");
  const resolvedOrientation = () => merged.orientation ?? "horizontal";

  return (
    <div
      data-slot="attachment"
      data-state={merged.state}
      data-size={merged.size}
      data-orientation={resolvedOrientation()}
      class={cn(
        attachmentVariants({
          orientation: merged.orientation,
          size: merged.size,
        }),
        merged.class
      )}
      {...rest}
    />
  );
}

const attachmentMediaVariants = cva(
  "cn-attachment-media group-data-[state=error]/attachment:bg-destructive/10 group-data-[state=error]/attachment:text-destructive relative flex aspect-square shrink-0 items-center justify-center overflow-hidden [&_svg]:pointer-events-none",
  {
    defaultVariants: {
      variant: "icon",
    },
    variants: {
      variant: {
        icon: "cn-attachment-media-variant-icon",
        image:
          "cn-attachment-media-variant-image *:[img]:aspect-square *:[img]:w-full *:[img]:object-cover",
      },
    },
  }
);

function AttachmentMedia(
  props: ComponentProps<"div"> & VariantProps<typeof attachmentMediaVariants>
) {
  const merged = merge({ variant: "icon" } as const, props);
  const rest = omit(merged, "class", "variant");

  return (
    <div
      data-slot="attachment-media"
      data-variant={merged.variant}
      class={cn(
        attachmentMediaVariants({ variant: merged.variant }),
        merged.class
      )}
      {...rest}
    />
  );
}

function AttachmentContent(props: ComponentProps<"div">) {
  const rest = omit(props, "class");

  return (
    <div
      data-slot="attachment-content"
      class={cn("cn-attachment-content max-w-full min-w-0 flex-1", props.class)}
      {...rest}
    />
  );
}

function AttachmentTitle(props: ComponentProps<"span">) {
  const rest = omit(props, "class");

  return (
    <span
      data-slot="attachment-title"
      class={cn(
        "cn-attachment-title group-data-[state=processing]/attachment:shimmer group-data-[state=uploading]/attachment:shimmer block max-w-full min-w-0 truncate",
        props.class
      )}
      {...rest}
    />
  );
}

function AttachmentDescription(props: ComponentProps<"span">) {
  const rest = omit(props, "class");

  return (
    <span
      data-slot="attachment-description"
      class={cn(
        "cn-attachment-description text-muted-foreground group-data-[state=error]/attachment:text-destructive/80 block min-w-0 truncate",
        "max-w-full",
        props.class
      )}
      {...rest}
    />
  );
}

function AttachmentActions(props: ComponentProps<"div">) {
  const rest = omit(props, "class");

  return (
    <div
      data-slot="attachment-actions"
      class={cn(
        "cn-attachment-actions flex shrink-0 items-center",
        props.class
      )}
      {...rest}
    />
  );
}

function AttachmentAction(props: ComponentProps<typeof Button>) {
  const merged = merge({ size: "icon-xs" } as const, props);
  const rest = omit(merged, "class", "variant", "size");

  return (
    <Button
      data-slot="attachment-action"
      variant={merged.variant ?? "ghost"}
      size={merged.size}
      class={cn("cn-attachment-action", merged.class)}
      {...rest}
    />
  );
}

function AttachmentTrigger(
  props: ComponentProps<"button"> & {
    render?: (props: JSX.IntrinsicElements["button"]) => JSX.Element;
  }
) {
  const rest = omit(props, "class", "render", "type", "children");

  return (
    <Show
      when={props.render}
      fallback={
        <button
          {...rest}
          type={props.type ?? "button"}
          data-slot="attachment-trigger"
          class={cn(
            "cn-attachment-trigger absolute inset-0 z-10 outline-none",
            props.class
          )}
        >
          {props.children}
        </button>
      }
    >
      {(render) => {
        const renderProps = merge(() => ({
          ...rest,
          children: props.children,
          class: cn(
            "cn-attachment-trigger absolute inset-0 z-10 outline-none",
            props.class
          ),
          "data-slot": "attachment-trigger",
        }));

        return <>{render()(renderProps)}</>;
      }}
    </Show>
  );
}

function AttachmentGroup(props: ComponentProps<"div">) {
  const rest = omit(props, "class");

  return (
    <div
      data-slot="attachment-group"
      class={cn(
        "cn-attachment-group scroll-fade-x flex min-w-0 snap-x snap-mandatory scrollbar-none overflow-x-auto overscroll-x-contain *:data-[slot=attachment]:flex-none *:data-[slot=attachment]:snap-start",
        props.class
      )}
      {...rest}
    />
  );
}

export {
  Attachment,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentContent,
  AttachmentTitle,
  AttachmentDescription,
  AttachmentActions,
  AttachmentAction,
  AttachmentTrigger,
};
