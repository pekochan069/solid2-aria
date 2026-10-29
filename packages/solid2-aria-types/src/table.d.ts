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
 * Derived from Adobe React Spectrum: packages/@react-types/table/src/index.d.ts.
 * Modified for Solid Aria: adapted type declarations, imports, and formatting for Solid.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type {
  MultipleSelection,
  Sortable,
  Expandable,
  AsyncLoadable,
  LinkDOMProps,
  Key,
  LoadingState,
  Collection,
  Node,
  SpectrumSelectionProps,
  DOMProps,
  AriaLabelingProps,
} from "@solid2-aria/types-shared";
import type { StyleProps } from "@solid2-aria/types-shared-web";
import type { JSX } from "@solidjs/web";

export interface TableProps<T> extends MultipleSelection, Sortable, Expandable {
  /** The elements that make up the table. Includes the TableHeader, TableBody, Columns, and Rows. */
  children: [JSX.Element, JSX.Element];
  /** A list of row keys to disable. */
  disabledKeys?: Iterable<Key>;
  /**
   * Whether pressing the escape key should clear selection in the table or not.
   *
   * Most experiences should not modify this option as it eliminates a keyboard user's ability to
   * easily clear selection. Only use if the escape key is being handled externally or should not
   * trigger selection clearing contextually.
   *
   * @default 'clearSelection'
   */
  escapeKeyBehavior?: "clearSelection" | "none";
  /** Whether selection should occur on press up instead of press down. */
  shouldSelectOnPressUp?: boolean;
  /** The id of the column that displays hierarchical data. */
  treeColumn?: Key;
  /**
   * Whether keyboard navigation to focusable elements within the cells is
   * via the left/right arrow keys or the tab key.
   *
   * @default 'arrow'
   */
  keyboardNavigationBehavior?: "arrow" | "tab";
}

export interface TableHeaderProps<T> {
  /** A list of table columns. */
  columns?: readonly T[];
  /**
   * A list of `Column(s)` or a function. If the latter, a list of columns must be provided using
   * the `columns` prop.
   */
  children: ColumnElement<T> | ColumnElement<T>[] | ColumnRenderer<T>;
}

export type ColumnElement<T> = JSX.Element;

export interface ColumnProps<T> {
  /** Rendered contents of the column if `children` contains child columns. */
  title?: JSX.Element;
  /** Static child columns or content to render as the column header. */
  children: JSX.Element | ColumnElement<T>[];
  /** A list of child columns used when dynamically rendering nested child columns. */
  childColumns?: T[];
  /** The width of the column. */
  width?: ColumnSize | null;
  /** The minimum width of the column. */
  minWidth?: ColumnStaticSize | null;
  /** The maximum width of the column. */
  maxWidth?: ColumnStaticSize | null;
  /** The default width of the column. */
  defaultWidth?: ColumnSize | null;
  /** Whether the column allows resizing. */
  allowsResizing?: boolean;
  /** Whether the column allows sorting. */
  allowsSorting?: boolean;
  /**
   * Whether a column is a [row header](https://www.w3.org/TR/wai-aria-1.1/#rowheader) and should be
   * announced by assistive technology during row navigation.
   */
  isRowHeader?: boolean;
  /** A string representation of the column's contents, used for accessibility announcements. */
  textValue?: string;
}

export type ColumnSize = ColumnStaticSize | ColumnDynamicSize;

export type ColumnStaticSize = number | `${number}` | `${number}%`;

export type ColumnDynamicSize = `${number}fr`;

export type ColumnRenderer<T> = (item: T) => ColumnElement<T>;

export interface TableBodyProps<T> extends Omit<AsyncLoadable, "isLoading"> {
  /** The contents of the table body. Supports static items or a function for dynamic rendering. */
  children: RowElement<T> | RowElement<T>[] | ((item: T) => RowElement<T>);
  /** A list of row objects in the table body used when dynamically rendering rows. */
  items?: Iterable<T>;
  /** The current loading state of the table. */
  loadingState?: LoadingState;
}

export type RowElement<T> = JSX.Element;

export interface RowProps<T> extends LinkDOMProps {
  /**
   * A list of child item objects used when dynamically rendering row children. Requires the feature
   * flag to be enabled along with UNSTABLE_allowsExpandableRows, see
   * https://react-spectrum.adobe.com/react-spectrum/TableView.html#expandable-rows.
   *
   * @private
   * @version alpha
   */
  UNSTABLE_childItems?: Iterable<T>;
  // Follow-up: update when async loading is supported for expandable rows
  // /** Whether this row has children, even if not loaded yet. */
  // hasChildItems?: boolean,
  /** Rendered contents of the row or row child items. */
  children: CellElement | CellElement[] | CellRenderer;
  /** A string representation of the row's contents, used for features like typeahead. */
  // ???
  textValue?: string;
}

export type CellElement = JSX.Element;

export interface CellProps {
  /** The contents of the cell. */
  children: JSX.Element;
  /** A string representation of the cell's contents, used for features like typeahead. */
  textValue?: string;
  /** Indicates how many columns the data cell spans. */
  colSpan?: number;
}

export type CellRenderer = (columnKey: Key) => CellElement;

interface ITableCollection<T> extends IGridCollection<T> {
  // Follow-up perhaps elaborate on this? maybe not clear enough, essentially returns the table header rows (e.g. in a tiered headers table, will return the nodes containing the top tier column, next tier, etc)
  /** A list of header row nodes in the table. */
  headerRows: GridNode<T>[];
  /** A list of column nodes in the table. */
  columns: GridNode<T>[];
  /**
   * A set of column keys that serve as the [row
   * header](https://www.w3.org/TR/wai-aria-1.1/#rowheader).
   */
  rowHeaderColumnKeys: Set<Key>;
  /** The node that makes up the header of the table. */
  head?: GridNode<T>;
  /** The node that makes up the body of the table. */
  body: GridNode<T>;
}

interface IGridCollection<T> extends Collection<GridNode<T>> {
  /** The number of columns in the grid. */
  columnCount: number;
  /** A list of rows in the grid. */
  rows: GridNode<T>[];
}

interface GridNode<T> extends Node<T> {
  column?: GridNode<T>;
  /**
   * The number of columns spanned by this cell. Use `colSpan` instead.
   *
   * @deprecated
   */
  colspan?: number;
  /** The number of columns spanned by this cell. */
  colSpan?: number | null;
  /** The column index of this cell, accounting for any colSpans. */
  colIndex?: number | null;
  /** The index of this node within its parent, ignoring sibling nodes that aren't of the same type. */
  indexOfType?: number;
}

export interface SpectrumColumnProps<T> extends ColumnProps<T> {
  /**
   * The alignment of the column's contents relative to its allotted width.
   *
   * @default 'start'
   */
  align?: "start" | "center" | "end";
  // /** Whether the column should stick to the viewport when scrolling. */
  // shouldStick?? Not implemented yet?
  // isSticky?: boolean,
  /** Whether the column should render a divider between it and the next column. */
  showDivider?: boolean;
  /**
   * Whether the column should hide its header text. A tooltip with the column's header text will be
   * displayed when the column header is focused instead. Note that this prop is specifically for
   * columns that contain ActionButtons in place of text content.
   */
  hideHeader?: boolean;
}

export interface SpectrumTableProps<T>
  extends
    TableProps<T>,
    SpectrumSelectionProps,
    DOMProps,
    AriaLabelingProps,
    StyleProps {
  /**
   * Sets the amount of vertical padding within each cell.
   *
   * @default 'regular'
   */
  density?: "compact" | "regular" | "spacious";
  /**
   * Sets the overflow behavior for the cell contents.
   *
   * @default 'truncate'
   */
  overflowMode?: "wrap" | "truncate";
  /** Whether the TableView should be displayed with a quiet style. */
  isQuiet?: boolean;
  /** Sets what the TableView should render when there is no content to display. */
  renderEmptyState?: () => JSX.Element;
  /** Handler that is called when a user performs an action on a row. */
  onAction?: (key: Key) => void;
  /**
   * Handler that is called when a user starts a column resize.
   */
  onResizeStart?: (widths: Map<Key, ColumnSize>) => void;
  /**
   * Handler that is called when a user performs a column resize.
   * Can be used with the width property on columns to put the column widths into
   * a controlled state.
   */
  onResize?: (widths: Map<Key, ColumnSize>) => void;
  /**
   * Handler that is called after a user performs a column resize.
   * Can be used to store the widths of columns for another future session.
   */
  onResizeEnd?: (widths: Map<Key, ColumnSize>) => void;
}

export type TableCollection<T> = ITableCollection<T>;
