/*
 * Derived from Adobe React Spectrum: packages/react-aria-components/src/Table.tsx.
 * Modified for Solid Aria: preserve table collection, sorting and sizing algorithms with Solid contexts, collection descriptors and reactive accessibility primitives; uses Solid class props.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import {
  BaseCollection,
  CollectionNode,
  FilterableNode,
  LoaderNode,
} from "@solid2-aria/core/collections/base-collection";
import {
  Collection,
  CollectionBuilder,
  createLeafComponent,
  createBranchComponent,
} from "@solid2-aria/core/collections/collection-builder";
import { createCachedChildren } from "@solid2-aria/core/collections/create-cached-children";
import { createFocusRing } from "@solid2-aria/core/focus/create-focus-ring";
import { createLocalizedStringFormatter } from "@solid2-aria/core/i18n/create-localized-string-formatter";
import { createLocale } from "@solid2-aria/core/i18n/i18n-provider";
import { createHover } from "@solid2-aria/core/interactions/create-hover";
import { createTable } from "@solid2-aria/core/table/create-table";
import { createTableCell } from "@solid2-aria/core/table/create-table-cell";
import { createTableColumnHeader } from "@solid2-aria/core/table/create-table-column-header";
import { createTableColumnResize } from "@solid2-aria/core/table/create-table-column-resize";
import { createTableHeaderRow } from "@solid2-aria/core/table/create-table-header-row";
import { createTableRow } from "@solid2-aria/core/table/create-table-row";
import { createTableRowGroup } from "@solid2-aria/core/table/create-table-row-group";
import {
  createTableSelectionCheckbox,
  createTableSelectAllCheckbox,
} from "@solid2-aria/core/table/create-table-selection-checkbox";
import { createLoadMoreSentinel } from "@solid2-aria/core/utils/create-load-more-sentinel";
import type { LoadMoreSentinelProps } from "@solid2-aria/core/utils/create-load-more-sentinel";
import { filterDOMProps } from "@solid2-aria/core/utils/filter-dom-props";
import { isPresent } from "@solid2-aria/core/utils/is-present";
import { mergeProps } from "@solid2-aria/core/utils/merge-props";
import { requireValue } from "@solid2-aria/core/utils/require-value";
import { isTruthy } from "@solid2-aria/core/utils/truthy";
import type { GridNode } from "@solid2-aria/stately/grid/grid-collection";
import type {
  ColumnSize,
  ColumnStaticSize,
} from "@solid2-aria/stately/table/column";
import { createTableColumnResizeState } from "@solid2-aria/stately/table/create-table-column-resize-state";
import type { TableColumnResizeState } from "@solid2-aria/stately/table/create-table-column-resize-state";
import { createTableState } from "@solid2-aria/stately/table/create-table-state";
import type {
  TableState,
  TableProps as SharedTableProps,
} from "@solid2-aria/stately/table/create-table-state";
import { buildHeaderRows } from "@solid2-aria/stately/table/table-collection";
import type { ITableCollection } from "@solid2-aria/stately/table/table-collection";
import { createControlledSignal } from "@solid2-aria/stately/utils/create-controlled-signal";
import { getNodeProps } from "@solid2-aria/stately/utils/get-node-props";
import type {
  Key,
  Node,
  LinkDOMProps,
  HoverEvents,
  PressEvents,
  SelectionMode,
  SelectionBehavior,
  DisabledBehavior,
  SortDirection,
  AriaLabelingProps,
} from "@solid2-aria/types-shared";
import type { GlobalDOMAttributes } from "@solid2-aria/types-shared-web";
import { dynamic, Portal } from "@solidjs/web";
import type { JSX } from "@solidjs/web";
import {
  merge,
  untrack,
  createSignal,
  createContext,
  useContext,
  createMemo,
  omit,
  onSettled,
} from "solid-js";
import type { Accessor } from "solid-js";

import intlMessages from "../intl";
import { ButtonContext } from "./button";
import { CheckboxContext, CheckboxFieldContext } from "./checkbox";
import {
  CollectionRendererContext,
  DefaultCollectionRenderer,
} from "./collection";
import type { CollectionProps, ItemRenderProps } from "./collection";
import type { DragAndDropHooks } from "./create-drag-and-drop";
import {
  DragAndDropContext,
  DropIndicatorContext,
  createDndPersistedKeys,
  createRenderDropIndicator,
} from "./drag-and-drop";
import {
  RootDropIndicator,
  createCollectionDragAndDrop,
  CollectionDropIndicator,
} from "./grid-list";
import { SelectionIndicatorContext } from "./selection-indicator";
import { TreeDropTargetDelegate } from "./tree-drop-target-delegate";
import {
  assignRef,
  dom,
  DEFAULT_SLOT,
  createContextProps,
  createRenderProps,
} from "./utils";
import type {
  ClassOrFunction,
  ContextValue,
  RenderProps,
  StyleRenderProps,
  StyleProps,
  SlotProps,
  DOMProps,
  DOMRenderProps,
  Ref,
} from "./utils";

class TableHeaderNode<T> extends CollectionNode<T> {
  static override readonly type = "tableheader";
}

class TableColumnNode extends CollectionNode<unknown> {
  static override readonly type = "column";
}

class TableBodyNode<T> extends FilterableNode<T> {
  static override readonly type = "tablebody";
}

class TableFooterNode<T> extends FilterableNode<T> {
  static override readonly type = "tablefooter";
}

class TableRowNode<T> extends CollectionNode<T> {
  static override readonly type = "item";
  override filter(
    collection: BaseCollection<T>,
    newCollection: BaseCollection<T>,
    filterFn: (text: string, node: Node<T>) => boolean
  ): this | null {
    for (const cell of collection.getChildren(this.key)) {
      if (filterFn(cell.textValue, cell)) {
        const clone = this.clone();
        newCollection.addDescendants(clone, collection);

        return clone;
      }
    }

    return null;
  }
}

class TableCellNode extends CollectionNode<unknown> {
  static override readonly type = "cell";
}

class TableCollection<T>
  extends BaseCollection<T>
  implements ITableCollection<T>
{
  headerRows: GridNode<T>[] = [];
  columns: GridNode<T>[] = [];
  rows: GridNode<T>[] = [];
  rowHeaderColumnKeys = new Set<Key>();
  head = new TableHeaderNode<T>(-1);
  columnsDirty = true;
  expandedKeys = new Set<Key>();

  withExpandedKeys(expandedKeys: Set<Key>) {
    const collection = this.clone();
    collection.expandedKeys = expandedKeys;
    collection.frozen = this.frozen;
    collection.rows = [...collection.getRows()];

    return collection;
  }

  override addNode(node: CollectionNode<T>) {
    super.addNode(node);

    this.columnsDirty ||= node.type === "column";

    if (node.type === "tableheader") {
      this.head = node;
    }
  }

  private getRows(): GridNode<T>[] {
    const rows: GridNode<T>[] = [];

    for (const child of this) {
      if (child.type === "tablebody" || child.type === "tablefooter") {
        rows.push(...this.getChildren(child.key));
      }
    }

    return rows;
  }

  // backward compatibility
  get body() {
    for (const child of this) {
      if (child.type === "tablebody") {
        return child;
      }
    }

    return new TableBodyNode<T>(-2);
  }

  override commit(firstKey: Key, lastKey: Key, isSSR = false) {
    this.updateColumns(isSSR);

    this.firstKey = firstKey;
    this.lastKey = lastKey;
    this.rows = [];

    for (const row of this.getRows()) {
      const { lastChildKey } = row;

      if (isPresent(lastChildKey)) {
        let lastCell = this.getItem(lastChildKey);

        while (lastCell && lastCell.type !== "cell") {
          lastCell = isPresent(lastCell.prevKey)
            ? this.getItem(lastCell.prevKey)
            : null;
        }

        if (lastCell) {
          const numberOfCellsInRow =
            (lastCell.colIndex ?? lastCell.index) + (lastCell.colSpan ?? 1);

          if (numberOfCellsInRow !== this.columns.length && !isSSR) {
            throw new Error(
              `Cell count must match column count. Found ${numberOfCellsInRow} cells and ${this.columns.length} columns.`
            );
          }
        }
      }

      this.rows.push(row);
    }

    super.commit(firstKey, lastKey, isSSR);
  }

  private updateColumns(isSSR: boolean) {
    if (!this.columnsDirty) {
      return;
    }

    this.rowHeaderColumnKeys = new Set();
    this.columns = [];
    const columnKeyMap = new Map<Key, GridNode<T>>();

    const visit = (node: Node<T>) => {
      switch (node.type) {
        case "column": {
          columnKeyMap.set(node.key, node);

          if (!node.hasChildNodes) {
            node.index = this.columns.length;
            this.columns.push(node);

            if (isTruthy(getNodeProps(node).isRowHeader)) {
              this.rowHeaderColumnKeys.add(node.key);
            }
          }

          break;
        }

        default: {
          break;
        }
      }

      for (const child of this.getChildren(node.key)) {
        visit(child);
      }
    };

    for (const node of this.getChildren(this.head.key)) {
      visit(node);
    }

    this.headerRows = buildHeaderRows(columnKeyMap, this.columns);
    this.columnsDirty = false;

    if (
      this.rowHeaderColumnKeys.size === 0 &&
      this.columns.length > 0 &&
      !isSSR
    ) {
      throw new Error(
        "A table must have at least one Column with the isRowHeader prop set to true"
      );
    }
  }

  get columnCount() {
    return this.columns.length;
  }

  override *[Symbol.iterator]() {
    let key = this.firstKey;

    while (isPresent(key)) {
      const node = this.getItem(key);

      if (node) {
        yield node;
      }

      key = node?.nextKey ?? null;
    }
  }

  override getFirstKey() {
    for (const child of this) {
      if (child.type === "tablebody") {
        return child.firstChildKey ?? null;
      }
    }

    return null;
  }

  override getLastKey() {
    const key = this.lastKey;

    if (!isPresent(key)) {
      return null;
    }

    let node = requireValue(this.getItem(key), "Expected this.getItem(key)");

    while (
      isPresent(node?.lastChildKey) &&
      (node.type !== "item" || this.expandedKeys.has(node.key))
    ) {
      node = requireValue(
        this.getItem(node.lastChildKey),
        "Expected this.getItem(node.lastChildKey)"
      );
    }

    return node?.key;
  }

  override getKeyAfter(key: Key) {
    const node = requireValue(this.getItem(key), "Expected this.getItem(key)");

    if (node?.type === "column") {
      return node.nextKey ?? null;
    }

    if (!isTruthy(node)) {
      return null;
    }

    // If this is an expanded item, return the first child item if unknown.
    if (
      node.type === "item" &&
      isPresent(node.firstChildKey) &&
      this.expandedKeys.has(node.key)
    ) {
      let child = this.getItem(node.firstChildKey);

      while (child) {
        if (child.type === "item") {
          return child.key;
        }

        child = isPresent(child.nextKey) ? this.getItem(child.nextKey) : null;
      }
    }

    return super.getKeyAfter(key);
  }

  override getKeyBefore(key: Key) {
    let node = requireValue(this.getItem(key), "Expected this.getItem(key)");

    if (node?.type === "column") {
      return node.prevKey ?? null;
    }

    if (!isTruthy(node)) {
      return null;
    }

    let k: Key | null = null;

    if (isPresent(node.prevKey)) {
      node = requireValue(
        this.getItem(node.prevKey),
        "Expected this.getItem(node.prevKey)"
      );

      // Traverse to the deepest expanded child.
      while (
        Boolean(node) &&
        (node.type !== "item" || this.expandedKeys.has(node.key)) &&
        isPresent(node.lastChildKey)
      ) {
        node = requireValue(
          this.getItem(node.lastChildKey),
          "Expected this.getItem(node.lastChildKey)"
        );
      }

      k = node?.key ?? null;
    }

    k ??= node.parentKey;

    if (isPresent(k) && this.getItem(k)?.type === "tableheader") {
      return null;
    }

    return k;
  }

  private *headerChildren(key: Key): IterableIterator<CollectionNode<T>> {
    const header = this.headerRows.find((row) => row.key === key);

    if (!header) {
      return;
    }

    // oxlint-disable-next-line typescript/no-deprecated -- buildHeaderRows returns synthetic headers with the upstream childNodes output contract.
    for (const child of header.childNodes) {
      yield child instanceof CollectionNode
        ? child
        : Object.assign(new CollectionNode<T>(child.key), child);
    }
  }

  override *getChildren(key: Key): IterableIterator<CollectionNode<T>> {
    const parent = this.getItem(key);

    if (!parent) {
      yield* this.headerChildren(key);

      return;
    }

    let node = isPresent(parent?.firstChildKey)
      ? this.getItem(parent.firstChildKey)
      : null;

    const flattenRows =
      parent?.type === "tablebody" || parent?.type === "tablefooter";

    while (node) {
      yield node;
      const nextKey = flattenRows ? this.getKeyAfter(node.key) : node.nextKey;
      node = isPresent(nextKey) ? this.getItem(nextKey) : null;

      if (flattenRows && node?.parentKey === parent?.parentKey) {
        break;
      }

      if (!flattenRows && parent?.type === "item" && node?.type !== "cell") {
        break;
      }
    }
  }

  override clone() {
    const collection = super.clone();
    collection.headerRows = this.headerRows;
    collection.columns = this.columns;
    collection.rows = this.rows;
    collection.rowHeaderColumnKeys = this.rowHeaderColumnKeys;
    collection.head = this.head;

    return collection;
  }

  getTextValue(key: Key): string {
    const row = this.getItem(key);

    if (!row) {
      return "";
    }

    // If the row has a textValue, use that.
    if (row.textValue) {
      return row.textValue;
    }

    // Otherwise combine the text of each of the row header columns.
    const { rowHeaderColumnKeys } = this;
    const text: string[] = [];

    for (const cell of this.getChildren(key)) {
      const column = this.columns[cell.index];

      if (column && rowHeaderColumnKeys.has(column.key) && cell.textValue) {
        text.push(cell.textValue);
      }

      if (text.length === rowHeaderColumnKeys.size) {
        break;
      }
    }

    return text.join(" ");
  }
}

export interface ResizableTableContainerProps
  extends
    DOMProps,
    DOMRenderProps<"div", undefined>,
    GlobalDOMAttributes<HTMLDivElement> {
  class?: JSX.ClassValue;

  onResizeStart?: (widths: Map<Key, ColumnSize>) => void;

  onResize?: (widths: Map<Key, ColumnSize>) => void;

  onResizeEnd?: (widths: Map<Key, ColumnSize>) => void;
}

export interface TableRenderProps {
  isFocused: boolean;

  isFocusVisible: boolean;

  isDropTarget: boolean;

  state: TableState<unknown>;
}

export interface TableProps
  extends
    Omit<SharedTableProps<unknown>, "children">,
    StyleRenderProps<TableRenderProps, "table" | "div">,
    SlotProps,
    AriaLabelingProps,
    GlobalDOMAttributes<HTMLTableElement> {
  class?: ClassOrFunction<TableRenderProps>;

  children?: JSX.Element;

  selectionBehavior?: SelectionBehavior;

  disabledBehavior?: DisabledBehavior;

  onRowAction?: (key: Key) => void;

  dragAndDropHooks?: DragAndDropHooks;
}

export interface TableOptionsContextValue {
  selectionMode: SelectionMode;

  selectionBehavior: SelectionBehavior | null;

  disallowEmptySelection: boolean;

  allowsDragging: boolean;
}

export interface TableHeaderRenderProps {
  isHovered: boolean;
}

export interface TableHeaderProps<T>
  extends
    StyleRenderProps<TableHeaderRenderProps, "thead" | "div">,
    HoverEvents,
    GlobalDOMAttributes<HTMLTableSectionElement> {
  class?: ClassOrFunction<TableHeaderRenderProps>;

  columns?: Iterable<T>;

  children?: JSX.Element | ((item: T) => JSX.Element);

  dependencies?: readonly unknown[];
}

export interface ColumnRenderProps {
  isHovered: boolean;

  isPressed: boolean;

  isFocused: boolean;

  isFocusVisible: boolean;

  allowsSorting: boolean;

  sortDirection: SortDirection | undefined;

  isResizing: boolean;

  sort: (direction: SortDirection) => void;

  startResize: () => void;
}

export interface ColumnProps
  extends
    RenderProps<ColumnRenderProps, "th" | "div">,
    GlobalDOMAttributes<HTMLTableCellElement> {
  class?: ClassOrFunction<ColumnRenderProps>;

  id?: Key;

  allowsSorting?: boolean;

  isRowHeader?: boolean;

  textValue?: string;

  width?: ColumnSize | null;

  defaultWidth?: ColumnSize | null;

  minWidth?: ColumnStaticSize | null;

  maxWidth?: ColumnStaticSize | null;

  focusMode?: "child" | "cell";

  allowsArrowNavigation?: boolean;
}

export interface ColumnResizerRenderProps {
  isHovered: boolean;

  isFocused: boolean;

  isFocusVisible: boolean;

  isResizing: boolean;

  resizableDirection: "right" | "left" | "both";
}

export interface ColumnResizerProps
  extends
    HoverEvents,
    RenderProps<ColumnResizerRenderProps>,
    GlobalDOMAttributes<HTMLDivElement> {
  class?: ClassOrFunction<ColumnResizerRenderProps>;

  "aria-label"?: string;
}

export interface TableBodyRenderProps {
  isEmpty: boolean;

  isDropTarget: boolean;
}

export interface TableBodyProps<T>
  extends
    Omit<CollectionProps<T>, "disabledKeys">,
    StyleRenderProps<TableBodyRenderProps, "tbody" | "div">,
    GlobalDOMAttributes<HTMLTableSectionElement> {
  class?: ClassOrFunction<TableBodyRenderProps>;

  renderEmptyState?: (props: TableBodyRenderProps) => JSX.Element;
}

export interface TableFooterProps<T>
  extends
    Omit<CollectionProps<T>, "disabledKeys">,
    StyleProps,
    GlobalDOMAttributes<HTMLTableSectionElement> {
  class?: JSX.ClassValue;
}

export interface RowRenderProps extends ItemRenderProps {
  isFocusVisibleWithin: boolean;

  id?: Key;

  isExpanded: boolean;

  hasChildItems: boolean;

  level: number;

  state: TableState<unknown>;
}

export interface RowFocusContextValue {
  isFocusVisibleWithinRow: boolean;
}

export interface RowProps<T>
  extends
    StyleRenderProps<RowRenderProps, "tr" | "div">,
    LinkDOMProps,
    HoverEvents,
    PressEvents,
    Omit<GlobalDOMAttributes<HTMLTableRowElement>, "onClick"> {
  class?: ClassOrFunction<RowRenderProps>;

  columns?: Iterable<T>;

  children?: JSX.Element | ((item: T) => JSX.Element);

  value?: T;

  dependencies?: readonly unknown[];

  textValue?: string;

  isDisabled?: boolean;

  disabledBehavior?: DisabledBehavior;

  onAction?: () => void;

  id?: Key;

  hasChildItems?: boolean;
}

export interface CellRenderProps {
  isPressed: boolean;

  isFocused: boolean;

  isFocusVisible: boolean;

  isHovered: boolean;

  isSelected: boolean;

  isDisabled: boolean;

  isFocusVisibleWithinRow: boolean;

  id?: Key;

  columnIndex?: number | null;

  isTreeColumn: boolean;

  isExpanded: boolean;

  hasChildItems: boolean;

  level: number;
}

export interface CellProps
  extends
    RenderProps<CellRenderProps, "td" | "div">,
    GlobalDOMAttributes<HTMLTableCellElement> {
  class?: ClassOrFunction<CellRenderProps>;

  id?: Key;

  textValue?: string;

  colSpan?: number;

  focusMode?: "child" | "cell";

  allowsArrowNavigation?: boolean;
}

export interface TableLoadMoreItemProps
  extends
    Omit<LoadMoreSentinelProps, "collection">,
    StyleProps,
    DOMRenderProps<"tr" | "div", undefined>,
    GlobalDOMAttributes<HTMLTableRowElement> {
  class?: JSX.ClassValue;

  children?: JSX.Element;

  isLoading?: boolean;
}

export const TableContext =
  createContext<ContextValue<TableProps, HTMLTableElement>>(null);

export const TableStateContext = createContext<TableState<unknown> | null>(
  null
);

export const TableColumnResizeStateContext =
  createContext<TableColumnResizeState<unknown> | null>(null);

export const RowFocusContext = createContext<RowFocusContextValue>({
  isFocusVisibleWithinRow: false,
});

const TableOptionsContext = createContext<TableOptionsContextValue | null>(
  null
);

const ResizableTableContainerContext = createContext<
  | (Pick<
      ResizableTableContainerProps,
      "onResizeStart" | "onResize" | "onResizeEnd"
    > & {
      tableWidth: number;
      tableRef: Accessor<HTMLTableElement | null>;
      setTableRef: (element: HTMLTableElement) => void;
    })
  | null
>(null);

const ColumnResizerContext = createContext<{
  column: GridNode<unknown>;
  triggerRef: Accessor<HTMLElement | null>;
} | null>(null);

export function createTableOptions(): TableOptionsContextValue {
  const options = useContext(TableOptionsContext);

  if (!options) {
    throw new Error("Table options require a Table.");
  }

  return options;
}

export function ResizableTableContainer(
  props: ResizableTableContainerProps & { ref?: Ref<HTMLDivElement> }
) {
  const [ref, setRef] = createSignal<HTMLElement | null>(null, {
    ownedWrite: true,
  });

  const [tableRef, setTableRef] = createSignal<HTMLTableElement | null>(null, {
    ownedWrite: true,
  });

  const [width, setWidth] = createSignal(0);
  onSettled((): undefined | (() => void) => {
    let measured: HTMLElement | null = tableRef();

    while (
      measured &&
      measured !== ref() &&
      measured.scrollWidth <= measured.clientWidth
    ) {
      measured = measured.parentElement;
    }

    measured ??= ref();

    if (!measured) {
      return undefined;
    }

    const element = measured;
    setWidth(element.clientWidth);

    const observer = new ResizeObserver(() => {
      setWidth(element.clientWidth);
    });

    observer.observe(element, { box: "border-box" });

    return () => {
      observer.disconnect();
    };
  });

  const context = mergeProps(props, {
    setTableRef: (element: HTMLTableElement) => {
      setTableRef(element);
    },
    tableRef,
    get tableWidth() {
      return width();
    },
  });

  return (
    <dom.div
      {...filterDOMProps(props, { global: true })}
      render={props.render}
      class={props.class ?? "solid2-aria-ResizableTableContainer"}
      style={props.style}
      ref={[
        (element: HTMLElement) => {
          setRef(element);
        },
        (element: HTMLDivElement) => {
          assignRef(
            untrack(() => props.ref),
            element
          );
        },
      ]}
    >
      <ResizableTableContainerContext value={context}>
        {props.children}
      </ResizableTableContainerContext>
    </dom.div>
  );
}

export function Table(input: TableProps & { ref?: Ref<HTMLTableElement> }) {
  const [props, ref, setRef] = createContextProps(
    input,
    untrack(() => input.ref),
    TableContext
  );

  return (
    <CollectionBuilder
      createCollection={() => new TableCollection<unknown>()}
      content={<Collection>{props.children}</Collection>}
    >
      {(collection) => (
        <TableInner
          props={props}
          collection={collection}
          elementRef={ref}
          setElementRef={(element: HTMLTableElement) => {
            setRef(element);
          }}
        />
      )}
    </CollectionBuilder>
  );
}

function TableInner(outer: {
  props: TableProps;
  collection: TableCollection<unknown>;
  elementRef: Accessor<HTMLTableElement | null>;
  setElementRef: (element: HTMLTableElement) => void;
}) {
  const { props } = untrack(() => outer);
  const renderer = useContext(CollectionRendererContext);
  const container = useContext(ResizableTableContainerContext);

  const [expanded, setExpanded] = createControlledSignal(
    () => (props.expandedKeys ? new Set(props.expandedKeys) : undefined),
    new Set(props.defaultExpandedKeys),
    (keys) => {
      props.onExpandedChange?.(keys);
    }
  );

  const collection = createMemo(() =>
    outer.collection.withExpandedKeys(expanded())
  );

  // oxlint-disable-next-line typescript/no-explicit-any -- The public collection accepts primitive items; this state adapter only reads their keyed nodes.
  const state = createTableState<any>(
    mergeProps(props, {
      children: undefined,
      get collection() {
        return collection();
      },
      get expandedKeys() {
        return expanded();
      },
      onExpandedChange: setExpanded,
    })
  );

  const aria = createTable(
    mergeProps(props, {
      get isVirtualized() {
        return renderer.isVirtualized;
      },
      get layoutDelegate() {
        return renderer.layoutDelegate;
      },
    }),
    state,
    untrack(() => outer.elementRef)
  );

  const resize = container
    ? createTableColumnResizeState(
        {
          get tableWidth() {
            return container.tableWidth;
          },
        },
        state
      )
    : null;

  const locale = createLocale();
  const treeDelegate = new TreeDropTargetDelegate<unknown>();

  if (props.dragAndDropHooks?.createDroppableCollectionState) {
    const hooks = props.dragAndDropHooks;
    treeDelegate.setup(
      hooks.dropTargetDelegate ??
        renderer.dropTargetDelegate ??
        new hooks.ListDropTargetDelegate(
          {
            [Symbol.iterator]() {
              return state.collection.rows[Symbol.iterator]();
            },
          },
          untrack(() => outer.elementRef)
        ),
      state,
      locale.direction
    );
  }

  const dnd = createCollectionDragAndDrop({
    get collection() {
      return state.collection;
    },
    get dropTargetCollection() {
      return state.collection.rows;
    },
    dropTargetDelegate: treeDelegate,
    get hooks() {
      return props.dragAndDropHooks;
    },
    get ref() {
      return outer.elementRef;
    },
    get selectionManager() {
      return state.selectionManager;
    },
  });

  const focus = createFocusRing();

  const values: TableRenderProps = {
    get isDropTarget() {
      return dnd.dropState?.isDropTarget({ type: "root" }) === true;
    },
    get isFocusVisible() {
      return focus.isFocusVisible;
    },
    get isFocused() {
      return focus.isFocused;
    },
    state,
  };

  const render = createRenderProps(
    mergeProps(props, {
      children: undefined,
      defaultClass: "solid2-aria-Table",
      values,
    })
  );

  const Root = renderer.CollectionRoot;

  const Tag = dynamic(() =>
    renderer.isVirtualized === true ? dom.div : dom.table
  );

  const options: TableOptionsContextValue = {
    get allowsDragging() {
      return !!dnd.dragState;
    },
    get disallowEmptySelection() {
      return props.disallowEmptySelection === true;
    },
    get selectionBehavior() {
      return state.selectionManager.selectionMode === "none"
        ? null
        : state.selectionManager.selectionBehavior;
    },
    get selectionMode() {
      return state.selectionManager.selectionMode;
    },
  };

  return (
    <Tag
      {...mergeProps(
        filterDOMProps(props, { global: true }),
        render,
        merge(() => aria.gridProps ?? {}),
        merge(() => focus.focusProps ?? {}),
        merge(() => dnd.collectionProps ?? {})
      )}
      ref={(element: HTMLTableElement) => {
        outer.setElementRef(element);

        if (container) {
          container.setTableRef(element);
        }
      }}
      slot={props.slot ?? undefined}
      data-focused={focus.isFocused || undefined}
      data-focus-visible={focus.isFocusVisible || undefined}
      data-drop-target={values.isDropTarget || undefined}
    >
      <TableStateContext value={state}>
        <TableColumnResizeStateContext value={resize}>
          <TableOptionsContext value={options}>
            <DragAndDropContext value={dnd}>
              <DropIndicatorContext
                value={{
                  render: (indicatorProps, ref) => (
                    <CollectionDropIndicator
                      {...indicatorProps}
                      ref={ref}
                      table={!(renderer.isVirtualized === true)}
                      columnCount={state.collection.columnCount}
                    />
                  ),
                }}
              >
                <Root
                  collection={state.collection}
                  scrollRef={outer.elementRef}
                  persistedKeys={createDndPersistedKeys(
                    state.selectionManager,
                    props.dragAndDropHooks,
                    dnd.dropState
                  )}
                />
              </DropIndicatorContext>
            </DragAndDropContext>
          </TableOptionsContext>
        </TableColumnResizeStateContext>
      </TableStateContext>
      {dnd.preview}
    </Tag>
  );
}

export const TableHeader = createBranchComponent(
  TableHeaderNode,
  <T,>(
    props: TableHeaderProps<T>,
    ref: Ref<HTMLTableSectionElement>,
    _node: Node<T>
  ) => {
    const state = requireValue(
      useContext(TableStateContext),
      "Expected useContext(TableStateContext)"
    );

    const renderer = useContext(CollectionRendererContext);

    const Tag = dynamic(() =>
      renderer.isVirtualized === true ? dom.div : dom.thead
    );

    const hover = createHover(props);
    const group = createTableRowGroup();

    const render = createRenderProps(
      mergeProps(props, {
        children: undefined,
        defaultClass: "solid2-aria-TableHeader",
        values: {
          get isHovered() {
            return hover.isHovered;
          },
        },
      })
    );

    const rows = createCachedChildren({
      children: (item: GridNode<unknown>) => <TableHeaderRow item={item} />,
      get items() {
        return state.collection.headerRows;
      },
    });

    return (
      <Tag
        {...mergeProps(
          filterDOMProps(props, { global: true }),
          merge(() => group.rowGroupProps ?? {}),
          merge(() => hover.hoverProps ?? {}),
          render
        )}
        ref={ref}
        data-hovered={hover.isHovered || undefined}
      >
        {rows()}
      </Tag>
    );
  },
  <T,>(props: TableHeaderProps<T>) => (
    <Collection items={props.columns} dependencies={props.dependencies}>
      {props.children}
    </Collection>
  )
);

function TableHeaderRow(props: { item: GridNode<unknown> }) {
  const state = requireValue(
    useContext(TableStateContext),
    "Expected useContext(TableStateContext)"
  );

  const renderer = useContext(CollectionRendererContext);

  const [ref, setRef] = createSignal<HTMLTableRowElement | null>(null, {
    ownedWrite: true,
  });

  const Tag = dynamic(() =>
    renderer.isVirtualized === true ? dom.div : dom.tr
  );

  const Branch = renderer.CollectionBranch;

  const aria = createTableHeaderRow(
    {
      isVirtualized: renderer.isVirtualized,
      get node() {
        return props.item;
      },
    },
    state,
    ref
  );

  const checkbox = createTableSelectAllCheckbox(state);

  return (
    <Tag
      {...aria.rowProps}
      ref={(element: HTMLTableRowElement) => {
        setRef(element);
      }}
    >
      <CheckboxContext
        value={{
          slots: {
            get selection() {
              return checkbox.checkboxProps;
            },
          },
        }}
      >
        <CheckboxFieldContext
          value={{
            slots: {
              get selection() {
                return checkbox.checkboxProps;
              },
            },
          }}
        >
          <Branch collection={state.collection} parent={props.item} />
        </CheckboxFieldContext>
      </CheckboxContext>
    </Tag>
  );
}

export const Column = createLeafComponent(
  TableColumnNode,
  (
    props: ColumnProps,
    forwardedRef: Ref<HTMLTableCellElement>,
    column: GridNode<unknown>
  ) => {
    const state = requireValue(
      useContext(TableStateContext),
      "Expected useContext(TableStateContext)"
    );

    const renderer = useContext(CollectionRendererContext);
    const resize = useContext(TableColumnResizeStateContext);

    const [ref, setRef] = createSignal<HTMLTableCellElement | null>(null, {
      ownedWrite: true,
    });

    const Tag = dynamic(() =>
      renderer.isVirtualized === true ? dom.div : dom.th
    );

    const aria = createTableColumnHeader(
      {
        get allowsArrowNavigation() {
          return props.allowsArrowNavigation;
        },
        get focusMode() {
          return props.focusMode;
        },
        isVirtualized: renderer.isVirtualized,
        node: column,
      },
      state,
      ref
    );

    const focus = createFocusRing();

    const hover = createHover({
      get isDisabled() {
        return !(props.allowsSorting === true);
      },
    });

    const values: ColumnRenderProps = {
      get allowsSorting() {
        return isTruthy(getNodeProps(column).allowsSorting);
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
      get isResizing() {
        return resize?.resizingColumn === column.key;
      },
      sort: (direction) => {
        state.sort(column.key, direction);
      },
      get sortDirection() {
        return state.sortDescriptor?.column === column.key
          ? state.sortDescriptor.direction
          : undefined;
      },
      startResize: () => {
        if (!resize) {
          throw new Error(
            "Wrap Table in ResizableTableContainer to enable resizing."
          );
        }

        resize.startResize(column.key);
        state.setKeyboardNavigationDisabled(true);
      },
    };

    const render = createRenderProps(
      mergeProps(props, {
        get children() {
          return column.rendered;
        },
        defaultClass: "solid2-aria-Column",
        id: undefined,
        values,
      })
    );

    return (
      <Tag
        {...mergeProps(
          omit(filterDOMProps(props, { global: true }), "id"),
          merge(() => aria.columnHeaderProps ?? {}),
          merge(() => focus.focusProps ?? {}),
          merge(() => hover.hoverProps ?? {}),
          render
        )}
        style={
          resize
            ? mergeProps(typeof render.style === "object" ? render.style : {}, {
                width: resize.getColumnWidth(column.key),
              })
            : render.style
        }
        ref={(element: HTMLTableCellElement) => {
          setRef(element);
        }}
        data-hovered={hover.isHovered || undefined}
        data-pressed={aria.isPressed || undefined}
        data-focused={focus.isFocused || undefined}
        data-focus-visible={focus.isFocusVisible || undefined}
        data-resizing={values.isResizing || undefined}
        data-allows-sorting={values.allowsSorting || undefined}
        data-sort-direction={values.sortDirection}
      >
        <ColumnResizerContext value={{ column, triggerRef: ref }}>
          <CollectionRendererContext value={DefaultCollectionRenderer}>
            {render.children}
          </CollectionRendererContext>
        </ColumnResizerContext>
      </Tag>
    );
  }
);

export function ColumnResizer(
  props: ColumnResizerProps & { ref?: Ref<HTMLDivElement> }
) {
  const resize = useContext(TableColumnResizeStateContext);
  const column = useContext(ColumnResizerContext);
  const container = useContext(ResizableTableContainerContext);

  if (!resize || !column) {
    throw new Error(
      "ColumnResizer requires a column in ResizableTableContainer."
    );
  }

  const formatter = createLocalizedStringFormatter(
    intlMessages,
    "@solid2-aria/components"
  );

  const [input, setInput] = createSignal<HTMLInputElement | null>(null, {
    ownedWrite: true,
  });

  const [ref, setRef] = createSignal<HTMLDivElement | null>(null, {
    ownedWrite: true,
  });

  const locale = createLocale();

  const aria = createTableColumnResize(
    mergeProps(container ?? {}, {
      get "aria-label"() {
        return props["aria-label"] ?? formatter.format("tableResizer");
      },
      get column() {
        return column.column;
      },
      get triggerRef() {
        return column.triggerRef;
      },
    }),
    resize,
    input
  );

  const focus = createFocusRing();
  const hover = createHover(props);

  const values: ColumnResizerRenderProps = {
    get isFocusVisible() {
      return focus.isFocusVisible;
    },
    get isFocused() {
      return focus.isFocused;
    },
    get isHovered() {
      return hover.isHovered;
    },
    get isResizing() {
      return aria.isResizing;
    },
    get resizableDirection() {
      if (
        resize.getColumnMinWidth(column.column.key) >=
        resize.getColumnWidth(column.column.key)
      ) {
        return locale.direction === "rtl" ? "right" : "left";
      }

      if (
        resize.getColumnMaxWidth(column.column.key) <=
        resize.getColumnWidth(column.column.key)
      ) {
        return locale.direction === "rtl" ? "left" : "right";
      }

      return "both";
    },
  };

  const render = createRenderProps(
    mergeProps(props, { defaultClass: "solid2-aria-ColumnResizer", values })
  );

  return (
    <dom.div
      {...mergeProps(
        filterDOMProps(props, { global: true }),
        render,
        merge(() => aria.resizerProps ?? {}),
        merge(() => hover.hoverProps ?? {})
      )}
      role="presentation"
      ref={(element: HTMLDivElement) => {
        setRef(element);
      }}
      data-hovered={hover.isHovered || undefined}
      data-focused={focus.isFocused || undefined}
      data-focus-visible={focus.isFocusVisible || undefined}
      data-resizing={aria.isResizing || undefined}
      data-resizable-direction={values.resizableDirection}
    >
      {render.children}
      <input
        {...mergeProps(
          merge(() => aria.inputProps ?? {}),
          merge(() => focus.focusProps ?? {})
        )}
        ref={(element: HTMLInputElement) => {
          setInput(element);
        }}
      />
      {aria.isMouseResizing && (
        <Portal mount={document.body}>
          <div
            style={{
              bottom: 0,
              get cursor() {
                const element = ref();

                return element ? getComputedStyle(element).cursor : undefined;
              },
              left: 0,
              position: "fixed",
              right: 0,
              top: 0,
            }}
            data-testid="cursor-overlay"
          />
        </Portal>
      )}
    </dom.div>
  );
}

export const TableBody = createBranchComponent(
  TableBodyNode,
  <T,>(
    props: TableBodyProps<T>,
    ref: Ref<HTMLTableSectionElement>,
    node: Node<T>
  ) => {
    const state = requireValue(
      useContext(TableStateContext),
      "Expected useContext(TableStateContext)"
    );

    const renderer = useContext(CollectionRendererContext);
    const dnd = useContext(DragAndDropContext);
    const Branch = renderer.CollectionBranch;

    const Tag = dynamic(() =>
      renderer.isVirtualized === true ? dom.div : dom.tbody
    );

    const RowTag = dynamic(() =>
      renderer.isVirtualized === true ? dom.div : dom.tr
    );

    const CellTag = dynamic(() =>
      renderer.isVirtualized === true ? dom.div : dom.td
    );

    const group = createTableRowGroup();

    const values: TableBodyRenderProps = {
      get isDropTarget() {
        return dnd.dropState?.isDropTarget({ type: "root" }) === true;
      },
      get isEmpty() {
        return !state.collection.rows.some((row) => row.type === "item");
      },
    };

    const render = createRenderProps(
      mergeProps(props, {
        children: undefined,
        defaultClass: "solid2-aria-TableBody",
        values,
      })
    );

    return (
      <Tag
        {...mergeProps(
          filterDOMProps(props, { global: true }),
          render,
          merge(() => group.rowGroupProps ?? {})
        )}
        ref={ref}
        data-empty={values.isEmpty || undefined}
      >
        {dnd.dropState && (
          <RootDropIndicator
            table={!(renderer.isVirtualized === true)}
            columnCount={state.collection.columnCount}
          />
        )}
        <Branch
          collection={state.collection}
          parent={node}
          renderDropIndicator={createRenderDropIndicator(
            dnd.dragAndDropHooks,
            dnd.dropState
          )}
        />
        {values.isEmpty && props.renderEmptyState && (
          <RowTag role="row">
            <CellTag role="rowheader" colspan={state.collection.columnCount}>
              {props.renderEmptyState(values)}
            </CellTag>
          </RowTag>
        )}
      </Tag>
    );
  }
);

export const TableFooter = createBranchComponent(
  TableFooterNode,
  <T,>(
    props: TableFooterProps<T>,
    ref: Ref<HTMLTableSectionElement>,
    node: Node<T>
  ) => {
    const state = requireValue(
      useContext(TableStateContext),
      "Expected useContext(TableStateContext)"
    );

    const renderer = useContext(CollectionRendererContext);
    const dnd = useContext(DragAndDropContext);
    const Branch = renderer.CollectionBranch;

    const Tag = dynamic(() =>
      renderer.isVirtualized === true ? dom.div : dom.tfoot
    );

    const group = createTableRowGroup();

    return (
      <Tag
        {...mergeProps(
          filterDOMProps(props, { global: true }),
          merge(() => group.rowGroupProps ?? {})
        )}
        class={props.class ?? "solid2-aria-TableFooter"}
        style={props.style}
        ref={ref}
      >
        <Branch
          collection={state.collection}
          parent={node}
          renderDropIndicator={createRenderDropIndicator(
            dnd.dragAndDropHooks,
            dnd.dropState
          )}
        />
      </Tag>
    );
  }
);

export function Row<T>(
  ownProps: RowProps<T> & { ref?: Ref<HTMLTableRowElement> }
): JSX.Element {
  return createBranchComponent<T, RowProps<T>, HTMLTableRowElement>(
    TableRowNode,
    (
      props: RowProps<T>,
      forwardedRef: Ref<HTMLTableRowElement>,
      item: GridNode<T>
    ) => {
      const state = requireValue(
        useContext(TableStateContext),
        "Expected useContext(TableStateContext)"
      );

      const renderer = useContext(CollectionRendererContext);
      const dnd = useContext(DragAndDropContext);
      const Branch = renderer.CollectionBranch;

      const Tag = dynamic(() =>
        renderer.isVirtualized === true ? dom.div : dom.tr
      );

      const [ref, setRef] = createSignal<HTMLTableRowElement | null>(null, {
        ownedWrite: true,
      });

      const aria = createTableRow(
        {
          isVirtualized: renderer.isVirtualized,
          node: item,
          shouldSelectOnPressUp: !!dnd.dragState,
        },
        state,
        ref
      );

      const focus = createFocusRing();
      const within = createFocusRing({ within: true });

      const hover = createHover(
        mergeProps(props, {
          get isDisabled() {
            return !aria.allowsSelection && !aria.hasAction && !dnd.dragState;
          },
        })
      );

      const checkbox = createTableSelectionCheckbox({ key: item.key }, state);

      const drag = dnd.dragState
        ? dnd.dragAndDropHooks?.createDraggableItem?.(
            { hasDragButton: true, key: item.key },
            dnd.dragState
          )
        : undefined;

      const values: RowRenderProps = {
        get allowsDragging() {
          return !!dnd.dragState;
        },
        get hasChildItems() {
          return (
            props.hasChildItems === true ||
            (isPresent(item.lastChildKey) &&
              state.collection.getItem(item.lastChildKey)?.type !== "cell")
          );
        },
        id: item.key,
        get isDisabled() {
          return aria.isDisabled;
        },
        get isDragging() {
          return dnd.dragState?.isDragging(item.key) === true;
        },
        get isDropTarget() {
          return (
            dnd.dropState?.isDropTarget({
              dropPosition: "on",
              key: item.key,
              type: "item",
            }) === true
          );
        },
        get isExpanded() {
          return state.expandedKeys.has(item.key);
        },
        get isFocusVisible() {
          return focus.isFocusVisible;
        },
        get isFocusVisibleWithin() {
          return within.isFocusVisible;
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
          return aria.isSelected;
        },
        level: item.level + 1,
        get selectionBehavior() {
          return state.selectionManager.selectionBehavior;
        },
        get selectionMode() {
          return state.selectionManager.selectionMode;
        },
        state,
      };

      const render = createRenderProps(
        mergeProps(props, {
          children: undefined,
          defaultClass: "solid2-aria-Row",
          values,
        })
      );

      return (
        <Tag
          {...mergeProps(
            omit(filterDOMProps(props, { global: true }), "id", "onClick"),
            render,
            merge(() => aria.rowProps ?? {}),
            merge(() => focus.focusProps ?? {}),
            merge(() => within.focusProps ?? {}),
            merge(() => hover.hoverProps ?? {}),
            merge(() => drag?.dragProps ?? {})
          )}
          ref={(element: HTMLTableRowElement) => {
            setRef(element);
          }}
          data-selected={aria.isSelected || undefined}
          data-disabled={aria.isDisabled || undefined}
          data-hovered={hover.isHovered || undefined}
          data-focused={focus.isFocused || undefined}
          data-focus-visible={focus.isFocusVisible || undefined}
          data-focus-visible-within={within.isFocusVisible || undefined}
          data-pressed={aria.isPressed || undefined}
          data-expanded={
            (values.hasChildItems && values.isExpanded) || undefined
          }
          data-has-child-items={values.hasChildItems || undefined}
          data-level={values.level}
          data-allows-dragging={!!dnd.dragState || undefined}
          data-dragging={values.isDragging ?? undefined}
          data-drop-target={values.isDropTarget ?? undefined}
          data-selection-mode={
            state.selectionManager.selectionMode === "none"
              ? undefined
              : state.selectionManager.selectionMode
          }
        >
          <CheckboxContext
            value={{
              slots: {
                [DEFAULT_SLOT]: {},
                get selection() {
                  return checkbox.checkboxProps;
                },
              },
            }}
          >
            <CheckboxFieldContext
              value={{
                slots: {
                  [DEFAULT_SLOT]: {},
                  get selection() {
                    return checkbox.checkboxProps;
                  },
                },
              }}
            >
              <ButtonContext
                value={{
                  slots: {
                    [DEFAULT_SLOT]: {},
                    get chevron() {
                      return aria.expandButtonProps;
                    },
                    drag: mergeProps(
                      merge(() => drag?.dragButtonProps ?? {}),
                      {
                        style: { "pointer-events": "none" as const },
                      }
                    ),
                  },
                }}
              >
                <RowFocusContext
                  value={{
                    get isFocusVisibleWithinRow() {
                      return within.isFocusVisible;
                    },
                  }}
                >
                  <SelectionIndicatorContext
                    value={{
                      get isSelected() {
                        return aria.isSelected;
                      },
                    }}
                  >
                    <Branch collection={state.collection} parent={item} />
                  </SelectionIndicatorContext>
                </RowFocusContext>
              </ButtonContext>
            </CheckboxFieldContext>
          </CheckboxContext>
        </Tag>
      );
    },
    (props: RowProps<T>) => (
      <Collection items={props.columns} dependencies={props.dependencies}>
        {props.children}
      </Collection>
    )
  )(ownProps);
}

export const Cell = createLeafComponent(
  TableCellNode,
  (
    props: CellProps,
    forwardedRef: Ref<HTMLTableCellElement>,
    cell: GridNode<unknown>
  ) => {
    const state = requireValue(
      useContext(TableStateContext),
      "Expected useContext(TableStateContext)"
    );

    const renderer = useContext(CollectionRendererContext);
    const dnd = useContext(DragAndDropContext);
    const within = useContext(RowFocusContext);

    const [ref, setRef] = createSignal<HTMLTableCellElement | null>(null, {
      ownedWrite: true,
    });

    const Tag = dynamic(() =>
      renderer.isVirtualized === true ? dom.div : dom.td
    );

    cell.column = state.collection.columns[cell.index];

    const aria = createTableCell(
      {
        get allowsArrowNavigation() {
          return props.allowsArrowNavigation;
        },
        get focusMode() {
          return props.focusMode;
        },
        isVirtualized: renderer.isVirtualized,
        node: cell,
        shouldSelectOnPressUp: !!dnd.dragState,
      },
      state,
      ref
    );

    const focus = createFocusRing();
    const hover = createHover({});

    const row = () =>
      isPresent(cell.parentKey)
        ? state.collection.getItem(cell.parentKey)
        : null;

    const values: CellRenderProps = {
      columnIndex: cell.colIndex ?? cell.index,
      get hasChildItems() {
        const node = row();

        return (
          isTruthy(getNodeProps(node).hasChildItems) ||
          (isPresent(node?.lastChildKey) &&
            state.collection.getItem(node.lastChildKey)?.type !== "cell")
        );
      },
      id: cell.key,
      get isDisabled() {
        return (
          isPresent(cell.parentKey) &&
          state.selectionManager.isDisabled(cell.parentKey)
        );
      },
      get isExpanded() {
        return (
          isPresent(cell.parentKey) && state.expandedKeys.has(cell.parentKey)
        );
      },
      get isFocusVisible() {
        return focus.isFocusVisible;
      },
      get isFocusVisibleWithinRow() {
        return within.isFocusVisibleWithinRow;
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
        return (
          isPresent(cell.parentKey) &&
          state.selectionManager.isSelected(cell.parentKey)
        );
      },
      get isTreeColumn() {
        return cell.column?.key === state.treeColumn;
      },
      get level() {
        return (row()?.level ?? 0) + 1;
      },
    };

    const render = createRenderProps(
      mergeProps(props, {
        get children() {
          return cell.rendered;
        },
        defaultClass: "solid2-aria-Cell",
        values,
      })
    );

    return (
      <Tag
        {...mergeProps(
          omit(filterDOMProps(props, { global: true }), "id"),
          render,
          merge(() => aria.gridCellProps ?? {}),
          merge(() => focus.focusProps ?? {}),
          merge(() => hover.hoverProps ?? {})
        )}
        ref={(element: HTMLTableCellElement) => {
          setRef(element);
        }}
        data-focused={focus.isFocused || undefined}
        data-focus-visible={focus.isFocusVisible || undefined}
        data-focus-visible-within-row={
          within.isFocusVisibleWithinRow || undefined
        }
        data-hovered={hover.isHovered || undefined}
        data-pressed={aria.isPressed || undefined}
        data-selected={values.isSelected || undefined}
        data-column-index={values.columnIndex}
        data-tree-column={values.isTreeColumn || undefined}
        data-expanded={values.isExpanded || undefined}
        data-has-child-items={values.hasChildItems || undefined}
        data-level={values.level}
        data-disabled={values.isDisabled || undefined}
      >
        <CollectionRendererContext value={DefaultCollectionRenderer}>
          {render.children}
        </CollectionRendererContext>
      </Tag>
    );
  }
);

export const TableLoadMoreItem = createLeafComponent(
  LoaderNode,
  (
    props: TableLoadMoreItemProps,
    ref: Ref<HTMLTableRowElement>,
    item: Node<object>
  ) => {
    const state = requireValue(
      useContext(TableStateContext),
      "Expected useContext(TableStateContext)"
    );

    const renderer = useContext(CollectionRendererContext);

    const Tag = dynamic(() =>
      renderer.isVirtualized === true ? dom.div : dom.tr
    );

    const CellTag = dynamic(() =>
      renderer.isVirtualized === true ? dom.div : dom.td
    );

    const [sentinel, setSentinel] = createSignal<HTMLDivElement | null>(null, {
      ownedWrite: true,
    });

    createLoadMoreSentinel(
      mergeProps(props, {
        get collection() {
          return state.collection;
        },
      }),
      sentinel
    );

    return (
      <>
        <tr inert style={{ height: 0 }}>
          <td
            colspan={state.collection.columnCount}
            style={{ height: 0, padding: 0 }}
          >
            <div
              ref={(element: HTMLDivElement) => {
                setSentinel(element);
              }}
              style={{ height: "1px", width: "1px" }}
            />
          </td>
        </tr>
        {props.isLoading === true && (
          <Tag
            {...filterDOMProps(props, { global: true })}
            ref={ref}
            render={props.render}
            class={props.class ?? "solid2-aria-TableLoadingIndicator"}
          >
            <CellTag role="gridcell" colspan={state.collection.columnCount}>
              {item.rendered}
            </CellTag>
          </Tag>
        )}
      </>
    );
  }
);
