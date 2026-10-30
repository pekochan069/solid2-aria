/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/ui/field.tsx.
 * Modified for Solid Aria: Solid 2 reactive props, native JSX, Solid Aria primitives, and Lucide icons.
 * Generated for docs with nova styling from apps/v4/registry/styles/style-nova.css.
 * Maintained locally for the Solid Aria documentation site.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import type { JSX, ComponentProps } from "@solidjs/web";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import { Show, createMemo, merge, omit, For } from "solid-js";

import { cn } from "#lib/cn";

import { Label } from "./label";
import { Separator } from "./separator";

function FieldSet(props: ComponentProps<"fieldset">) {
  const rest = omit(props, "class");

  return (
    <fieldset
      data-slot="field-set"
      class={cn(
        "flex flex-col gap-4 has-[>[data-slot=checkbox-group]]:gap-3 has-[>[data-slot=radio-group]]:gap-3",
        props.class
      )}
      {...rest}
    />
  );
}

function FieldLegend(
  props: ComponentProps<"legend"> & {
    variant?: "legend" | "label";
  }
) {
  const merged = merge({ variant: "legend" } as const, props);
  const rest = omit(merged, "class", "variant");

  return (
    <legend
      data-slot="field-legend"
      data-variant={merged.variant}
      class={cn(
        "mb-1.5 font-medium data-[variant=label]:text-sm data-[variant=legend]:text-base",
        merged.class
      )}
      {...rest}
    />
  );
}

function FieldGroup(props: ComponentProps<"div">) {
  const rest = omit(props, "class");

  return (
    <div
      data-slot="field-group"
      class={cn(
        "group/field-group @container/field-group flex w-full flex-col gap-5 data-[slot=checkbox-group]:gap-3 *:data-[slot=field-group]:gap-4",
        props.class
      )}
      {...rest}
    />
  );
}

const fieldVariants = cva(
  "data-[invalid=true]:text-destructive group/field flex w-full gap-2",
  {
    defaultVariants: {
      orientation: "vertical",
    },
    variants: {
      orientation: {
        horizontal:
          "flex-row items-center has-[>[data-slot=field-content]]:items-start *:data-[slot=field-label]:flex-auto has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
        responsive:
          "flex-col *:w-full @md/field-group:flex-row @md/field-group:items-center @md/field-group:*:w-auto @md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:*:data-[slot=field-label]:flex-auto [&>.sr-only]:w-auto @md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
        vertical: "flex-col *:w-full [&>.sr-only]:w-auto",
      },
    },
  }
);

function Field(
  props: ComponentProps<"div"> & VariantProps<typeof fieldVariants>
) {
  const merged = merge({ orientation: "vertical" } as const, props);
  const rest = omit(merged, "class", "orientation");

  return (
    <div
      role="group"
      data-slot="field"
      data-orientation={merged.orientation}
      class={cn(
        fieldVariants({ orientation: merged.orientation }),
        merged.class
      )}
      {...rest}
    />
  );
}

function FieldContent(props: ComponentProps<"div">) {
  const rest = omit(props, "class");

  return (
    <div
      data-slot="field-content"
      class={cn(
        "group/field-content flex flex-1 flex-col gap-0.5 leading-snug",
        props.class
      )}
      {...rest}
    />
  );
}

function FieldLabel(props: ComponentProps<typeof Label>) {
  const rest = omit(props, "class");

  return (
    <Label
      data-slot="field-label"
      class={cn(
        "has-data-checked:bg-primary/5 has-data-checked:border-primary/30 dark:has-data-checked:border-primary/20 dark:has-data-checked:bg-primary/10 has-[>[data-slot=field]]:not-has-[:disabled,[data-disabled]]:hover:bg-muted/50 has-[>[data-slot=field]]:has-[:focus-visible]:border-ring has-[>[data-slot=field]]:has-[:focus-visible]:ring-ring/50 has-data-selected:bg-primary/5 has-data-selected:border-primary/30 dark:has-data-selected:border-primary/20 dark:has-data-selected:bg-primary/10 group/field-label peer/field-label flex w-fit gap-2 leading-snug group-data-[disabled=true]/field:opacity-50 has-[>[data-slot=field]]:rounded-lg has-[>[data-slot=field]]:border has-[>[data-slot=field]]:has-[:focus-visible]:ring-3 *:data-[slot=field]:p-2.5",
        "has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col",
        props.class
      )}
      {...rest}
    />
  );
}

function FieldTitle(props: ComponentProps<"div">) {
  const rest = omit(props, "class");

  return (
    <div
      data-slot="field-label"
      class={cn(
        "flex w-fit items-center gap-2 text-sm leading-snug font-medium group-data-[disabled=true]/field:opacity-50",
        props.class
      )}
      {...rest}
    />
  );
}

function FieldDescription(props: ComponentProps<"p">) {
  const rest = omit(props, "class");

  return (
    <p
      data-slot="field-description"
      class={cn(
        "text-muted-foreground text-left text-sm leading-normal font-normal group-has-data-horizontal/field:text-balance [[data-variant=legend]+&]:-mt-1.5",
        "last:mt-0 nth-last-2:-mt-1",
        "[&>a:hover]:text-primary [&>a]:underline [&>a]:underline-offset-4",
        props.class
      )}
      {...rest}
    />
  );
}

function FieldSeparator(
  props: ComponentProps<"div"> & {
    children?: JSX.Element;
  }
) {
  const rest = omit(props, "children", "class");

  return (
    <div
      data-slot="field-separator"
      data-content={Boolean(props.children)}
      class={cn(
        "relative -my-2 h-5 text-sm group-data-[variant=outline]/field-group:-mb-2",
        props.class
      )}
      {...rest}
    >
      <Separator class="absolute inset-0 top-1/2" />
      {Boolean(props.children) && (
        <span
          class="text-muted-foreground bg-background relative mx-auto block w-fit px-2"
          data-slot="field-separator-content"
        >
          {props.children}
        </span>
      )}
    </div>
  );
}

function FieldError(
  props: ComponentProps<"div"> & {
    errors?: (
      | {
          message?: string;
        }
      | undefined
    )[];
  }
) {
  const rest = omit(props, "class", "children", "errors");

  const content = createMemo(() => {
    const hasChildren = Boolean(props.children);

    if (hasChildren) {
      return props.children;
    }

    if ((props.errors?.length ?? 0) === 0) {
      return null;
    }

    const uniqueErrors = [
      ...new Map(
        props.errors?.map((error) => [error?.message, error])
      ).values(),
    ];

    if (uniqueErrors.length === 1) {
      return uniqueErrors[0]?.message;
    }

    return (
      <ul class="ml-4 flex list-disc flex-col gap-1">
        <For each={uniqueErrors}>
          {(error) => Boolean(error?.message) && <li>{error?.message}</li>}
        </For>
      </ul>
    );
  });

  return (
    <Show when={content()}>
      <div
        role="alert"
        data-slot="field-error"
        class={cn("text-destructive text-sm font-normal", props.class)}
        {...rest}
      >
        {content()}
      </div>
    </Show>
  );
}

export {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldContent,
  FieldTitle,
};
