/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/ui/progress.tsx.
 * Modified for Solid Aria: Solid 2 reactive props, native JSX, Solid Aria primitives, and Lucide icons.
 * Generated for docs with nova styling from apps/v4/registry/styles/style-nova.css.
 * Maintained locally for the Solid Aria documentation site.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import {
  Label as LabelPrimitive,
  ProgressBar as ProgressPrimitive,
} from "@solid2-aria/components";
import type {
  LabelProps,
  ProgressBarProps as ProgressPrimitiveProps,
} from "@solid2-aria/components";
import type { JSX, ComponentProps } from "@solidjs/web";
import { omit, useContext, createContext } from "solid-js";

import { cn } from "#lib/cn";

interface ProgressContextValue {
  percentage?: number;
  isIndeterminate: boolean;
  valueText?: string;
}

const ProgressContext = createContext<ProgressContextValue>();

function useProgress() {
  return useContext(ProgressContext);
}

function ProgressContent(
  props: ProgressContextValue & {
    children?: JSX.Element;
  }
) {
  return (
    <ProgressContext value={props}>
      {props.children}
      <ProgressTrack>
        <ProgressIndicator />
      </ProgressTrack>
    </ProgressContext>
  );
}

function Progress(
  props: Omit<ProgressPrimitiveProps, "children" | "class"> & {
    children?: JSX.Element;
    class?: string;
  }
) {
  const rest = omit(props, "class", "children");

  return (
    <ProgressPrimitive
      data-slot="progress"
      class={cn("flex flex-wrap gap-3", props.class)}
      {...rest}
    >
      {(renderProps0) => (
        <ProgressContent
          percentage={renderProps0.percentage}
          valueText={renderProps0.valueText}
          isIndeterminate={renderProps0.isIndeterminate}
        >
          {props.children}
        </ProgressContent>
      )}
    </ProgressPrimitive>
  );
}

function ProgressTrack(props: ComponentProps<"span">) {
  const rest = omit(props, "class");

  return (
    <span
      class={cn(
        "bg-muted relative flex h-1 w-full items-center overflow-x-hidden rounded-full",
        props.class
      )}
      data-slot="progress-track"
      {...rest}
    />
  );
}

function ProgressIndicator(props: ComponentProps<"span">) {
  const rest = omit(props, "class", "style");
  const progress = useProgress();

  const style = () => {
    const css: JSX.CSSProperties = {};

    if (typeof props.style === "object") {
      Object.assign(css, props.style);
    }

    css.width = `${progress.isIndeterminate ? 100 : (progress.percentage ?? 0)}%`;

    return css;
  };

  return (
    <span
      data-slot="progress-indicator"
      class={cn("bg-primary h-full transition-all", props.class)}
      style={style()}
      {...rest}
    />
  );
}

function ProgressLabel(props: LabelProps) {
  const rest = omit(props, "class");

  return (
    <LabelPrimitive
      class={cn("text-sm font-medium", props.class)}
      data-slot="progress-label"
      {...rest}
    />
  );
}

function ProgressValue(
  props: Omit<ComponentProps<"span">, "children"> & {
    children?: (value: string) => JSX.Element;
  }
) {
  const rest = omit(props, "class", "children");
  const progress = useProgress();

  return (
    <span
      class={cn(
        "text-muted-foreground ml-auto text-sm tabular-nums",
        props.class
      )}
      data-slot="progress-value"
      {...rest}
    >
      {props.children && progress.valueText !== undefined
        ? props.children(progress.valueText)
        : progress.valueText}
    </span>
  );
}

export {
  Progress,
  ProgressTrack,
  ProgressIndicator,
  ProgressLabel,
  ProgressValue,
};
