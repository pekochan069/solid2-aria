/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/ui/input-otp.tsx.
 * Modified for Solid Aria: Solid 2 reactive props, native JSX, Solid Aria primitives, and Lucide icons.
 * Generated for docs with nova styling from apps/v4/registry/styles/style-nova.css.
 * Maintained locally for the Solid Aria documentation site.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { MinusIcon } from "@lucide/solid";
import type { ComponentProps, JSX } from "@solidjs/web";
import { createContext, useContext, createSignal, omit } from "solid-js";

import { cn } from "#lib/cn";

type InputOTPProps = Omit<
  ComponentProps<"input">,
  "value" | "onChange" | "children" | "class"
> & {
  maxLength: number;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  children?: JSX.Element;
  class?: JSX.ClassValue;
  containerClass?: JSX.ClassValue;
  pattern?: string;
};

const InputOTPContext = createContext<{
  value: string;
  activeIndex: number;
  focused: boolean;
}>();

function InputOTP(props: InputOTPProps) {
  const [internalValue, setValue] = createSignal(
    () => props.defaultValue ?? ""
  );

  const [focused, setFocused] = createSignal(false);
  const [selection, setSelection] = createSignal(0);
  const value = () => props.value ?? internalValue();

  const rest = omit(
    props,
    "maxLength",
    "value",
    "defaultValue",
    "onChange",
    "onComplete",
    "children",
    "class",
    "containerClass",
    "onInput",
    "onFocus",
    "onBlur",
    "onSelect"
  );

  const context = {
    get activeIndex() {
      return Math.min(selection(), props.maxLength - 1);
    },
    get focused() {
      return focused();
    },
    get value() {
      return value();
    },
  };

  return (
    <InputOTPContext value={context}>
      <div
        data-slot="input-otp"
        class={cn(
          "relative flex items-center gap-2 has-disabled:opacity-50",
          props.containerClass
        )}
      >
        <input
          {...rest}
          data-slot="input-otp-input"
          autocomplete="one-time-code"
          inputmode="numeric"
          spellcheck="false"
          maxlength={props.maxLength}
          value={value()}
          aria-label={props["aria-label"] ?? "One-time code"}
          class={cn(
            "absolute inset-0 z-10 h-full w-full cursor-text opacity-0 disabled:cursor-not-allowed",
            props.class
          )}
          onInput={(event) => {
            const input = event.currentTarget;
            const next = input.value.slice(0, props.maxLength);

            if (
              Boolean(props.pattern) &&
              !new RegExp(`^(?:${props.pattern})$`, "u").test(next)
            ) {
              input.value = value();

              return;
            }

            setValue(next);
            setSelection(input.selectionStart ?? next.length);
            props.onChange?.(next);

            if (next.length === props.maxLength) {
              props.onComplete?.(next);
            }

            if (typeof props.onInput === "function") {
              props.onInput(event);
            }
          }}
          onFocus={(event) => {
            setFocused(true);
            setSelection(event.currentTarget.selectionStart ?? value().length);

            if (typeof props.onFocus === "function") {
              props.onFocus(event);
            }
          }}
          onBlur={(event) => {
            setFocused(false);

            if (typeof props.onBlur === "function") {
              props.onBlur(event);
            }
          }}
          onSelect={(event) => {
            setSelection(event.currentTarget.selectionStart ?? 0);

            if (typeof props.onSelect === "function") {
              props.onSelect(event);
            }
          }}
        />
        <div aria-hidden="true" class="flex items-center">
          {props.children}
        </div>
      </div>
    </InputOTPContext>
  );
}

function InputOTPGroup(props: ComponentProps<"div">) {
  return (
    <div
      {...props}
      data-slot="input-otp-group"
      class={cn(
        "has-aria-invalid:ring-destructive/20 dark:has-aria-invalid:ring-destructive/40 has-aria-invalid:border-destructive flex items-center rounded-lg has-aria-invalid:ring-3",
        props.class
      )}
    />
  );
}

function InputOTPSlot(
  props: ComponentProps<"div"> & {
    index: number;
  }
) {
  const context = useContext(InputOTPContext);
  const rest = omit(props, "index", "class", "children");

  return (
    <div
      {...rest}
      data-slot="input-otp-slot"
      data-active={
        context.focused && context.activeIndex === props.index
          ? "true"
          : "false"
      }
      class={cn(
        "dark:bg-input/30 border-input data-[active=true]:border-ring data-[active=true]:ring-ring/50 data-[active=true]:aria-invalid:ring-destructive/20 dark:data-[active=true]:aria-invalid:ring-destructive/40 aria-invalid:border-destructive data-[active=true]:aria-invalid:border-destructive relative flex size-8 items-center justify-center border-y border-r text-sm transition-all outline-none first:rounded-l-lg first:border-l last:rounded-r-lg data-[active=true]:z-10 data-[active=true]:ring-3",
        props.class
      )}
    >
      {context.value[props.index]}
      {context.focused &&
        context.activeIndex === props.index &&
        (context.value[props.index] ?? "") === "" && (
          <div class="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div class="animate-caret-blink bg-foreground h-4 w-px duration-1000" />
          </div>
        )}
    </div>
  );
}

function InputOTPSeparator(props: ComponentProps<"div">) {
  return (
    <div
      {...props}
      data-slot="input-otp-separator"
      role="separator"
      class="flex items-center [&_svg:not([class*='size-'])]:size-4"
    >
      <MinusIcon />
    </div>
  );
}

export {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
  type InputOTPProps,
};
