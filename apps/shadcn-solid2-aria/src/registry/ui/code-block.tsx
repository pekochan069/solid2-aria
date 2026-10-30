/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/ui/code-block.tsx.
 * Modified for Solid Aria: Solid 2 reactive props, native JSX, Solid Aria primitives, and Lucide icons.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import type { ComponentProps, JSX } from "@solidjs/web";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import { cn } from "cn";
import { createSignal, createEffect, merge, omit } from "solid-js";

import { IconPlaceholder } from "../lib/icon-placeholder";
import { Button } from "./button";

const codeBlockVariants = cva(
  "cn-code-block group/code-block relative flex w-full min-w-0 flex-col overflow-hidden",
  {
    defaultVariants: {
      variant: "default",
    },
    variants: {
      variant: {
        default: "cn-code-block-variant-default",
        destructive: "cn-code-block-variant-destructive",
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
        "cn-code-block-header flex min-w-0 shrink-0 items-center *:has-[>[data-slot=code-block-title]]:min-w-0",
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
        "cn-code-block-title min-w-0 truncate [&_svg]:pointer-events-none [&_svg]:inline-block [&_svg]:align-middle",
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
        "cn-code-block-actions ms-auto flex shrink-0 items-center [[data-slot=code-block]>&]:absolute [[data-slot=code-block]>&]:z-10 [[data-slot=code-block]>&]:opacity-0 [[data-slot=code-block]>&]:transition-opacity [[data-slot=code-block]>&]:group-focus-within/code-block:opacity-100 [[data-slot=code-block]>&]:group-hover/code-block:opacity-100 [[data-slot=code-block]>&]:pointer-coarse:opacity-100",
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
        class={cn("cn-code-block-copy-button", merged.class)}
        onPress={(event) => {
          merged.onPress?.(event);
          void copy();
        }}
        {...rest}
      >
        {copied() ? (
          <IconPlaceholder
            lucide="CheckIcon"
            tabler="IconCheck"
            hugeicons="Tick02Icon"
            phosphor="CheckIcon"
            remixicon="RiCheckLine"
          />
        ) : (
          <IconPlaceholder
            lucide="CopyIcon"
            tabler="IconCopy"
            hugeicons="Copy01Icon"
            phosphor="CopyIcon"
            remixicon="RiFileCopyLine"
          />
        )}
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
        "cn-code-block-content scroll-fade-x data-wrap:scroll-fade-y min-h-0 min-w-0 scrollbar-thin overflow-auto text-start font-mono outline-none data-wrap:wrap-break-word data-wrap:whitespace-pre-wrap",
        merged.class
      )}
      {...rest}
    >
      <code
        data-slot="code-block-code"
        class="cn-code-block-code grid min-h-lh min-w-max content-start in-data-numbered:grid-cols-[auto_1fr] in-data-wrap:min-w-0"
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
  "cn-code-block-line relative block min-h-lh after:absolute after:top-0 after:select-none in-data-numbered:col-span-2 in-data-numbered:grid in-data-numbered:grid-cols-subgrid in-data-numbered:[counter-increment:line] in-data-numbered:before:content-[counter(line)] in-data-numbered:before:select-none in-data-numbered:supports-[content:counter(line)_/_'']:before:content-[counter(line)_/_'']",
  {
    defaultVariants: {
      variant: "default",
    },
    variants: {
      variant: {
        added: "cn-code-block-line-variant-added",
        default: "cn-code-block-line-variant-default",
        highlighted: "cn-code-block-line-variant-highlighted",
        removed: "cn-code-block-line-variant-removed",
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
        "cn-code-block-footer flex min-w-0 shrink-0 items-center",
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
