/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/ui/trace.tsx.
 * Modified for Solid Aria: Solid 2 reactive props, native JSX, Solid Aria primitives, and Lucide icons.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { Button as ButtonPrimitive } from "@solid2-aria/components";
import type { ButtonProps } from "@solid2-aria/components";
import type { JSX, ComponentProps } from "@solidjs/web";
import { cn } from "cn";
import { omit } from "solid-js";

import { IconPlaceholder } from "../lib/icon-placeholder";
import { Collapsible, CollapsibleContent } from "./collapsible";

function Trace(props: ComponentProps<"div">) {
  const rest = omit(props, "class");

  return (
    <div
      data-slot="trace"
      class={cn(
        "cn-trace flex w-full min-w-0 flex-col *:has-[>[data-slot=trace-line]]:flex *:has-[>[data-slot=trace-line]]:w-fit *:has-[>[data-slot=trace-line]]:max-w-full *:has-[>[data-slot=trace-line]]:min-w-0 *:has-[>[data-slot=trace-line]]:text-left *:has-[>[data-slot=trace-line]]:outline-none",
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
        "cn-trace-line text-muted-foreground in-[a:hover,button:hover]:text-foreground data-[status=error]:text-destructive data-[status=error]:in-[a:hover,button:hover]:text-destructive data-[status=running]:*:data-[slot=trace-title]:shimmer flex w-fit max-w-full min-w-0 items-center transition-colors in-[a,button]:cursor-pointer data-[status=pending]:opacity-60",
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
        "cn-trace-icon flex shrink-0 items-center justify-center [&_svg]:pointer-events-none",
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
      class={cn(
        "cn-trace-title motion-reduce:shimmer-none min-w-0 truncate",
        props.class
      )}
      {...rest}
    />
  );
}

function TraceDescription(props: ComponentProps<"span">) {
  const rest = omit(props, "class");

  return (
    <span
      data-slot="trace-description"
      class={cn(
        "cn-trace-description text-muted-foreground/70 shrink-0 tabular-nums",
        props.class
      )}
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
      class={cn(
        "cn-trace-collapsible flex w-full min-w-0 flex-col",
        props.class
      )}
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
        "cn-trace-collapsible-trigger group/trace-collapsible-trigger text-muted-foreground hover:text-foreground has-data-[status=error]:text-destructive flex w-fit max-w-full min-w-0 cursor-pointer items-center text-left transition-colors outline-none",
        props.class
      )}
    >
      {props.children}
      <TraceIcon class="transition-transform group-aria-expanded/trace-collapsible-trigger:rotate-90">
        <IconPlaceholder
          lucide="ChevronRightIcon"
          tabler="IconChevronRight"
          hugeicons="ArrowRight01Icon"
          phosphor="CaretRightIcon"
          remixicon="RiArrowRightSLine"
        />
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
      class="cn-trace-collapsible-content h-(--disclosure-panel-height) min-w-0 overflow-clip transition-[height]"
      {...rest}
    >
      <div
        data-slot="trace-collapsible-content-inner"
        class={cn(
          "cn-trace-collapsible-content-inner text-muted-foreground min-w-0 wrap-break-word",
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
