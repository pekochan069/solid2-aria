/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/components/callout.tsx and apps/v4/registry/new-york-v4/ui/alert.tsx.
 * Modified for Solid Aria: Solid 2 reactive props and local Alert components with the upstream documentation spacing.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import type { JSX } from "@solidjs/web";
import { cn } from "cn";
import { Show } from "solid-js";

import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

export function Callout(props: {
  children?: JSX.Element;
  class?: string;
  title?: string;
  icon?: JSX.Element;
  variant?: "default" | "info" | "warning";
}) {
  return (
    <Alert
      data-not-typeset
      data-variant={props.variant ?? "default"}
      class={cn(
        "not-typeset border-surface bg-surface text-surface-foreground mt-6 w-auto grid-cols-[0_1fr] gap-y-0.5 rounded-2xl px-4 py-3 has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] has-[>svg]:gap-x-3 md:-mx-1 **:[a]:font-medium **:[a]:underline **:[a]:decoration-current/30 **:[a]:hover:decoration-current **:[code]:border",
        props.class
      )}
    >
      {props.icon}
      <Show when={props.title}>
        <AlertTitle class="col-start-2 line-clamp-1 min-h-4 tracking-tight">
          {props.title}
        </AlertTitle>
      </Show>
      <AlertDescription class="text-card-foreground/80 col-start-2 grid justify-items-start gap-1 text-wrap md:text-wrap [&_p]:leading-relaxed">
        {props.children}
      </AlertDescription>
    </Alert>
  );
}
