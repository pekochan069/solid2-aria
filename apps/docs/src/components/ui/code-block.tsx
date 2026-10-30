/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/ui/code-block.tsx.
 * Modified for Solid Aria: Solid 2 reactive props, native JSX, Solid Aria primitives, and Lucide icons.
 * Generated for docs with nova styling from apps/v4/registry/styles/style-nova.css.
 * Maintained locally for the Solid Aria documentation site.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { CheckIcon, CopyIcon } from "@lucide/solid";
import type { ComponentProps, JSX } from "@solidjs/web";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import { createSignal, createEffect, merge, omit } from "solid-js";

import { cn } from "#lib/cn";

import { Button } from "./button";

const codeBlockVariants = cva(
  "has-[>[data-slot=code-block-content]:focus-visible]:ring-ring/50 group/code-block relative flex w-full min-w-0 flex-col overflow-hidden rounded-lg text-sm has-[>[data-slot=code-block-content]:focus-visible]:ring-3 data-[size=sm]:text-xs",
  {
    defaultVariants: {
      variant: "default",
    },
    variants: {
      variant: {
        default:
          "border-input text-foreground dark:bg-input/30 has-[>[data-slot=code-block-content]:focus-visible]:border-ring border",
        destructive:
          "border-destructive/30 text-destructive dark:border-destructive/40 border",
      },
    },
  }
);

function CodeBlock(
  props: ComponentProps<"div"> &
    VariantProps<typeof codeBlockVariants> & {
      size?: "default" | "sm";
    }
) {
  const merged = merge({ size: "default", variant: "default" } as const, props);

  const rest = omit(merged, "class", "variant", "size");

  return (
    <div
      data-slot="code-block"
      data-variant={merged.variant}
      data-size={merged.size}
      class={cn(codeBlockVariants({ variant: merged.variant }), merged.class)}
      {...rest}
    />
  );
}

function CodeBlockHeader(props: ComponentProps<"div">) {
  const rest = omit(props, "class");

  return (
    <div
      data-slot="code-block-header"
      class={cn(
        "text-muted-foreground group-data-[variant=destructive]/code-block:text-destructive flex min-w-0 shrink-0 items-center gap-2 px-3 pt-3 group-data-[size=sm]/code-block:px-2.5 group-data-[size=sm]/code-block:pt-2.5 *:has-[>[data-slot=code-block-title]]:min-w-0",
        props.class
      )}
      {...rest}
    />
  );
}

function CodeBlockTitle(props: ComponentProps<"div">) {
  const rest = omit(props, "class");

  return (
    <div
      data-slot="code-block-title"
      class={cn(
        "text-foreground group-data-[variant=destructive]/code-block:text-destructive min-w-0 truncate font-sans text-sm font-medium group-data-[size=sm]/code-block:text-xs [&_svg]:pointer-events-none [&_svg]:inline-block [&_svg]:align-middle [&_svg:not([class*='size-'])]:size-3.5 *:[svg]:me-1.5",
        props.class
      )}
      {...rest}
    />
  );
}

function CodeBlockActions(props: ComponentProps<"div">) {
  const rest = omit(props, "class");

  return (
    <div
      data-slot="code-block-actions"
      class={cn(
        "[[data-slot=code-block]>&]:*:[button]:bg-background [[data-slot=code-block]>&]:*:[button]:ring-foreground/10 -my-1 ms-auto -me-1.5 flex shrink-0 items-center gap-1 [[data-slot=code-block]>&]:absolute [[data-slot=code-block]>&]:end-2 [[data-slot=code-block]>&]:top-2 [[data-slot=code-block]>&]:z-10 [[data-slot=code-block]>&]:m-0 [[data-slot=code-block]>&]:opacity-0 [[data-slot=code-block]>&]:transition-opacity [[data-slot=code-block]>&]:group-focus-within/code-block:opacity-100 [[data-slot=code-block]>&]:group-hover/code-block:opacity-100 group-data-[size=sm]/code-block:[[data-slot=code-block]>&]:end-1.5 group-data-[size=sm]/code-block:[[data-slot=code-block]>&]:top-1.5 [[data-slot=code-block]>&]:pointer-coarse:opacity-100 [[data-slot=code-block]>&]:*:[button]:ring-1",
        props.class
      )}
      {...rest}
    />
  );
}

function CodeBlockCopyButton(
  props: ComponentProps<typeof Button> & {
    value: string;
  }
) {
  const merged = merge({ size: "icon-xs", variant: "ghost" } as const, props);

  const rest = omit(merged, "value", "variant", "size", "class", "onPress");

  const [copied, setCopied] = createSignal(false);
  createEffect(copied, (isCopied) => {
    let cleanup: (() => void) | undefined;

    if (isCopied) {
      const timeout = setTimeout(() => {
        setCopied(false);
      }, 2000);

      cleanup = () => {
        clearTimeout(timeout);
      };
    }

    return cleanup;
  });

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(merged.value);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <>
      <Button
        data-slot="code-block-copy-button"
        data-copied={copied() || undefined}
        variant={merged.variant}
        size={merged.size}
        aria-label={copied() ? "Copied" : "Copy"}
        class={cn("", merged.class)}
        onPress={(event) => {
          merged.onPress?.(event);
          void copy();
        }}
        {...rest}
      >
        {copied() ? <CheckIcon /> : <CopyIcon />}
      </Button>
      <span aria-live="polite" class="sr-only">
        {copied() ? "Copied" : ""}
      </span>
    </>
  );
}

function CodeBlockContent(
  props: ComponentProps<"pre"> & {
    wrap?: boolean;
    lineNumbers?: boolean;
    startLine?: number;
  }
) {
  const merged = merge(
    { lineNumbers: false, startLine: 1, wrap: false } as const,
    props
  );

  const rest = omit(
    merged,
    "class",
    "children",
    "style",
    "wrap",
    "lineNumbers",
    "startLine"
  );

  const style = () => {
    const css: JSX.CSSProperties = {
      "counter-reset": `line ${merged.startLine - 1}`,
    };

    if (typeof merged.style === "object") {
      Object.assign(css, merged.style);
    }

    return css;
  };

  return (
    <pre
      data-slot="code-block-content"
      data-wrap={merged.wrap || undefined}
      data-numbered={merged.lineNumbers || undefined}
      dir="ltr"
      tabindex={0}
      style={style()}
      class={cn(
        "scroll-fade-x data-wrap:scroll-fade-y min-h-0 min-w-0 scrollbar-thin overflow-auto px-3 py-3 text-start font-mono leading-relaxed outline-none group-has-data-[slot=code-block-footer]/code-block:pb-2 group-has-data-[slot=code-block-header]/code-block:pt-2 group-data-[size=sm]/code-block:px-2.5 group-data-[size=sm]/code-block:py-2.5 group-data-[size=sm]/code-block:group-has-data-[slot=code-block-header]/code-block:pt-1.5 data-wrap:wrap-break-word data-wrap:whitespace-pre-wrap",
        merged.class
      )}
      {...rest}
    >
      <code
        data-slot="code-block-code"
        class="grid min-h-lh min-w-max content-start in-data-numbered:grid-cols-[auto_1fr] in-data-wrap:min-w-0"
      >
        {merged.lineNumbers && typeof merged.children === "string"
          ? merged.children
              .replace(/\n$/u, "")
              .split("\n")
              .map((line) => <CodeBlockLine>{line}</CodeBlockLine>)
          : merged.children}
      </code>
    </pre>
  );
}

const codeBlockLineVariants = cva(
  "before:text-muted-foreground after:text-muted-foreground relative -mx-3 block min-h-lh px-3 group-data-[size=sm]/code-block:-mx-2.5 group-data-[size=sm]/code-block:px-2.5 before:min-w-6 before:text-end after:absolute after:start-1 after:top-0 after:select-none in-data-numbered:col-span-2 in-data-numbered:grid in-data-numbered:grid-cols-subgrid in-data-numbered:gap-x-3 in-data-numbered:[counter-increment:line] in-data-numbered:before:content-[counter(line)] in-data-numbered:before:select-none in-data-numbered:supports-[content:counter(line)_/_'']:before:content-[counter(line)_/_'']",
  {
    defaultVariants: {
      variant: "default",
    },
    variants: {
      variant: {
        added: "bg-muted after:content-['+']",
        default: "",
        highlighted: "bg-muted",
        removed: "bg-destructive/10 after:text-destructive after:content-['−']",
      },
    },
  }
);

function CodeBlockLine(
  props: ComponentProps<"span"> & VariantProps<typeof codeBlockLineVariants>
) {
  const merged = merge({ variant: "default" } as const, props);
  const rest = omit(merged, "class", "variant", "children");

  // An empty line holds a newline so copying a selection keeps blank lines.
  const empty = () =>
    merged.children === undefined ||
    merged.children === null ||
    merged.children === "" ||
    (Array.isArray(merged.children) && merged.children.length === 0);

  return (
    <span
      data-slot="code-block-line"
      data-variant={merged.variant}
      class={cn(
        codeBlockLineVariants({ variant: merged.variant }),
        merged.class
      )}
      {...rest}
    >
      <span data-slot="code-block-line-content" class="min-w-0">
        {empty() ? "\n" : merged.children}
      </span>
    </span>
  );
}

function CodeBlockFooter(props: ComponentProps<"div">) {
  const rest = omit(props, "class");

  return (
    <div
      data-slot="code-block-footer"
      class={cn(
        "text-muted-foreground flex min-w-0 shrink-0 items-center gap-2 px-3 pb-3 group-data-[size=sm]/code-block:px-2.5 group-data-[size=sm]/code-block:pb-2.5",
        props.class
      )}
      {...rest}
    />
  );
}

export {
  CodeBlock,
  CodeBlockHeader,
  CodeBlockTitle,
  CodeBlockActions,
  CodeBlockCopyButton,
  CodeBlockContent,
  CodeBlockLine,
  CodeBlockFooter,
};
