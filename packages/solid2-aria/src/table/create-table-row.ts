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
 * Derived from Adobe React Spectrum: packages/react-aria/src/table/useTableRow.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { getChildNodes } from "@solid2-aria/stately/collections/get-child-nodes";
import type { TableState } from "@solid2-aria/stately/table/create-table-state";
import type { TreeGridState } from "@solid2-aria/stately/table/create-tree-grid-state";
import type { ITableCollection } from "@solid2-aria/stately/table/table-collection";
import type {
  Collection,
  FocusableElement,
  Node,
} from "@solid2-aria/types-shared";
import { omit, merge, createMemo, untrack } from "solid-js";
import type { Accessor } from "solid-js";

import intlMessages from "../../intl/table/index";
import type { AriaButtonProps } from "../button/create-button";
import { createGridRow } from "../grid/create-grid-row";
import type { GridRowAria, GridRowProps } from "../grid/create-grid-row";
import { createLocalizedStringFormatter } from "../i18n/create-localized-string-formatter";
import { createLocale } from "../i18n/i18n-provider";
import type { HTMLAttributes } from "../types";
import { ariaValue } from "../utils/aria-value";
import { createLabels } from "../utils/create-labels";
import { getCollectionNodeProps } from "../utils/get-collection-node-props";
import { isPresent } from "../utils/is-present";
import { mergeProps } from "../utils/merge-props";
import { createSyntheticLinkProps } from "../utils/open-link";
import { requireValue } from "../utils/require-value";
import { getTruthyValue, isTruthy } from "../utils/truthy";
import { getRowLabelledBy } from "./utils";

const EXPANSION_KEYS = {
  collapse: {
    ltr: "ArrowLeft",
    rtl: "ArrowRight",
  },
  expand: {
    ltr: "ArrowRight",
    rtl: "ArrowLeft",
  },
};

export interface TableRowAria extends GridRowAria {
  expandButtonProps: AriaButtonProps;
}

/**
 * Provides the behavior and accessibility implementation for a row in a table.
 *
 * @param props - Props for the row.
 * @param state - State of the table, as returned by `useTableState`.
 */
export function createTableRow<T>(
  props: GridRowProps<T>,
  state: TableState<T> | TreeGridState<T>,
  ref: Accessor<FocusableElement | null>
): TableRowAria {
  const _result0 = props;

  const _result1 = createGridRow<T, ITableCollection<T>>(props, state, ref);

  const _result2 = createLocale();

  if (isTruthy(_result0.isVirtualized) && !isPresent(state.treeColumn)) {
    _result1.rowProps["aria-rowindex"] =
      // aria-rowindex is 1 based
      _result0.node.index + 1 + state.collection.headerRows.length;
  } else {
    delete _result1.rowProps["aria-rowindex"];
  }

  const isExpanded = createMemo(
    () =>
      isPresent(state.treeColumn) &&
      (state.expandedKeys === "all" ||
        state.expandedKeys.has(_result0.node.key))
  );

  const stringFormatter = createLocalizedStringFormatter(
    intlMessages,
    "@react-aria/table"
  );

  const labelProps = createLabels({
    get "aria-label"() {
      return ariaValue(
        ariaValue(
          isExpanded()
            ? stringFormatter.format("collapse")
            : stringFormatter.format("expand")
        )
      );
    },
    get "aria-labelledby"() {
      return ariaValue(ariaValue(getRowLabelledBy(state, _result0.node.key)));
    },
  });

  let treeGridRowProps: HTMLAttributes = {};

  let expandButtonProps: AriaButtonProps & {
    "data-react-aria-prevent-focus"?: boolean;
  } = {};

  if (isPresent(state.treeColumn)) {
    const treeNode = state.collection.getItem(_result0.node.key);

    if (isPresent(treeNode)) {
      const lastChild = getLastChild(state.collection, _result0.node);

      const hasChildRows =
        getTruthyValue(
          getTruthyValue(getCollectionNodeProps(treeNode)?.hasChildRows) ??
            getCollectionNodeProps(treeNode)?.UNSTABLE_childItems
        ) ?? lastChild?.type !== "cell";

      const parent = requireValue(
        state.collection.getItem(
          requireValue(
            _result0.node.parentKey,
            "Expected a present traversal value"
          )
        ),
        "Expected state.collection.getItem(_result0.node.parentKey!)"
      );

      const isParentBody =
        parent.type === "tablebody" || parent.type === "body";

      let lastSibling = requireValue(
        getLastChild(state.collection, parent),
        "Expected getLastChild(state.collection, parent)"
      );

      while (
        isTruthy(lastSibling) &&
        lastSibling.type !== "item" &&
        lastSibling.prevKey !== null &&
        lastSibling.prevKey !== undefined
      ) {
        lastSibling = requireValue(
          state.collection.getItem(lastSibling.prevKey),
          "Expected state.collection.getItem(lastSibling.prevKey)"
        );
      }

      treeGridRowProps = {
        "aria-expanded": ariaValue(
          isTruthy(hasChildRows)
            ? state.expandedKeys === "all" ||
                state.expandedKeys.has(_result0.node.key)
            : undefined
        ),
        "aria-level": ariaValue(treeNode.level + 1),
        "aria-posinset": ariaValue(
          treeNode.index - (isParentBody ? 0 : state.collection.columnCount) + 1
        ),
        "aria-setsize": ariaValue(
          lastSibling.index -
            (isParentBody ? 0 : state.collection.columnCount) +
            1
        ),
        onKeyDown: (e) => {
          if (
            e.key === EXPANSION_KEYS.expand[_result2.direction] &&
            state.selectionManager.focusedKey === treeNode.key &&
            isTruthy(hasChildRows) &&
            state.expandedKeys !== "all" &&
            !state.expandedKeys.has(treeNode.key)
          ) {
            state.toggleKey(treeNode.key);
            e.stopPropagation();
          } else if (
            e.key === EXPANSION_KEYS.collapse[_result2.direction] &&
            state.selectionManager.focusedKey === treeNode.key
          ) {
            if (state.expandedKeys !== "all") {
              if (
                isTruthy(hasChildRows) &&
                state.expandedKeys.has(treeNode.key)
              ) {
                state.toggleKey(treeNode.key);
                e.stopPropagation();
              } else if (
                !state.expandedKeys.has(treeNode.key) &&
                treeNode.parentKey !== null &&
                treeNode.parentKey !== undefined &&
                treeNode.level > 0
              ) {
                // Item is a leaf or already collapsed, move focus to parent
                state.selectionManager.setFocusedKey(treeNode.parentKey);
                e.stopPropagation();
              }
            } else if (state.expandedKeys === "all") {
              state.toggleKey(treeNode.key);
              e.stopPropagation();
            }
          }
        },
      };

      expandButtonProps = {
        "data-react-aria-prevent-focus": true,
        excludeFromTabOrder: true,
        get isDisabled() {
          return (
            // oxlint-disable solid/reactivity -- Keep prop filtering in the renderer's lazy evaluation.
            omit(_result1, "rowProps")
              // oxlint-enable solid/reactivity
              .isDisabled
          );
        },
        get onPress() {
          return () => {
            if (
              !untrack(
                () =>
                  // oxlint-disable solid/reactivity -- Keep prop filtering in the renderer's lazy evaluation.
                  omit(_result1, "rowProps")
                    // oxlint-enable solid/reactivity
                    .isDisabled
              )
            ) {
              state.toggleKey(_result0.node.key);
              state.selectionManager.setFocused(true);
              state.selectionManager.setFocusedKey(_result0.node.key);
            }
          };
        },
        preventFocusOnPress: true,

        ...labelProps,
      };
    }
  }

  const syntheticLinkProps = createSyntheticLinkProps(
    getCollectionNodeProps(_result0.node)
  );

  const linkProps = createMemo(() =>
    // oxlint-disable solid/reactivity -- Keep prop filtering in the renderer's lazy evaluation.
    omit(_result1, "rowProps")
      // oxlint-enable solid/reactivity
      .hasAction
      ? syntheticLinkProps
      : {}
  );

  return merge(
    {
      get expandButtonProps() {
        return expandButtonProps;
      },
      get rowProps() {
        return merge(
          mergeProps(_result1.rowProps, treeGridRowProps, linkProps()),
          {
            get "aria-labelledby"() {
              return ariaValue(
                ariaValue(getRowLabelledBy(state, _result0.node.key))
              );
            },
          }
        );
      },
    },
    omit(_result1, "rowProps")
  );
}

function getLastChild(
  collection: Collection<Node<unknown>>,
  node: Node<unknown>
) {
  if ("lastChildKey" in node) {
    return isPresent(node.lastChildKey)
      ? collection.getItem(node.lastChildKey)
      : null;
  }

  return [...getChildNodes(node, collection)].findLast(
    (item) => item.parentKey === node.key
  );
}
