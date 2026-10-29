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
 * Derived from Adobe React Spectrum: packages/react-aria/src/grid/useGridSelectionAnnouncement.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { SelectionManager } from "@solid2-aria/stately/selection/selection-manager";
import type {
  Collection,
  Key,
  Node,
  Selection,
} from "@solid2-aria/types-shared";
import { createMemo, createEffect, untrack } from "solid-js";

import intlMessages from "../../intl/grid/index";
import { createLocalizedStringFormatter } from "../i18n/create-localized-string-formatter";
import { announce } from "../live-announcer/live-announcer";
import { isPresent } from "../utils/is-present";
import { isTruthy } from "../utils/truthy";

export interface GridSelectionAnnouncementProps {
  /**
   * A function that returns the text that should be announced by assistive technology when a row is
   * added or removed from selection.
   *
   * @default (key) => state.collection.getItem(key)?.textValue
   */
  getRowText?: (key: Key) => string;
}

interface GridSelectionState<T> {
  /** A collection of items in the grid. */
  collection: Collection<Node<T>>;
  /** A set of items that are disabled. */
  disabledKeys: Set<Key>;
  /** A selection manager to read and update multiple selection state. */
  selectionManager: SelectionManager;
}

export function createGridSelectionAnnouncement<T>(
  props: GridSelectionAnnouncementProps,
  state: GridSelectionState<T>
): void {
  const _result0 = props;

  const stringFormatter = createLocalizedStringFormatter(
    intlMessages,
    "@react-aria/grid"
  );

  // Many screen readers do not announce when items in a grid are selected/deselected.
  // We do this using an ARIA live region.
  const selection = createMemo(() => state.selectionManager.rawSelection);
  let lastSelection = untrack(selection);

  function rowText(key: Key) {
    const supplied = _result0.getRowText;

    if (supplied) {
      return supplied(key);
    }

    return (
      state.collection.getTextValue?.(key) ??
      state.collection.getItem(key)?.textValue
    );
  }

  function shouldAnnounceCount(messages: readonly string[]): boolean {
    return (
      state.selectionManager.selectionMode === "multiple" &&
      (messages.length === 0 ||
        selection() === "all" ||
        (selection() !== "all" &&
          state.selectionManager.selectedKeys.size > 1) ||
        lastSelection === "all" ||
        lastSelection?.size > 1)
    );
  }

  const getSelectionAnnouncement = () => {
    if (!state.selectionManager.isFocused || selection() === lastSelection) {
      return "";
    }

    const addedKeys = diffSelection(selection(), lastSelection);
    const removedKeys = diffSelection(lastSelection, selection());
    // If adding or removing a single row from the selection, announce the name of that item.
    const isReplace = state.selectionManager.selectionBehavior === "replace";
    const messages: string[] = [];

    if (state.selectionManager.selectedKeys.size === 1 && isReplace) {
      const firstKey = state.selectionManager.selectedKeys.keys().next().value;

      if (isPresent(firstKey) && state.collection.getItem(firstKey)) {
        const currentSelectionText = rowText(firstKey);

        if (isTruthy(currentSelectionText)) {
          messages.push(
            stringFormatter.format("selectedItem", {
              item: currentSelectionText,
            })
          );
        }
      }
    } else if (addedKeys.size === 1 && removedKeys.size === 0) {
      const firstKey = addedKeys.keys().next().value;

      if (isPresent(firstKey)) {
        const addedText = rowText(firstKey);

        if (isTruthy(addedText)) {
          messages.push(
            stringFormatter.format("selectedItem", { item: addedText })
          );
        }
      }
    } else if (removedKeys.size === 1 && addedKeys.size === 0) {
      const firstKey = removedKeys.keys().next().value;

      if (isPresent(firstKey) && state.collection.getItem(firstKey)) {
        const removedText = rowText(firstKey);

        if (isTruthy(removedText)) {
          messages.push(
            stringFormatter.format("deselectedItem", { item: removedText })
          );
        }
      }
    }

    // Announce how many items are selected, except when selecting the first item.
    if (shouldAnnounceCount(messages)) {
      messages.push(
        selection() === "all"
          ? stringFormatter.format("selectedAll")
          : stringFormatter.format("selectedCount", {
              count: state.selectionManager.selectedKeys.size,
            })
      );
    }

    return messages.join(" ");
  };

  const announceSelectionChange = () => {
    const currentSelection = untrack(selection);
    const message = untrack(getSelectionAnnouncement);

    if (message) {
      announce(message);
    }

    lastSelection = currentSelection;
  };

  createEffect(
    () => ({
      announcement: getSelectionAnnouncement(),
      isFocused: state.selectionManager.isFocused,
      selection: selection(),
    }),
    ({
      announcement,
      isFocused,
      selection: currentSelection,
    }): undefined | (() => void) => {
      if (isFocused) {
        if (announcement) {
          announce(announcement);
        }

        lastSelection = currentSelection;
      } else {
        // Wait a frame in case the collection is about to become focused (e.g. on mouse down).
        const raf = requestAnimationFrame(announceSelectionChange);

        return () => {
          cancelAnimationFrame(raf);
        };
      }

      return undefined;
    },
    { defer: true, ssrSource: "client" }
  );
}

function diffSelection(a: Selection, b: Selection): Set<Key> {
  const res = new Set<Key>();

  if (a === "all" || b === "all") {
    return res;
  }

  for (const key of a.keys()) {
    if (!b.has(key)) {
      res.add(key);
    }
  }

  return res;
}
