/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
/*
 * Derived from Adobe React Spectrum: packages/react-aria-components/src/Input.tsx.
 * Modified for Solid Aria: adapted components, contexts, refs, and reactive properties for Solid 2; uses Solid class props.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { createIsHidden } from "@solid2-aria/core/collections/hidden";
import { createFocusRing } from "@solid2-aria/core/focus/create-focus-ring";
import { createHover } from "@solid2-aria/core/interactions/create-hover";
import { mergeProps } from "@solid2-aria/core/utils/merge-props";
import { isTruthy } from "@solid2-aria/core/utils/truthy";
import type { HoverEvents } from "@solid2-aria/types-shared";
import type { JSX } from "@solidjs/web";
import { merge, untrack, createContext, omit } from "solid-js";

import { dom, createContextProps, createRenderProps } from "./utils";
import type { Ref, ContextValue, SlotProps, RenderProps } from "./utils";

export interface InputRenderProps {
  isHovered: boolean;
  isFocused: boolean;
  isFocusVisible: boolean;
  isDisabled: boolean;
  isInvalid: boolean;
}

export interface InputProps
  extends
    Omit<
      JSX.InputHTMLAttributes<HTMLInputElement>,
      "ref" | "class" | "style" | "children" | "slot"
    >,
    HoverEvents,
    SlotProps,
    RenderProps<InputRenderProps, "input"> {
  ref?: Ref<HTMLInputElement>;
  autoFocus?: boolean;
}

export const InputContext =
  createContext<ContextValue<InputProps, HTMLInputElement>>(null);

export function Input(input: InputProps): JSX.Element {
  if (createIsHidden()) {
    // oxlint-disable-next-line solid/components-return-once -- Static collection traversal and context registration are fixed when the owner is created.
    return null;
  }

  const [props, , setRef] = createContextProps(
    input,
    untrack(() => input.ref),
    InputContext
  );

  const hover = createHover(
    mergeProps(props, {
      get isDisabled() {
        return isTruthy(props.disabled);
      },
    })
  );

  const focus = createFocusRing({
    get autoFocus() {
      return props.autoFocus ?? isTruthy(props.autofocus);
    },
    isTextInput: true,
  });

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
    mergeProps(props, { defaultClass: "solid2-aria-Input", values })
  );

  return (
    <dom.input
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
        render,
        {
          get onInput() {
            return props.onInput
              ? mergeProps(
                  {
                    get onInput() {
                      return props.onChange;
                    },
                  },
                  {
                    get onInput() {
                      return props.onInput;
                    },
                  }
                ).onInput
              : props.onChange;
          },
        }
      )}
      ref={(element: HTMLInputElement) => {
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
