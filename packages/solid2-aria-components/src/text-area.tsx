/*
 * Derived from Adobe React Spectrum: packages/react-aria-components/src/TextArea.tsx.
 * Modified for Solid Aria: adapted components, contexts, refs, and reactive properties for Solid 2; uses Solid class props.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { createFocusRing } from "@solid2-aria/core/focus/create-focus-ring";
import { createHover } from "@solid2-aria/core/interactions/create-hover";
import { mergeProps } from "@solid2-aria/core/utils/merge-props";
import { isTruthy } from "@solid2-aria/core/utils/truthy";
import type { HoverEvents } from "@solid2-aria/types-shared";
import type { JSX } from "@solidjs/web";
import { merge, untrack, createContext, omit } from "solid-js";

import type { InputRenderProps } from "./input";
import { dom, createContextProps, createRenderProps } from "./utils";
import type { Ref, ContextValue, SlotProps, RenderProps } from "./utils";

export interface TextAreaProps
  extends
    Omit<
      JSX.TextareaHTMLAttributes<HTMLTextAreaElement>,
      "ref" | "class" | "style" | "children" | "slot"
    >,
    HoverEvents,
    SlotProps,
    RenderProps<InputRenderProps, "textarea"> {
  ref?: Ref<HTMLTextAreaElement>;
  autoFocus?: boolean;
}

export const TextAreaContext =
  createContext<ContextValue<TextAreaProps, HTMLTextAreaElement>>(null);

export function TextArea(input: TextAreaProps): JSX.Element {
  const [props, , setRef] = createContextProps(
    input,
    untrack(() => input.ref),
    TextAreaContext
  );

  const focus = createFocusRing({
    get autoFocus() {
      return props.autoFocus ?? isTruthy(props.autofocus);
    },
    isTextInput: true,
  });

  const hover = createHover(
    mergeProps(props, {
      get isDisabled() {
        return isTruthy(props.disabled);
      },
    })
  );

  const values: InputRenderProps = {
    get isDisabled() {
      return isTruthy(props.disabled);
    },
    get isFocusVisible() {
      return focus.isFocusVisible;
    },
    get isFocused() {
      return focus.isFocused;
    },
    get isHovered() {
      return hover.isHovered;
    },
    get isInvalid() {
      return (
        isTruthy(props["aria-invalid"]) && props["aria-invalid"] !== "false"
      );
    },
  };

  const render = createRenderProps(
    mergeProps(props, { defaultClass: "solid2-aria-TextArea", values })
  );

  return (
    <dom.textarea
      {...mergeProps(
        omit(
          props,
          "onHoverStart",
          "onHoverChange",
          "onHoverEnd",
          "autoFocus",
          "slot",
          "children"
        ),
        merge(() => focus.focusProps ?? {}),
        merge(() => hover.hoverProps ?? {}),
        render
      )}
      ref={(element: HTMLTextAreaElement) => {
        setRef(element);
      }}
      slot={props.slot ?? undefined}
      data-focused={focus.isFocused || undefined}
      data-focus-visible={focus.isFocusVisible || undefined}
      data-hovered={hover.isHovered || undefined}
      data-disabled={props.disabled ?? undefined}
      data-invalid={values.isInvalid || undefined}
    />
  );
}
