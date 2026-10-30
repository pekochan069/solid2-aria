/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/ui/accordion.tsx.
 * Modified for Solid Aria: Solid 2 reactive props, native JSX, Solid Aria primitives, and Lucide icons.
 * Generated for docs with nova styling from apps/v4/registry/styles/style-nova.css.
 * Regenerate with bun run generate:ui; local edits are replaced.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { ChevronDownIcon, ChevronUpIcon } from "@lucide/solid";
import {
  DisclosurePanel as AccordionContentPrimitive,
  Heading as AccordionHeaderPrimitive,
  Disclosure as AccordionItemPrimitive,
  DisclosureGroup as AccordionPrimitive,
  Button as AccordionTriggerPrimitive,
  composeRenderProps,
} from "@solid2-aria/components";
import type {
  ButtonProps,
  DisclosureGroupProps,
  DisclosurePanelProps,
  DisclosureProps,
} from "@solid2-aria/components";
import type { JSX } from "@solidjs/web";
import { cn } from "cn";
import { omit } from "solid-js";

function Accordion(props: DisclosureGroupProps) {
  const rest = omit(props, "class");

  return (
    <AccordionPrimitive
      data-slot="accordion"
      class={cn("flex w-full flex-col", props.class)}
      {...rest}
    />
  );
}

function AccordionItem(props: DisclosureProps) {
  const rest = omit(props, "class");

  return (
    <AccordionItemPrimitive
      data-slot="accordion-item"
      class={cn("not-last:border-b", props.class)}
      {...rest}
    />
  );
}

function AccordionTrigger(
  props: Omit<ButtonProps, "children"> & {
    children: JSX.Element;
  }
) {
  const rest = omit(props, "class", "children");

  return (
    <AccordionHeaderPrimitive class="flex">
      <AccordionTriggerPrimitive
        slot="trigger"
        data-slot="accordion-trigger"
        class={cn(
          "focus-visible:ring-ring/50 focus-visible:border-ring focus-visible:after:border-ring **:data-[slot=accordion-trigger-icon]:text-muted-foreground group/accordion-trigger relative flex flex-1 items-start justify-between rounded-lg border border-transparent py-2.5 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:ring-3 disabled:pointer-events-none disabled:opacity-50 **:data-[slot=accordion-trigger-icon]:ml-auto **:data-[slot=accordion-trigger-icon]:size-4",
          props.class
        )}
        {...rest}
      >
        {props.children}
        <ChevronDownIcon
          data-slot="accordion-trigger-icon"
          class="pointer-events-none shrink-0 group-aria-expanded/accordion-trigger:hidden"
        />
        <ChevronUpIcon
          data-slot="accordion-trigger-icon"
          class="pointer-events-none hidden shrink-0 group-aria-expanded/accordion-trigger:inline"
        />
      </AccordionTriggerPrimitive>
    </AccordionHeaderPrimitive>
  );
}

function AccordionContent(props: DisclosurePanelProps) {
  const rest = omit(props, "class", "children");

  return (
    <AccordionContentPrimitive
      data-slot="accordion-content"
      class="data-open:animate-accordion-down data-closed:animate-accordion-up h-(--disclosure-panel-height) overflow-clip text-sm transition-[height]"
      {...rest}
    >
      {composeRenderProps(props.children, (content, state) => (
        <div
          class={cn(
            "[&_a]:hover:text-foreground pt-0 pb-2.5 [&_a]:underline [&_a]:underline-offset-3 [&_p:not(:last-child)]:mb-4",
            typeof props.class === "function"
              ? props.class({ ...state, defaultClass: undefined })
              : props.class
          )}
        >
          {content}
        </div>
      ))}
    </AccordionContentPrimitive>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
