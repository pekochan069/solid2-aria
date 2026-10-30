/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/ui/trace.tsx.
 * Modified for Solid Aria: Solid 2 reactive props, native JSX, Solid Aria primitives, and Lucide icons.
 * Generated for docs with nova styling from apps/v4/registry/styles/style-nova.css.
 * Regenerate with bun run generate:ui; local edits are replaced.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { ChevronRightIcon } from "@lucide/solid";
import { Button as ButtonPrimitive } from "@solid2-aria/components";
import type { ButtonProps } from "@solid2-aria/components";
import type { JSX, ComponentProps } from "@solidjs/web";
import { cn } from "cn";
import { omit } from "solid-js";

import { Collapsible, CollapsibleContent } from "./collapsible";

function Trace(props: ComponentProps<"div">) {
  const rest = omit(props, "class");

  return (
    <div
      data-slot="trace"
      class={cn(
        "*:has-[>[data-slot=trace-line]]:focus-visible:ring-ring/50 flex w-full min-w-0 flex-col gap-2 *:has-[>[data-slot=trace-line]]:flex *:has-[>[data-slot=trace-line]]:w-fit *:has-[>[data-slot=trace-line]]:max-w-full *:has-[>[data-slot=trace-line]]:min-w-0 *:has-[>[data-slot=trace-line]]:rounded-md *:has-[>[data-slot=trace-line]]:text-left *:has-[>[data-slot=trace-line]]:outline-none *:has-[>[data-slot=trace-line]]:focus-visible:ring-3",
        props.class
      )}
      {...rest}
    />
  );
}

function TraceLine(
  props: ComponentProps<"span"> & {
    status?: "running" | "error" | "pending";
  }
) {
  const rest = omit(props, "class", "status");

  return (
    <span
      data-slot="trace-line"
      data-status={props.status}
      class={cn(
        "text-muted-foreground in-[a:hover,button:hover]:text-foreground data-[status=error]:text-destructive data-[status=error]:in-[a:hover,button:hover]:text-destructive data-[status=running]:*:data-[slot=trace-title]:shimmer flex w-fit max-w-full min-w-0 items-center gap-2 text-sm transition-colors in-[a,button]:cursor-pointer data-[status=pending]:opacity-60",
        props.class
      )}
      {...rest}
    />
  );
}

function TraceIcon(props: ComponentProps<"span">) {
  const rest = omit(props, "class");

  return (
    <span
      data-slot="trace-icon"
      aria-hidden="true"
      class={cn(
        "flex size-4 shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [[data-slot=trace-title]~&]:-ml-1",
        props.class
      )}
      {...rest}
    />
  );
}

function TraceTitle(props: ComponentProps<"span">) {
  const rest = omit(props, "class");

  return (
    <span
      data-slot="trace-title"
      class={cn("motion-reduce:shimmer-none min-w-0 truncate", props.class)}
      {...rest}
    />
  );
}

function TraceDescription(props: ComponentProps<"span">) {
  const rest = omit(props, "class");

  return (
    <span
      data-slot="trace-description"
      class={cn("text-muted-foreground/70 shrink-0 tabular-nums", props.class)}
      {...rest}
    />
  );
}

function TraceCollapsible(
  props: Omit<ComponentProps<typeof Collapsible>, "isExpanded" | "class"> &
    (
      | {
          isExpanded?: undefined;
        }
      | {
          isExpanded: boolean;
          onExpandedChange: NonNullable<
            ComponentProps<typeof Collapsible>["onExpandedChange"]
          >;
        }
    ) & {
      class?: string;
    }
) {
  const rest = omit(props, "class");

  return (
    <Collapsible
      data-slot="trace-collapsible"
      class={cn("flex w-full min-w-0 flex-col", props.class)}
      {...rest}
    />
  );
}

function TraceCollapsibleTrigger(
  props: Omit<ButtonProps, "class" | "children" | "slot"> & {
    class?: string;
    children?: JSX.Element;
  }
) {
  const rest = omit(props, "class", "children");

  return (
    <ButtonPrimitive
      slot="trigger"
      {...rest}
      data-slot="trace-collapsible-trigger"
      class={cn(
        "focus-visible:ring-ring/50 group/trace-collapsible-trigger text-muted-foreground hover:text-foreground has-data-[status=error]:text-destructive flex w-fit max-w-full min-w-0 cursor-pointer items-center gap-1 rounded-md text-left transition-colors outline-none focus-visible:ring-3",
        props.class
      )}
    >
      {props.children}
      <TraceIcon class="transition-transform group-aria-expanded/trace-collapsible-trigger:rotate-90">
        <ChevronRightIcon />
      </TraceIcon>
    </ButtonPrimitive>
  );
}

function TraceCollapsibleContent(
  props: Omit<
    ComponentProps<typeof CollapsibleContent>,
    "class" | "children"
  > & {
    class?: string;
    children?: JSX.Element;
  }
) {
  const rest = omit(props, "class", "children");

  return (
    <CollapsibleContent
      data-slot="trace-collapsible-content"
      class="h-(--disclosure-panel-height) min-w-0 overflow-clip transition-[height] duration-200"
      {...rest}
    >
      <div
        data-slot="trace-collapsible-content-inner"
        class={cn(
          "text-muted-foreground mt-2 mb-1 ml-[calc(--spacing(2)-1px)] min-w-0 border-l pr-1 pl-4 leading-relaxed wrap-break-word",
          props.class
        )}
      >
        {props.children}
      </div>
    </CollapsibleContent>
  );
}

export {
  Trace,
  TraceLine,
  TraceIcon,
  TraceTitle,
  TraceDescription,
  TraceCollapsible,
  TraceCollapsibleTrigger,
  TraceCollapsibleContent,
};
