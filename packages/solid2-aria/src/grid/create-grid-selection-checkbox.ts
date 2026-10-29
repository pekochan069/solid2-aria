/*
 * Derived from Adobe React Spectrum: packages/react-aria/src/grid/useGridSelectionCheckbox.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { GridState } from "@solid2-aria/stately/grid/create-grid-state";
import type { IGridCollection as GridCollection } from "@solid2-aria/stately/grid/grid-collection";
import type { Key } from "@solid2-aria/types-shared";
import { createMemo } from "solid-js";

import intlMessages from "../../intl/grid/index";
import type { AriaCheckboxProps } from "../checkbox/create-checkbox";
import { createLocalizedStringFormatter } from "../i18n/create-localized-string-formatter";
import { ariaValue } from "../utils/aria-value";
import { createId } from "../utils/create-id";

export interface AriaGridSelectionCheckboxProps {
  /** A unique key for the checkbox. */
  key: Key;
}

export interface GridSelectionCheckboxAria {
  /** Props for the row selection checkbox element. */
  checkboxProps: AriaCheckboxProps;
}

/**
 * Provides the behavior and accessibility implementation for a selection checkbox in a grid.
 *
 * @param props - Props for the selection checkbox.
 * @param state - State of the grid, as returned by `useGridState`.
 */
export function createGridSelectionCheckbox(
  props: AriaGridSelectionCheckboxProps,
  state: Pick<GridState<unknown, GridCollection<unknown>>, "selectionManager">
): GridSelectionCheckboxAria {
  const _result0 = props;
  const manager = createMemo(() => state.selectionManager);
  const checkboxId = createId();

  const isDisabled = createMemo(
    () => !state.selectionManager.canSelectItem(_result0.key)
  );

  const isSelected = createMemo(() =>
    state.selectionManager.isSelected(_result0.key)
  );

  // Checkbox should always toggle selection, regardless of selectionBehavior.
  const onChange = () => {
    manager().toggleSelection(_result0.key);
  };

  const stringFormatter = createLocalizedStringFormatter(
    intlMessages,
    "@react-aria/grid"
  );

  return {
    get checkboxProps() {
      return {
        get "aria-label"() {
          return ariaValue(ariaValue(stringFormatter.format("select")));
        },
        get id() {
          return checkboxId();
        },
        get isDisabled() {
          return isDisabled();
        },
        get isSelected() {
          return isSelected();
        },
        get onChange() {
          return onChange;
        },
      };
    },
  };
}
