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
 * Derived from Adobe React Spectrum: packages/@react-types/list/src/index.d.ts.
 * Modified for Solid Aria: adapted type declarations, imports, and formatting for Solid.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type {
  CollectionBase,
  MultipleSelection,
  FocusStrategy,
  Key,
  DisabledBehavior,
  DOMProps,
  AriaLabelingProps,
  SpectrumSelectionProps,
  AsyncLoadable,
  LoadingState,
  DraggableCollectionProps,
  Collection,
  Node,
  SelectionMode,
  SelectionBehavior,
  PressEvent,
  LongPressEvent,
  DragItem,
  DragPreviewRenderer,
  DropOperation,
  DragStartEvent,
  DragMoveEvent,
  DraggableCollectionEndEvent,
  PressEvents,
  FocusableProps,
  FocusableDOMProps,
  DroppableCollectionProps,
  DropTarget,
  DragTypes,
  KeyboardDelegate,
  DropTargetDelegate,
  FocusableElement,
} from "@solid2-aria/types-shared";
import type {
  StyleProps,
  HTMLAttributes,
  ElementType,
  Ref,
  ButtonHTMLAttributes,
} from "@solid2-aria/types-shared-web";
import type { JSX } from "@solidjs/web";
import type { Accessor, Component } from "solid-js";

export interface AriaGridListProps<T>
  extends GridListProps<T>, DOMProps, AriaLabelingProps {
  /**
   * Whether keyboard navigation to focusable elements within grid list items is
   * via the left/right arrow keys or the tab key.
   *
   * @default 'arrow'
   */
  keyboardNavigationBehavior?: "arrow" | "tab";
  /**
   * Whether pressing the escape key should clear selection in the grid list or not.
   *
   * Most experiences should not modify this option as it eliminates a keyboard user's ability to
   * easily clear selection. Only use if the escape key is being handled externally or should not
   * trigger selection clearing contextually.
   *
   * @default 'clearSelection'
   */
  escapeKeyBehavior?: "clearSelection" | "none";
}

export interface GridListProps<T> extends CollectionBase<T>, MultipleSelection {
  /** Whether to auto focus the gridlist or an option. */
  autoFocus?: boolean | FocusStrategy;
  /**
   * Handler that is called when a user performs an action on an item. The exact user event depends
   * on the collection's `selectionBehavior` prop and the interaction modality.
   */
  onAction?: (key: Key) => void;
  /**
   * Whether `disabledKeys` applies to all interactions, or only selection.
   *
   * @default 'all'
   */
  disabledBehavior?: DisabledBehavior;
  /** Whether selection should occur on press up instead of press down. */
  shouldSelectOnPressUp?: boolean;
}

export interface SpectrumListViewProps<T>
  extends
    Omit<AriaGridListProps<T>, "keyboardNavigationBehavior">,
    StyleProps,
    SpectrumSelectionProps,
    Omit<AsyncLoadable, "isLoading"> {
  /**
   * Sets the amount of vertical padding within each cell.
   *
   * @default 'regular'
   */
  density?: "compact" | "regular" | "spacious";
  /** Whether the ListView should be displayed with a quiet style. */
  isQuiet?: boolean;
  /**
   * The current loading state of the ListView. Determines whether or not the progress circle should
   * be shown.
   */
  loadingState?: LoadingState;
  /**
   * Sets the text behavior for the row contents.
   *
   * @default 'truncate'
   */
  overflowMode?: "truncate" | "wrap";
  /** Sets what the ListView should render when there is no content to display. */
  renderEmptyState?: () => JSX.Element;
  /**
   * Handler that is called when a user performs an action on an item. The exact user event depends
   * on the collection's `selectionStyle` prop and the interaction modality.
   */
  onAction?: (key: Key) => void;
  /**
   * The drag and drop hooks returned by `createDragAndDrop` used to enable drag and drop behavior for
   * the ListView.
   */
  dragAndDropHooks?: DragAndDropHooks<NoInfer<T>>["dragAndDropHooks"];
}

interface DragAndDropHooks<T = object> {
  /** Drag and drop hooks for the collection element. */
  dragAndDropHooks: DragHooks<T> &
    DropHooks & {
      isVirtualDragging?: () => boolean;
      renderPreview?: (keys: Set<Key>, draggedKey: Key) => JSX.Element;
    };
}

interface DragHooks<T = object> {
  createDraggableCollectionState?: (
    props: DraggableCollectionStateOpts<T>
  ) => DraggableCollectionState;
  createDraggableCollection?: (
    props: DraggableCollectionOptions,
    state: DraggableCollectionState,
    ref: Accessor<HTMLElement | null>
  ) => void;
  createDraggableItem?: (
    props: DraggableItemProps,
    state: DraggableCollectionState
  ) => DraggableItemResult;
  DragPreview?: (props: {
    children: (items: DragItem[]) => JSX.Element;
    ref?: Ref<DragPreviewRenderer | null>;
  }) => JSX.Element;
}

interface DraggableCollectionStateOpts<T> extends Omit<
  DraggableCollectionStateOptions<T>,
  "getItems"
> {}

interface DraggableCollectionStateOptions<
  T = object,
> extends DraggableCollectionProps<T> {
  /** A collection of items. */
  collection: Collection<Node<unknown>>;
  /** An interface for reading and updating multiple selection state. */
  selectionManager: MultipleSelectionManager;
  /** Whether the drag events should be disabled. */
  isDisabled?: boolean;
}

interface MultipleSelectionManager extends FocusState {
  /** The type of selection that is allowed in the collection. */
  readonly selectionMode: SelectionMode;
  /** The selection behavior for the collection. */
  readonly selectionBehavior: SelectionBehavior;
  /** Whether the collection allows empty selection. */
  readonly disallowEmptySelection?: boolean;
  /** The currently selected keys in the collection. */
  readonly selectedKeys: Set<Key>;
  /** Whether the selection is empty. */
  readonly isEmpty: boolean;
  /** Whether all items in the collection are selected. */
  readonly isSelectAll: boolean;
  /** The first selected key in the collection. */
  readonly firstSelectedKey: Key | null;
  /** The last selected key in the collection. */
  readonly lastSelectedKey: Key | null;
  /** The currently disabled keys in the collection. */
  readonly disabledKeys: Set<Key>;
  /** Whether `disabledKeys` applies to selection, actions, or both. */
  readonly disabledBehavior: DisabledBehavior;
  /** Returns whether a key is selected. */
  isSelected(key: Key): boolean;
  /** Returns whether the current selection is equal to the given selection. */
  isSelectionEqual(selection: Set<Key>): boolean;
  /** Extends the selection to the given key. */
  extendSelection(toKey: Key): void;
  /** Toggles whether the given key is selected. */
  toggleSelection(key: Key): void;
  /** Replaces the selection with only the given key. */
  replaceSelection(key: Key): void;
  /** Replaces the selection with the given keys. */
  setSelectedKeys(keys: Iterable<Key>): void;
  /** Selects all items in the collection. */
  selectAll(): void;
  /** Removes all keys from the selection. */
  clearSelection(): void;
  /** Toggles between select all and an empty selection. */
  toggleSelectAll(): void;
  /**
   * Toggles, replaces, or extends selection to the given key depending
   * on the pointer event and collection's selection mode.
   */
  select(key: Key, e?: PressEvent | LongPressEvent | PointerEvent): void;
  /** Returns whether the given key can be selected. */
  canSelectItem(key: Key): boolean;
  /** Returns whether the given key is non-interactive, i.e. both selection and actions are disabled. */
  isDisabled(key: Key): boolean;
  /** Sets the selection behavior for the collection. */
  setSelectionBehavior(selectionBehavior: SelectionBehavior): void;
  /** Returns whether the given key is a hyperlink. */
  isLink(key: Key): boolean;
  /** Returns the props for the given item. */
  getItemProps(key: Key): any;
  /** The collection of nodes that the selection manager handles. */
  collection: Collection<Node<unknown>>;
}

interface FocusState {
  /** Whether the collection is currently focused. */
  readonly isFocused: boolean;
  /** Sets whether the collection is focused. */
  setFocused(isFocused: boolean): void;
  /** The current focused key in the collection. */
  readonly focusedKey: Key | null;
  /** Whether the first or last child of the focused key should receive focus. */
  readonly childFocusStrategy: FocusStrategy | null;
  /**
   * Sets the focused key, and optionally, whether the first or last child of that key should
   * receive focus.
   */
  setFocusedKey(key: Key | null, child?: FocusStrategy): void;
}

interface DraggableCollectionState {
  /** A collection of items. */
  collection: Collection<Node<unknown>>;
  /** An interface for reading and updating multiple selection state. */
  selectionManager: MultipleSelectionManager;
  /** The key of the item that initiated a drag. */
  draggedKey: Key | null;
  /** The keys of the items that are currently being dragged. */
  draggingKeys: Set<Key>;
  /** Whether drag events are disabled. */
  isDisabled?: boolean;
  /** Returns whether the given key is currently being dragged. */
  isDragging(key: Key): boolean;
  /** Returns the keys of the items that will be dragged with the given key (e.g. selected items). */
  getKeysForDrag(key: Key): Set<Key>;
  /** Returns the items to drag for the given key. */
  getItems(key: Key): DragItem[];
  /** The ref of the element that will be rendered as the drag preview while dragging. */
  preview?: Accessor<DragPreviewRenderer | null>;
  /**
   * Function that returns the drop operations that are allowed for the dragged items. If not
   * provided, all drop operations are allowed.
   */
  getAllowedDropOperations?: () => DropOperation[];
  /** Begins a drag for the given key. This triggers the onDragStart event. */
  startDrag(key: Key, event: DragStartEvent): void;
  /** Triggers an onDragMove event. */
  moveDrag(event: DragMoveEvent): void;
  /** Ends the current drag, and emits an onDragEnd event. */
  endDrag(event: DraggableCollectionEndEvent): void;
}

interface DraggableCollectionOptions {}

interface DraggableItemProps {
  /** The key of the draggable item within the collection. */
  key: Key;
  /**
   * Whether the item has an explicit focusable drag affordance to initiate accessible drag and drop
   * mode. If true, the dragProps will omit these event handlers, and they will be applied to
   * dragButtonProps instead.
   */
  hasDragButton?: boolean;
  /**
   * Whether the item has a primary action (e.g. Enter key or long press) that would conflict with
   * initiating accessible drag and drop. If true, the Alt key must be held to start dragging with a
   * keyboard, and long press is disabled until selection mode is entered. This should be passed
   * from the associated collection item hook (e.g. useOption, useGridListItem, etc.).
   */
  hasAction?: boolean;
}

interface DraggableItemResult {
  /** Props for the draggable item. */
  dragProps: HTMLAttributes<HTMLElement>;
  /** Props for the explicit drag button affordance, if any. */
  dragButtonProps: AriaButtonProps;
}

interface AriaButtonProps<T extends ElementType = "button">
  extends ButtonProps, LinkButtonProps<T>, AriaBaseButtonProps {}

interface ButtonProps extends PressEvents, FocusableProps {
  /** Whether the button is disabled. */
  isDisabled?: boolean;
  /** The content to display in the button. */
  children?: JSX.Element;
}

interface LinkButtonProps<
  T extends ElementType = "button",
> extends AriaButtonElementTypeProps<T> {
  /** A URL to link to if elementType="a". */
  href?: string;
  /** The target window for the link. */
  target?: string;
  /**
   * The relationship between the linked resource and the current page. See
   * [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel).
   */
  rel?: string;
}

interface AriaButtonElementTypeProps<T extends ElementType = "button"> {
  /**
   * The HTML element or Solid component used to render the button, e.g. 'div', 'a', or `RouterLink`.
   *
   * @default 'button'
   */
  elementType?: T | Component<any>;
}

interface AriaBaseButtonProps extends FocusableDOMProps, AriaLabelingProps {
  /** Indicates whether the element is disabled to users of assistive technology. */
  "aria-disabled"?: boolean | "true" | "false";
  /**
   * Indicates whether the element, or another grouping element it controls, is currently expanded
   * or collapsed.
   */
  "aria-expanded"?: boolean | "true" | "false";
  /**
   * Indicates the availability and type of interactive popup element, such as menu or dialog, that
   * can be triggered by an element.
   */
  "aria-haspopup"?:
    | boolean
    | "menu"
    | "listbox"
    | "tree"
    | "grid"
    | "dialog"
    | "true"
    | "false";
  /**
   * Identifies the element (or elements) whose contents or presence are controlled by the current
   * element.
   */
  "aria-controls"?: string;
  /** Indicates the current "pressed" state of toggle buttons. */
  "aria-pressed"?: boolean | "true" | "false" | "mixed";
  /**
   * Indicates whether this element represents the current item within a container or set of related
   * elements.
   */
  "aria-current"?:
    | boolean
    | "true"
    | "false"
    | "page"
    | "step"
    | "location"
    | "date"
    | "time";
  /**
   * The behavior of the button when used in an HTML form.
   *
   * @default 'button'
   */
  type?: "button" | "submit" | "reset";
  /**
   * Whether to prevent focus from moving to the button when pressing it.
   *
   * Caution, this can make the button inaccessible and should only be used when alternative
   * keyboard interaction is provided, such as ComboBox's MenuTrigger or a NumberField's
   * increment/decrement control.
   */
  preventFocusOnPress?: boolean;
  /**
   * The `<form>` element to associate the button with.
   * The value of this attribute must be the id of a `<form>` in the same document.
   * See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/button#form).
   */
  form?: string;
  /**
   * The URL that processes the information submitted by the button.
   * Overrides the action attribute of the button's form owner.
   */
  formAction?: ButtonHTMLAttributes<HTMLButtonElement>["formaction"];
  /** Indicates how to encode the form data that is submitted. */
  formEncType?: string;
  /** Indicates the HTTP method used to submit the form. */
  formMethod?: string;
  /** Indicates that the form is not to be validated when it is submitted. */
  formNoValidate?: boolean;
  /** Overrides the target attribute of the button's form owner. */
  formTarget?: string;
  /** Submitted as a pair with the button's value as part of the form data. */
  name?: string;
  /** The value associated with the button's name when it's submitted with the form data. */
  value?: string;
}

interface DropHooks {
  createDroppableCollectionState?: (
    props: DroppableCollectionStateOptions
  ) => DroppableCollectionState;
  createDroppableCollection?: (
    props: DroppableCollectionOptions,
    state: DroppableCollectionState,
    ref: Accessor<HTMLElement | null>
  ) => DroppableCollectionResult;
  createDroppableItem?: (
    options: DroppableItemOptions,
    state: DroppableCollectionState,
    ref: Accessor<HTMLElement | null>
  ) => DroppableItemResult;
  createDropIndicator?: (
    props: DropIndicatorProps,
    state: DroppableCollectionState,
    ref: Accessor<HTMLElement | null>
  ) => DropIndicatorAria;
}

interface DroppableCollectionStateOptions extends Omit<
  DroppableCollectionProps,
  "onDropMove" | "onDropActivate"
> {
  /** A collection of items. */
  collection: Collection<Node<unknown>>;
  /** An interface for reading and updating multiple selection state. */
  selectionManager: MultipleSelectionManager;
  /** Whether the drop events should be disabled. */
  isDisabled?: boolean;
}

interface DroppableCollectionState {
  /** A collection of items. */
  collection: Collection<Node<unknown>>;
  /** An interface for reading and updating multiple selection state. */
  selectionManager: MultipleSelectionManager;
  /** The current drop target. */
  target: DropTarget | null;
  /** Whether drop events are disabled. */
  isDisabled?: boolean;
  /** Sets the current drop target. */
  setTarget(target: DropTarget | null): void;
  /** Returns whether the given target is equivalent to the current drop target. */
  isDropTarget(target: DropTarget | null): boolean;
  /** Returns the drop operation for the given parameters. */
  getDropOperation(e: DropOperationEvent): DropOperation;
}

interface DropOperationEvent {
  target: DropTarget;
  types: DragTypes;
  allowedOperations: DropOperation[];
  isInternal: boolean;
  draggingKeys: Set<Key>;
}

interface DroppableCollectionOptions extends DroppableCollectionProps {
  /** A delegate object that implements behavior for keyboard focus movement. */
  keyboardDelegate: KeyboardDelegate;
  /** A delegate object that provides drop targets for pointer coordinates within the collection. */
  dropTargetDelegate: DropTargetDelegate;
  /** A custom keyboard event handler for drop targets. */
  onKeyDown?: (e: KeyboardEvent) => void;
}

interface DroppableCollectionResult {
  /** Props for the collection element. */
  collectionProps: HTMLAttributes<HTMLElement>;
}

interface DroppableItemOptions {
  /** The drop target represented by the item. */
  target: DropTarget;
  /** The ref to the activate button. */
  activateButtonRef?: Accessor<FocusableElement | null>;
}

interface DroppableItemResult {
  /** Props for the droppable element. */
  dropProps: HTMLAttributes<HTMLElement>;
  /** Whether the item is currently the active drop target. */
  isDropTarget: boolean;
}

interface DropIndicatorProps {
  /** The drop target that the drop indicator represents. */
  target: DropTarget;
  /** The ref to the activate button. */
  activateButtonRef?: Accessor<FocusableElement | null>;
}

interface DropIndicatorAria {
  /** Props for the drop indicator element. */
  dropIndicatorProps: HTMLAttributes<HTMLElement>;
  /** Whether the drop indicator is currently the active drop target. */
  isDropTarget: boolean;
  /**
   * Whether the drop indicator is hidden, both visually and from assistive technology.
   * Use this to determine whether to omit the element from the DOM entirely.
   */
  isHidden: boolean;
}
