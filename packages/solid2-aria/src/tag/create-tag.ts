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
 * Derived from Adobe React Spectrum: packages/react-aria/src/tag/useTag.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { ListState } from "@solid2-aria/stately/list/create-list-state";
import type { FocusableElement, Node } from "@solid2-aria/types-shared";
import type { DOMAttributes } from "@solid2-aria/types-shared-web";
import { untrack, omit, merge, createMemo } from "solid-js";
import type { Accessor } from "solid-js";

import intlMessages from "../../intl/tag/index";
import type { AriaButtonProps } from "../button/create-button";
import { createGridListItem } from "../gridlist/create-grid-list-item";
import { createLocalizedStringFormatter } from "../i18n/create-localized-string-formatter";
import { createInteractionModality } from "../interactions/create-focus-visible";
import { createFocusable } from "../interactions/create-focusable";
import { createKeyboard } from "../interactions/create-keyboard";
import type { SelectableItemStates } from "../selection/create-selectable-item";
import { ariaValue } from "../utils/aria-value";
import { createDescription } from "../utils/create-description";
import { createId } from "../utils/create-id";
import { filterDOMProps } from "../utils/filter-dom-props";
import { getCollectionNodeProps } from "../utils/get-collection-node-props";
import { isPresent } from "../utils/is-present";
import { mergeProps } from "../utils/merge-props";
import { createSyntheticLinkProps } from "../utils/open-link";
import { getTruthyValue, isTruthy } from "../utils/truthy";
import { hookData } from "./create-tag-group";

export interface TagAria extends SelectableItemStates {
  /** Props for the tag row element. */
  rowProps: DOMAttributes;
  /** Props for the tag cell element. */
  gridCellProps: DOMAttributes;
  /** Props for the tag remove button. */
  removeButtonProps: AriaButtonProps;
  /** Whether the tag can be removed. */
  allowsRemoving: boolean;
}

export interface AriaTagProps<T> {
  /** An object representing the tag. Contains all the relevant information that makes up the tag. */
  item: Node<T>;
}

/**
 * Provides the behavior and accessibility implementation for a tag component.
 *
 * @param props - Props to be applied to the tag.
 * @param state - State for the tag group, as returned by `useListState`.
 * @param ref - A ref to a DOM element for the tag.
 */
export function createTag<T>(
  props: AriaTagProps<T>,
  state: ListState<T>,
  ref: Accessor<FocusableElement | null>
): TagAria {
  const _result0 = props;

  const stringFormatter = createLocalizedStringFormatter(
    intlMessages,
    "@react-aria/tag"
  );

  const buttonId = createId();
  const _result1 = getTruthyValue(hookData.get(state)) ?? {};

  const _result2 = createGridListItem(
    {
      get node() {
        return _result0.item;
      },
    },
    state,
    ref
  );

  const _result3 = omit(_result2, "rowProps", "gridCellProps");

  const isDisabled = createMemo(
    () =>
      state.disabledKeys.has(_result0.item.key) ||
      getCollectionNodeProps(_result0.item).isDisabled
  );

  const _result4 = createKeyboard({
    get allowRepeats(): true {
      return true;
    },
    get isDisabled() {
      return isDisabled();
    },
    get shortcuts() {
      return {
        Backspace: () => {
          if (state.selectionManager.isSelected(_result0.item.key)) {
            _result1.onRemove?.(new Set(state.selectionManager.selectedKeys));
          } else {
            _result1.onRemove?.(new Set([_result0.item.key]));
          }
        },
        Delete: () => {
          if (state.selectionManager.isSelected(_result0.item.key)) {
            _result1.onRemove?.(new Set(state.selectionManager.selectedKeys));
          } else {
            _result1.onRemove?.(new Set([_result0.item.key]));
          }
        },
      };
    },
  });

  const rawModality = createInteractionModality();

  const modality = createMemo(() =>
    rawModality() === "virtual" &&
    typeof window !== "undefined" &&
    "ontouchstart" in window
      ? "pointer"
      : rawModality()
  );

  const description = createMemo(() =>
    _result1.onRemove && (modality() === "keyboard" || modality() === "virtual")
      ? stringFormatter.format("removeDescription")
      : ""
  );

  const descProps = createDescription(() => description());

  const isItemFocused = createMemo(
    () => _result0.item.key === state.selectionManager.focusedKey
  );

  const isFocused = createMemo(() =>
    isPresent(state.selectionManager.focusedKey)
  );

  let tabIndex = -1;

  if (
    !isTruthy(untrack(() => isDisabled())) &&
    (untrack(() => isItemFocused()) || !untrack(() => isFocused()))
  ) {
    tabIndex = 0;
  }

  const domProps = createMemo(() =>
    filterDOMProps(getCollectionNodeProps(_result0.item))
  );

  const linkProps = createSyntheticLinkProps(
    getCollectionNodeProps(_result0.item)
  );

  const _result5 = createFocusable(
    merge(_result0.item.props, {
      get isDisabled() {
        return isDisabled();
      },
    }),
    ref
  );

  return merge(
    {
      get gridCellProps() {
        return mergeProps(_result2.gridCellProps, {
          "aria-errormessage": ariaValue(
            getCollectionNodeProps(props.item)["aria-errormessage"]
          ),
          "aria-label": ariaValue(
            getCollectionNodeProps(props.item)["aria-label"]
          ),
        });
      },
      get removeButtonProps() {
        return {
          get "aria-label"() {
            return ariaValue(
              ariaValue(stringFormatter.format("removeButtonLabel"))
            );
          },
          get "aria-labelledby"() {
            return ariaValue(
              ariaValue(`${buttonId()} ${_result2.rowProps.id}`)
            );
          },
          get id() {
            return buttonId();
          },
          get isDisabled() {
            return isDisabled();
          },
          onPress: (): null | undefined => {
            if (_result1.onRemove) {
              _result1.onRemove(new Set([_result0.item.key]));

              return undefined;
            }

            return null;
          },
        };
      },
      get rowProps() {
        const keyboardProps = _result1.onRemove
          ? _result4.keyboardProps
          : undefined;

        return mergeProps(
          _result5.focusableProps,
          _result2.rowProps,
          domProps(),
          linkProps,
          {
            tabIndex,
            ...keyboardProps,
            "aria-describedby": ariaValue(descProps["aria-describedby"]),
          }
        );
      },
    },
    omit(_result3, "descriptionProps"),
    {
      get allowsRemoving() {
        return !!_result1.onRemove;
      },
    }
  );
}
