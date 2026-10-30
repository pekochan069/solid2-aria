/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/ui/accordion.tsx.
 * Modified for Solid Aria: Solid 2 reactive props, native JSX, Solid Aria primitives, and Lucide icons.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

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

import { IconPlaceholder } from "../lib/icon-placeholder";

function Accordion(props: DisclosureGroupProps) {
  const rest = omit(props, "class");

  return (
    <AccordionPrimitive
      data-slot="accordion"
      class={cn("cn-accordion flex w-full flex-col", props.class)}
      {...rest}
    />
  );
}

function AccordionItem(props: DisclosureProps) {
  const rest = omit(props, "class");

  return (
    <AccordionItemPrimitive
      data-slot="accordion-item"
      class={cn("cn-accordion-item", props.class)}
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
          "cn-accordion-trigger group/accordion-trigger relative flex flex-1 items-start justify-between border border-transparent transition-all outline-none disabled:pointer-events-none disabled:opacity-50",
          props.class
        )}
        {...rest}
      >
        {props.children}
        <IconPlaceholder
          lucide="ChevronDownIcon"
          tabler="IconChevronDown"
          data-slot="accordion-trigger-icon"
          hugeicons="ArrowDown01Icon"
          phosphor="CaretDownIcon"
          remixicon="RiArrowDownSLine"
          class="cn-accordion-trigger-icon pointer-events-none shrink-0 group-aria-expanded/accordion-trigger:hidden"
        />
        <IconPlaceholder
          lucide="ChevronUpIcon"
          tabler="IconChevronUp"
          data-slot="accordion-trigger-icon"
          hugeicons="ArrowUp01Icon"
          phosphor="CaretUpIcon"
          remixicon="RiArrowUpSLine"
          class="cn-accordion-trigger-icon pointer-events-none hidden shrink-0 group-aria-expanded/accordion-trigger:inline"
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
      class="cn-accordion-content h-(--disclosure-panel-height) overflow-clip transition-[height]"
      {...rest}
    >
      {composeRenderProps(props.children, (content, state) => (
        <div
          class={cn(
            "cn-accordion-content-inner [&_a]:hover:text-foreground [&_a]:underline [&_a]:underline-offset-3 [&_p:not(:last-child)]:mb-4",
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
