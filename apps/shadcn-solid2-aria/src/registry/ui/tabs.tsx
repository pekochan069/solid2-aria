/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/ui/tabs.tsx.
 * Modified for Solid Aria: Solid 2 reactive props, native JSX, Solid Aria primitives, and Lucide icons.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import {
  TabList as TabListPrimitive,
  TabPanel as TabPanelPrimitive,
  Tab as TabPrimitive,
  Tabs as TabsPrimitive,
} from "@solid2-aria/components";
import type { ComponentProps } from "@solidjs/web";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import { cn } from "cn";
import { merge, omit } from "solid-js";

function Tabs(props: ComponentProps<typeof TabsPrimitive>) {
  const rest = omit(props, "class");

  return (
    <TabsPrimitive
      data-slot="tabs"
      class={cn(
        "cn-tabs group/tabs flex data-horizontal:flex-col",
        props.class
      )}
      {...rest}
    />
  );
}

const tabsListVariants = cva(
  "cn-tabs-list group/tabs-list text-muted-foreground inline-flex w-fit items-center justify-center group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col",
  {
    defaultVariants: {
      variant: "default",
    },
    variants: {
      variant: {
        default: "cn-tabs-list-variant-default bg-muted",
        line: "cn-tabs-list-variant-line gap-1 bg-transparent",
      },
    },
  }
);

function TabsList(
  props: ComponentProps<typeof TabListPrimitive> &
    VariantProps<typeof tabsListVariants>
) {
  const merged = merge({ variant: "default" } as const, props);
  const rest = omit(merged, "class", "variant");

  return (
    <TabListPrimitive
      data-slot="tabs-list"
      data-variant={merged.variant}
      class={cn(tabsListVariants({ variant: merged.variant }), merged.class)}
      {...rest}
    />
  );
}

function TabsTrigger(props: ComponentProps<typeof TabPrimitive>) {
  const rest = omit(props, "class");

  return (
    <TabPrimitive
      data-slot="tabs-trigger"
      class={cn(
        "cn-tabs-trigger cn-tabs-trigger-aria text-foreground/60 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:text-muted-foreground dark:hover:text-foreground relative inline-flex h-[calc(100%-1px)] flex-1 cursor-default items-center justify-center whitespace-nowrap transition-all group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        "group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-selected:bg-transparent dark:group-data-[variant=line]/tabs-list:data-selected:border-transparent dark:group-data-[variant=line]/tabs-list:data-selected:bg-transparent",
        "data-selected:bg-background data-selected:text-foreground dark:data-selected:border-input dark:data-selected:bg-input/30 dark:data-selected:text-foreground",
        "after:bg-foreground after:absolute after:opacity-0 after:transition-opacity group-data-horizontal/tabs:after:inset-x-0 group-data-horizontal/tabs:after:-bottom-1.25 group-data-horizontal/tabs:after:h-0.5 group-data-vertical/tabs:after:inset-y-0 group-data-vertical/tabs:after:-right-1 group-data-vertical/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-selected:after:opacity-100",
        props.class
      )}
      {...rest}
    />
  );
}

function TabsContent(props: ComponentProps<typeof TabPanelPrimitive>) {
  const rest = omit(props, "class");

  return (
    <TabPanelPrimitive
      data-slot="tabs-content"
      class={cn("cn-tabs-content flex-1 outline-none", props.class)}
      {...rest}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants };
