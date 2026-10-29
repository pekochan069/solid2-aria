/*
 * Copyright 2024 Adobe. All rights reserved.
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
 * Derived from Adobe React Spectrum: packages/react-aria/src/button/useToggleButtonGroup.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type {
  ToggleGroupProps,
  ToggleGroupState,
} from "@solid2-aria/stately/toggle/create-toggle-group-state";
import type { ToggleState } from "@solid2-aria/stately/toggle/create-toggle-state";
import type {
  FocusableElement,
  AriaLabelingProps,
  Key,
  Orientation,
} from "@solid2-aria/types-shared";
import type { DOMAttributes } from "@solid2-aria/types-shared-web";
import { merge, omit } from "solid-js";
import type { Accessor } from "solid-js";

import { createToolbar } from "../toolbar/create-toolbar";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ElementType,
  HTMLAttributes,
  InputHTMLAttributes,
} from "../types";
import { ariaValue } from "../utils/aria-value";
import { getTruthyValue } from "../utils/truthy";
import { createToggleButton } from "./create-toggle-button";
import type {
  AriaToggleButtonProps,
  ToggleButtonAria,
} from "./create-toggle-button";

export interface AriaToggleButtonGroupProps
  extends ToggleGroupProps, AriaLabelingProps {
  /**
   * The orientation of the the toggle button group.
   *
   * @default 'horizontal'
   */
  orientation?: Orientation;
}

export interface ToggleButtonGroupAria {
  /**
   * Props for the toggle button group container.
   */
  groupProps: HTMLAttributes;
}

/**
 * Provides the behavior and accessibility implementation for a toggle button group component.
 * Toggle button groups allow users to select one or more options from a group.
 *
 * @param props - Props for the toggle button group.
 * @param state - State for the toggle button group, as returned by `useToggleGroupState`.
 * @param ref - A ref to the toggle button group element.
 */
export function createToggleButtonGroup(
  props: AriaToggleButtonGroupProps,
  state: ToggleGroupState,
  ref: Accessor<HTMLElement | null>
): ToggleButtonGroupAria {
  const _result0 = props;
  const _result1 = createToolbar(props, ref);

  return {
    get groupProps() {
      return merge(_result1.toolbarProps, {
        get "aria-disabled"() {
          return ariaValue(ariaValue(_result0.isDisabled));
        },
        get role() {
          return state.selectionMode === "single"
            ? "radiogroup"
            : _result1.toolbarProps.role;
        },
      });
    },
  };
}

export interface AriaToggleButtonGroupItemProps<
  E extends ElementType = "button",
> extends Omit<
  AriaToggleButtonProps<E>,
  "id" | "isSelected" | "defaultSelected" | "onChange"
> {
  /** An identifier for the item in the `selectedKeys` of a ToggleButtonGroup. */
  id: Key;
}

export type AriaToggleButtonGroupItemOptions<E extends ElementType> = Omit<
  AriaToggleButtonGroupItemProps<E>,
  "children"
>;

// Order with overrides is important: 'button' should be default
export function createToggleButtonGroupItem(
  props: AriaToggleButtonGroupItemOptions<"button">,
  state: ToggleGroupState,
  ref: Accessor<HTMLButtonElement | null>
): ToggleButtonAria<ButtonHTMLAttributes>;
export function createToggleButtonGroupItem(
  props: AriaToggleButtonGroupItemOptions<"a">,
  state: ToggleGroupState,
  ref: Accessor<HTMLAnchorElement | null>
): ToggleButtonAria<AnchorHTMLAttributes>;
export function createToggleButtonGroupItem(
  props: AriaToggleButtonGroupItemOptions<"div">,
  state: ToggleGroupState,
  ref: Accessor<HTMLDivElement | null>
): ToggleButtonAria<HTMLAttributes<HTMLDivElement>>;
export function createToggleButtonGroupItem(
  props: AriaToggleButtonGroupItemOptions<"input">,
  state: ToggleGroupState,
  ref: Accessor<HTMLInputElement | null>
): ToggleButtonAria<InputHTMLAttributes>;
export function createToggleButtonGroupItem(
  props: AriaToggleButtonGroupItemOptions<"span">,
  state: ToggleGroupState,
  ref: Accessor<HTMLSpanElement | null>
): ToggleButtonAria<HTMLAttributes<HTMLSpanElement>>;
export function createToggleButtonGroupItem(
  props: AriaToggleButtonGroupItemOptions<ElementType>,
  state: ToggleGroupState,
  ref: Accessor<FocusableElement | null>
): ToggleButtonAria<DOMAttributes>;
/**
 * Provides the behavior and accessibility implementation for a toggle button component.
 * ToggleButtons allow users to toggle a selection on or off, for example switching between two
 * states or modes.
 */
export function createToggleButtonGroupItem(
  props: AriaToggleButtonGroupItemOptions<ElementType>,
  state: ToggleGroupState,
  ref: Accessor<FocusableElement | null>
) {
  const toggleState: ToggleState = {
    defaultSelected: false,
    get isSelected() {
      return state.selectedKeys.has(props.id);
    },
    setSelected(isSelected) {
      state.setSelected(props.id, isSelected);
    },
    toggle() {
      state.toggleKey(props.id);
    },
  };

  const _result2 = createToggleButton(
    merge(omit(props, "id"), {
      id: undefined,
      get isDisabled() {
        return getTruthyValue(props.isDisabled) ?? state.isDisabled;
      },
    }),
    toggleState,
    ref
  );

  return {
    get buttonProps() {
      return merge(
        omit(_result2.buttonProps, "role", "aria-checked", "aria-pressed"),
        {
          get "aria-checked"() {
            return state.selectionMode === "single"
              ? ariaValue(toggleState.isSelected)
              : undefined;
          },
          get "aria-pressed"() {
            return state.selectionMode === "single"
              ? undefined
              : _result2.buttonProps["aria-pressed"];
          },
          get role() {
            return state.selectionMode === "single"
              ? ("radio" as const)
              : _result2.buttonProps.role;
          },
        }
      );
    },
    get isDisabled() {
      return _result2.isDisabled;
    },
    get isPressed() {
      return _result2.isPressed;
    },
    get isSelected() {
      return _result2.isSelected;
    },
  };
}
