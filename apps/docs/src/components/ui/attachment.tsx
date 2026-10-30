/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/ui/attachment.tsx.
 * Modified for Solid Aria: Solid 2 reactive props, native JSX, Solid Aria primitives, and Lucide icons.
 * Generated for docs with nova styling from apps/v4/registry/styles/style-nova.css.
 * Maintained locally for the Solid Aria documentation site.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import type { JSX, ComponentProps } from "@solidjs/web";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import { Show, merge, omit } from "solid-js";

import { cn } from "#lib/cn";

import { Button } from "./button";

const attachmentVariants = cva(
  "focus-within:ring-ring/50 group/attachment bg-card text-card-foreground has-[>a,>button]:hover:bg-muted/50 data-[state=error]:border-destructive/30 relative flex w-fit max-w-full min-w-0 shrink-0 flex-wrap rounded-xl border transition-colors focus-within:ring-1 data-[state=idle]:border-dashed",
  {
    variants: {
      orientation: {
        horizontal: "min-w-40 items-center",
        vertical: "w-24 flex-col has-data-[slot=attachment-content]:w-30",
      },
      size: {
        default:
          "gap-2 text-sm has-data-[slot=attachment-content]:px-2.5 has-data-[slot=attachment-content]:py-2 has-data-[slot=attachment-media]:p-2",
        sm: "gap-2.5 text-xs has-data-[slot=attachment-content]:px-2 has-data-[slot=attachment-content]:py-1.5 has-data-[slot=attachment-media]:p-1.5",
        xs: "gap-1.5 rounded-lg text-xs has-data-[slot=attachment-content]:px-1.5 has-data-[slot=attachment-content]:py-1 has-data-[slot=attachment-media]:p-1",
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
  "bg-muted text-foreground group-data-[state=error]/attachment:bg-destructive/10 group-data-[state=error]/attachment:text-destructive relative flex aspect-square w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg group-data-[orientation=vertical]/attachment:w-full group-data-[size=sm]/attachment:w-8 group-data-[size=xs]/attachment:w-7 group-data-[size=xs]/attachment:rounded-md group-data-[orientation=vertical]/attachment:*:data-[slot=spinner]:size-6! [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 group-data-[orientation=vertical]/attachment:[&_svg:not([class*='size-'])]:size-6 group-data-[size=xs]/attachment:[&_svg:not([class*='size-'])]:size-3.5",
  {
    defaultVariants: {
      variant: "icon",
    },
    variants: {
      variant: {
        icon: "",
        image:
          "opacity-60 group-data-[state=done]/attachment:opacity-100 group-data-[state=idle]/attachment:opacity-100 *:[img]:aspect-square *:[img]:w-full *:[img]:object-cover",
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
      class={cn(
        "max-w-full min-w-0 flex-1 leading-tight group-data-[orientation=vertical]/attachment:px-1",
        props.class
      )}
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
        "group-data-[state=processing]/attachment:shimmer group-data-[state=uploading]/attachment:shimmer block max-w-full min-w-0 truncate font-medium",
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
        "text-muted-foreground group-data-[state=error]/attachment:text-destructive/80 mt-0.5 block min-w-0 truncate text-xs",
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
        "relative z-20 flex shrink-0 items-center group-data-[orientation=vertical]/attachment:absolute group-data-[orientation=vertical]/attachment:top-3 group-data-[orientation=vertical]/attachment:right-3 group-data-[orientation=vertical]/attachment:gap-1",
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
      class={cn("", merged.class)}
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
          class={cn("absolute inset-0 z-10 outline-none", props.class)}
        >
          {props.children}
        </button>
      }
    >
      {(render) => {
        const renderProps = merge(() => ({
          ...rest,
          children: props.children,
          class: cn("absolute inset-0 z-10 outline-none", props.class),
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
        "scroll-fade-x flex min-w-0 snap-x snap-mandatory scroll-px-1 scrollbar-none gap-3 overflow-x-auto overscroll-x-contain py-1 *:data-[slot=attachment]:flex-none *:data-[slot=attachment]:snap-start",
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
