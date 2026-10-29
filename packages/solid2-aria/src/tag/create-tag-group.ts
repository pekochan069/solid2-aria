/*
 * Copyright 2020 Adobe. All rights reserved.
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
 * Derived from Adobe React Spectrum: packages/react-aria/src/tag/useTagGroup.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { ListState } from "@solid2-aria/stately/list/create-list-state";
import type {
  AriaLabelingProps,
  CollectionBase,
  DOMProps,
  HelpTextProps,
  Key,
  KeyboardDelegate,
  LabelableProps,
  MultipleSelection,
  SelectionBehavior,
} from "@solid2-aria/types-shared";
import type { DOMAttributes } from "@solid2-aria/types-shared-web";
import {
  merge,
  createMemo,
  createEffect,
  createSignal,
  untrack,
} from "solid-js";
import type { Accessor, Element as SolidElement } from "solid-js";

import { createGridList } from "../gridlist/create-grid-list";
import type { AriaGridListProps } from "../gridlist/create-grid-list";
import { createLocale } from "../i18n/i18n-provider";
import { createFocusWithin } from "../interactions/create-focus-within";
import { createField } from "../label/create-field";
import { ListKeyboardDelegate } from "../selection/list-keyboard-delegate";
import { ariaValue } from "../utils/aria-value";
import { filterDOMProps } from "../utils/filter-dom-props";
import { mergeProps } from "../utils/merge-props";
import { getTruthyValue } from "../utils/truthy";

export interface TagGroupAria {
  /** Props for the tag grouping element. */
  gridProps: DOMAttributes;
  /** Props for the tag group's visible label (if any). */
  labelProps: DOMAttributes;
  /** Props for the tag group description element, if any. */
  descriptionProps: DOMAttributes;
  /** Props for the tag group error message element, if any. */
  errorMessageProps: DOMAttributes;
}

export interface AriaTagGroupProps<T>
  extends
    CollectionBase<T>,
    MultipleSelection,
    Pick<AriaGridListProps<T>, "escapeKeyBehavior" | "onAction">,
    DOMProps,
    LabelableProps,
    AriaLabelingProps,
    Omit<HelpTextProps, "errorMessage"> {
  /**
   * How multiple selection should behave in the collection.
   *
   * @default 'toggle'
   */
  selectionBehavior?: SelectionBehavior;
  /** Whether selection should occur on press up instead of press down. */
  shouldSelectOnPressUp?: boolean;
  /** Handler that is called when a user deletes a tag. */
  onRemove?: (keys: Set<Key>) => void;
  /** An error message for the field. */
  errorMessage?: SolidElement;
  /**
   * Whether pressing the escape key should clear selection in the TagGroup or not.
   *
   * Most experiences should not modify this option as it eliminates a keyboard user's ability to
   * easily clear selection. Only use if the escape key is being handled externally or should not
   * trigger selection clearing contextually.
   *
   * @default 'clearSelection'
   */
  escapeKeyBehavior?: "clearSelection" | "none";
}

export interface AriaTagGroupOptions<T> extends Omit<
  AriaTagGroupProps<T>,
  "children"
> {
  /**
   * An optional keyboard delegate to handle arrow key navigation,
   * to override the default.
   */
  keyboardDelegate?: KeyboardDelegate;
}

interface HookData {
  onRemove?: (keys: Set<Key>) => void;
}

export const hookData: WeakMap<ListState<unknown>, HookData> = new WeakMap<
  ListState<unknown>,
  HookData
>();

/**
 * Provides the behavior and accessibility implementation for a tag group component. A tag group is
 * a focusable list of labels, categories, keywords, filters, or other items, with support for
 * keyboard navigation, selection, and removal.
 *
 * @param props - Props to be applied to the tag group.
 * @param state - State for the tag group, as returned by `useListState`.
 * @param ref - A ref to a DOM element for the tag group.
 */
export function createTagGroup<T>(
  props: AriaTagGroupOptions<T>,
  state: ListState<T>,
  ref: Accessor<HTMLElement | null>
): TagGroupAria {
  const _result0 = createLocale();

  const keyboardDelegate = createMemo(
    () =>
      getTruthyValue(props.keyboardDelegate) ??
      new ListKeyboardDelegate({
        collection: state.collection,
        direction: _result0.direction,
        disabledBehavior: state.selectionManager.disabledBehavior,
        disabledKeys: state.disabledKeys,
        orientation: "horizontal",
        ref,
      })
  );

  const _result1 = createField(
    merge(props, {
      get labelElementType(): "span" {
        return "span";
      },
    })
  );

  const _result2 = createGridList(
    merge(
      props,
      untrack(() => _result1.fieldProps),
      {
        get keyboardDelegate() {
          return keyboardDelegate();
        },
        get keyboardNavigationBehavior(): "tab" {
          return "tab";
        },
        get linkBehavior(): "override" {
          return "override";
        },
        get shouldFocusWrap(): true {
          return true;
        },
      }
    ),
    state,
    ref
  );

  const [isFocusWithin, setFocusWithin] = createSignal(false, {
    ownedWrite: true,
  });

  const _result3 = createFocusWithin({
    get onFocusWithinChange() {
      return setFocusWithin;
    },
  });

  const domProps = createMemo(() => filterDOMProps(props));
  // If the last tag is removed, focus the container.
  let prevCount = untrack(() => state.collection.size);
  createEffect(
    () => ({
      element: ref(),
      input3: state.collection,
      isFocusWithin: isFocusWithin(),
      size: state.collection.size,
    }),
    ({ size, isFocusWithin: currentIsFocusWithin, element }) => {
      const refElement = element;

      if (refElement && prevCount > 0 && size === 0 && currentIsFocusWithin) {
        refElement.focus();
      }

      prevCount = size;
    },
    { ssrSource: "client" }
  );
  hookData.set(state, {
    get onRemove() {
      return props.onRemove;
    },
  });

  return {
    get descriptionProps() {
      return _result1.descriptionProps;
    },
    get errorMessageProps() {
      return _result1.errorMessageProps;
    },
    get gridProps() {
      return mergeProps(_result2.gridProps, domProps(), {
        "aria-atomic": ariaValue(false),
        "aria-live": ariaValue(isFocusWithin() ? "polite" : "off"),
        "aria-relevant": ariaValue("additions"),
        role: state.collection.size ? "grid" : "group",
        ..._result3.focusWithinProps,
        ..._result1.fieldProps,
      });
    },
    get labelProps() {
      return _result1.labelProps;
    },
  };
}
