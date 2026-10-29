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
 * Derived from Adobe React Spectrum: packages/react-aria-components/src/ToggleButton.tsx.
 * Modified for Solid Aria: adapted components, contexts, refs, and reactive properties for Solid 2; uses Solid class props and an untracked setup-time choice of group interaction behavior.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { createToggleButton } from "@solid2-aria/core/button/create-toggle-button";
import type { AriaToggleButtonProps } from "@solid2-aria/core/button/create-toggle-button";
import { createToggleButtonGroupItem } from "@solid2-aria/core/button/create-toggle-button-group";
import { createFocusRing } from "@solid2-aria/core/focus/create-focus-ring";
import { createHover } from "@solid2-aria/core/interactions/create-hover";
import { filterDOMProps } from "@solid2-aria/core/utils/filter-dom-props";
import { isPresent } from "@solid2-aria/core/utils/is-present";
import { mergeProps } from "@solid2-aria/core/utils/merge-props";
import { requireValue } from "@solid2-aria/core/utils/require-value";
import { createToggleState } from "@solid2-aria/stately/toggle/create-toggle-state";
import type { ToggleState } from "@solid2-aria/stately/toggle/create-toggle-state";
import type { HoverEvents, Key } from "@solid2-aria/types-shared";
import type { JSX } from "@solidjs/web";
import { merge, untrack, createContext, useContext, omit } from "solid-js";

import type { ButtonRenderProps } from "./button";
import { SelectionIndicatorContext } from "./selection-indicator";
import { ToggleGroupStateContext } from "./toggle-button-group";
import { dom, createContextProps, createRenderProps } from "./utils";
import type { Ref, ContextValue, SlotProps, RenderProps } from "./utils";

export interface ToggleButtonRenderProps extends Omit<
  ButtonRenderProps,
  "isPending"
> {
  isSelected: boolean;
  state: ToggleState;
}

export interface ToggleButtonProps
  extends
    Omit<AriaToggleButtonProps, "children" | "elementType" | "id">,
    SlotProps,
    HoverEvents,
    RenderProps<ToggleButtonRenderProps, "button"> {
  id?: Key;
  ref?: Ref<HTMLButtonElement>;
}

export const ToggleButtonContext =
  createContext<ContextValue<ToggleButtonProps, HTMLButtonElement>>(null);

export function ToggleButton(input: ToggleButtonProps): JSX.Element {
  const [props, ref, setRef] = createContextProps(
    input,
    untrack(() => input.ref),
    ToggleButtonContext
  );

  const group = useContext(ToggleGroupStateContext);

  const state = createToggleState(
    group
      ? {
          get isSelected() {
            return isPresent(props.id) && group.selectedKeys.has(props.id);
          },
          onChange(selected) {
            if (isPresent(props.id)) {
              group.setSelected(props.id, selected);
            }
          },
        }
      : props
  );

  const aria =
    group && untrack(() => isPresent(props.id))
      ? createToggleButtonGroupItem(
          mergeProps(props, {
            get id() {
              return requireValue(props.id, "Expected props.id");
            },
          }),
          group,
          ref
        )
      : createToggleButton(
          mergeProps(props, {
            get id() {
              return isPresent(props.id) ? String(props.id) : undefined;
            },
          }),
          state,
          ref
        );

  const focus = createFocusRing(props);

  const hover = createHover(
    mergeProps(props, {
      get isDisabled() {
        return aria.isDisabled;
      },
    })
  );

  const values: ToggleButtonRenderProps = {
    get isDisabled() {
      return aria.isDisabled;
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
    get isPressed() {
      return aria.isPressed;
    },
    get isSelected() {
      return state.isSelected;
    },
    state,
  };

  const render = createRenderProps(
    mergeProps(props, { defaultClass: "solid2-aria-ToggleButton", values })
  );

  return (
    <dom.button
      {...mergeProps(
        omit(filterDOMProps(props, { global: true }), "id", "onClick"),
        merge(() => aria.buttonProps ?? {}),
        merge(() => focus.focusProps ?? {}),
        merge(() => hover.hoverProps ?? {}),
        render
      )}
      ref={(element: HTMLButtonElement) => {
        setRef(element);
      }}
      slot={props.slot ?? undefined}
      data-selected={values.isSelected || undefined}
      data-disabled={values.isDisabled || undefined}
      data-pressed={values.isPressed || undefined}
      data-hovered={hover.isHovered || undefined}
      data-focused={focus.isFocused || undefined}
      data-focus-visible={focus.isFocusVisible || undefined}
    >
      <SelectionIndicatorContext
        value={{
          get isSelected() {
            return state.isSelected;
          },
        }}
      >
        {render.children}
      </SelectionIndicatorContext>
    </dom.button>
  );
}
