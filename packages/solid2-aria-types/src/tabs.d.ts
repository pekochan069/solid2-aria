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
 * Derived from Adobe React Spectrum: packages/@react-types/tabs/src/index.d.ts.
 * Modified for Solid Aria: adapted type declarations, imports, and formatting for Solid.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type {
  CollectionBase,
  SingleSelection,
  Key,
  DOMProps,
  AriaLabelingProps,
  Orientation,
  CollectionChildren,
} from "@solid2-aria/types-shared";
import type { StyleProps } from "@solid2-aria/types-shared-web";
import type { JSX } from "@solidjs/web";

export interface TabListProps<T>
  extends
    CollectionBase<T>,
    Omit<
      SingleSelection,
      | "disallowEmptySelection"
      | "selectedKey"
      | "defaultSelectedKey"
      | "onSelectionChange"
    > {
  /**
   * Whether the TabList is disabled.
   * Shows that a selection exists, but is not available in that circumstance.
   */
  isDisabled?: boolean;
  /** The currently selected key in the collection (controlled). */
  selectedKey?: Key;
  /** The initial selected keys in the collection (uncontrolled). */
  defaultSelectedKey?: Key;
  /** Handler that is called when the selection changes. */
  onSelectionChange?: (key: Key) => void;
}

export interface AriaTabListProps<T>
  extends TabListProps<T>, DOMProps, AriaLabelingProps {
  /**
   * Whether tabs are activated automatically on focus or manually.
   *
   * @default 'automatic'
   */
  keyboardActivation?: "automatic" | "manual";
  /**
   * The orientation of the tabs.
   *
   * @default 'horizontal'
   */
  orientation?: Orientation;
}

export interface AriaTabProps extends AriaLabelingProps {
  /** The key of the tab. */
  key: Key;
  /** Whether the tab should be disabled. */
  isDisabled?: boolean;
  /** Whether the tab selection should occur on press up instead of press down. */
  shouldSelectOnPressUp?: boolean;
}

export interface AriaTabPanelProps
  extends Omit<DOMProps, "id">, AriaLabelingProps {
  /** The unique id of the tab. */
  id?: Key;
}

export interface SpectrumTabsProps<T>
  extends
    Omit<
      SingleSelection,
      | "onSelectionChange"
      | "disallowEmptySelection"
      | "selectedKey"
      | "defaultSelectedKey"
    >,
    AriaLabelingProps,
    DOMProps,
    StyleProps {
  /** The children of the `<Tabs>` element. Should include `<TabList>` and `<TabPanels>` elements. */
  children: JSX.Element;
  /** The item objects for each tab, for dynamic collections. */
  items?: Iterable<T>;
  /**
   * The keys of the tabs that are disabled. These tabs cannot be selected, focused, or otherwise
   * interacted with.
   */
  disabledKeys?: Iterable<Key>;
  /** Whether the Tabs are disabled. */
  isDisabled?: boolean;
  /** Whether the tabs are displayed in a quiet style. */
  isQuiet?: boolean;
  /** Whether the tabs are displayed in an emphasized style. */
  isEmphasized?: boolean;
  /** The amount of space between the tabs. */
  density?: "compact" | "regular";
  /** The currently selected key in the collection (controlled). */
  selectedKey?: Key;
  /** The initial selected keys in the collection (uncontrolled). */
  defaultSelectedKey?: Key;
  /** Handler that is called when the selection changes. */
  onSelectionChange?: (key: Key) => void;
  /**
   * Whether tabs are activated automatically on focus or manually.
   *
   * @default 'automatic'
   */
  keyboardActivation?: "automatic" | "manual";
  /**
   * The orientation of the tabs.
   *
   * @default 'horizontal'
   */
  orientation?: Orientation;
}

export interface SpectrumTabListProps<T> extends DOMProps, StyleProps {
  /**
   * The tab items to display. Item keys should match the key of the corresponding `<Item>` within
   * the `<TabPanels>` element.
   */
  children: CollectionChildren<T>;
}

export interface SpectrumTabPanelsProps<T> extends DOMProps, StyleProps {
  /**
   * The contents of each tab. Item keys should match the key of the corresponding `<Item>` within
   * the `<TabList>` element.
   */
  children: CollectionChildren<T>;
}
