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
 * Derived from Adobe React Spectrum: packages/@react-types/listbox/src/index.d.ts.
 * Modified for Solid Aria: adapted type declarations, imports, and formatting for Solid.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type {
  CollectionBase,
  MultipleSelection,
  FocusEvents,
  FocusStrategy,
  DOMProps,
  AriaLabelingProps,
  SelectionBehavior,
  Key,
  AsyncLoadable,
} from "@solid2-aria/types-shared";
import type { StyleProps } from "@solid2-aria/types-shared-web";
import type { JSX } from "@solidjs/web";

export interface ListBoxProps<T>
  extends CollectionBase<T>, MultipleSelection, FocusEvents {
  /** Whether to auto focus the listbox or an option. */
  autoFocus?: boolean | FocusStrategy;
  /** Whether focus should wrap around when the end/start is reached. */
  shouldFocusWrap?: boolean;
}

export interface AriaListBoxProps<T> extends AriaListBoxPropsBase<T> {
  /**
   * An optional visual label for the listbox.
   */
  label?: JSX.Element;
  /** How multiple selection should behave in the collection. */
  selectionBehavior?: SelectionBehavior;
  /** Whether selection should occur on press up instead of press down. */
  shouldSelectOnPressUp?: boolean;
  /** Whether options should be focused when the user hovers over them. */
  shouldFocusOnHover?: boolean;
  /**
   * Handler that is called when a user performs an action on an item. The exact user event depends
   * on the collection's `selectionBehavior` prop and the interaction modality.
   */
  onAction?: (key: Key) => void;
}

interface AriaListBoxPropsBase<T>
  extends ListBoxProps<T>, DOMProps, AriaLabelingProps {
  /**
   * Whether pressing the escape key should clear selection in the listbox or not.
   *
   * Most experiences should not modify this option as it eliminates a keyboard user's ability to
   * easily clear selection. Only use if the escape key is being handled externally or should not
   * trigger selection clearing contextually.
   *
   * @default 'clearSelection'
   */
  escapeKeyBehavior?: "clearSelection" | "none";
}

export interface SpectrumListBoxProps<T>
  extends AriaListBoxPropsBase<T>, AsyncLoadable, StyleProps {}
