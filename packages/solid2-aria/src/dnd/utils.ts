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
 * Derived from Adobe React Spectrum: packages/react-aria/src/dnd/utils.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { DroppableCollectionState } from "@solid2-aria/stately/dnd/create-droppable-collection-state";
import type {
  DirectoryDropItem,
  DragItem,
  DragType,
  DropItem,
  FileDropItem,
  DragTypes as IDragTypes,
  Key,
  TextDropItem,
} from "@solid2-aria/types-shared";
import type { Accessor } from "solid-js";

import {
  getInteractionModality,
  createInteractionModality,
} from "../interactions/create-focus-visible";
import { isPresent } from "../utils/is-present";
import { getTruthyValue, isTruthy } from "../utils/truthy";
import {
  CUSTOM_DRAG_TYPE,
  DROP_OPERATION,
  GENERIC_TYPE,
  NATIVE_DRAG_TYPES,
} from "./constants";

interface DroppableCollectionMap {
  id: string;
  ref: Accessor<HTMLElement | null>;
}

export const droppableCollectionMap: WeakMap<
  DroppableCollectionState,
  DroppableCollectionMap
> = new WeakMap<DroppableCollectionState, DroppableCollectionMap>();

export const DIRECTORY_DRAG_TYPE = Symbol("directory-drag");

export function getDroppableCollectionId(
  state: DroppableCollectionState
): string {
  const { id } = getTruthyValue(droppableCollectionMap.get(state)) ?? {};

  if (!isTruthy(id)) {
    throw new Error("Droppable item outside a droppable collection");
  }

  return id;
}

export function getDroppableCollectionRef(
  state: DroppableCollectionState
): Accessor<HTMLElement | null> {
  const { ref } = getTruthyValue(droppableCollectionMap.get(state)) ?? {};

  if (!ref) {
    throw new Error("Droppable item outside a droppable collection");
  }

  return ref;
}

export function getTypes(items: DragItem[]): Set<string> {
  const types = new Set<string>();

  for (const item of items) {
    for (const type of Object.keys(item)) {
      types.add(type);
    }
  }

  return types;
}

export type DragModality = "keyboard" | "touch" | "virtual";

function mapModality(modality: string | null): DragModality {
  let currentModality = modality;

  if (!isTruthy(currentModality)) {
    currentModality = "virtual";
  }

  if (currentModality === "pointer") {
    currentModality = "virtual";
  }

  if (
    currentModality === "virtual" &&
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(pointer: coarse)").matches
  ) {
    currentModality = "touch";
  }

  return currentModality === "keyboard" || currentModality === "touch"
    ? currentModality
    : "virtual";
}

export function createDragModality(): () => DragModality {
  const modality = createInteractionModality();

  return () => mapModality(modality());
}

export function getDragModality(): DragModality {
  return mapModality(getInteractionModality());
}

export function writeToDataTransfer(
  dataTransfer: DataTransfer,
  items: DragItem[]
): void {
  // The data transfer API doesn't support more than one item of a given type at once.
  // In addition, only a small set of types are supported natively for transfer between applications.
  // We allow for both multiple items, as well as multiple representations of a single item.
  // In order to make our API work with the native API, we serialize all items to JSON and
  // store as a single native item. We only need to do this if there is more than one item
  // of the same type, or if an item has more than one representation. Otherwise the native
  // API is sufficient.
  //
  // The DataTransferItemList API also theoretically supports adding files, which would enable
  // dragging binary data out of the browser onto the user's desktop for example. Unfortunately,
  // this does not currently work in any browser, so it is not currently supported by our API.
  // See e.g. https://bugs.chromium.org/p/chromium/issues/detail?id=438479.
  const groupedByType = new Map<string, string[]>();
  let needsCustomData = false;
  const customData: object[] = [];

  for (const item of items) {
    const types = Object.keys(item);

    if (types.length > 1) {
      needsCustomData = true;
    }

    const dataByType: Record<string, string> = {};

    for (const type of types) {
      let typeItems = groupedByType.get(type);

      if (typeItems) {
        needsCustomData = true;
      } else {
        typeItems = [];
        groupedByType.set(type, typeItems);
      }

      const data = item[type];

      if (data === undefined) {
        continue;
      }

      dataByType[type] = data;
      typeItems.push(data);
    }

    customData.push(dataByType);
  }

  for (const [type, itemsValue] of groupedByType) {
    if (NATIVE_DRAG_TYPES.has(type)) {
      // Only one item of a given type can be set on a data transfer.
      // Join all of the items together separated by newlines.
      const data = itemsValue.join("\n");
      dataTransfer.items.add(data, type);
    } else {
      // Set data to the first item so we have access to the list of types.
      const [first] = itemsValue;

      if (first !== undefined) {
        dataTransfer.items.add(first, type);
      }
    }
  }

  if (needsCustomData) {
    const data = JSON.stringify(customData);
    dataTransfer.items.add(data, CUSTOM_DRAG_TYPE);
  }
}

export class DragTypes implements IDragTypes {
  private readonly types: Set<string>;
  private readonly includesUnknownTypes: boolean;
  constructor(dataTransfer: DataTransfer) {
    this.types = new Set<string>();
    let hasFiles = false;

    for (const item of dataTransfer.items) {
      if (item.type !== CUSTOM_DRAG_TYPE) {
        if (item.kind === "file") {
          hasFiles = true;
        }

        if (item.type) {
          this.types.add(item.type);
        } else {
          // Files with unknown types or extensions that don't map to a known mime type
          // are sometimes exposed as an empty string by the browser. Map to a generic
          // mime type instead. Note that this could also be a directory as there's no
          // way to determine if something is a file or directory until drop.
          this.types.add(GENERIC_TYPE);
        }
      }
    }

    // In Safari, when dragging files, the dataTransfer.items list is empty, but dataTransfer.types contains "Files".
    // Unfortunately, this doesn't tell us what types of files the user is dragging, so we need to assume that any
    // type the user checks for is included. See https://bugs.webkit.org/show_bug.cgi?id=223517.
    this.includesUnknownTypes =
      !hasFiles && dataTransfer.types.includes("Files");
  }
  has(type: DragType | DragType[]): boolean {
    if (Array.isArray(type)) {
      return type.some((t) => this.has(t));
    }

    if (
      this.includesUnknownTypes ||
      (type === DIRECTORY_DRAG_TYPE && this.types.has(GENERIC_TYPE)) ||
      type === "*/*"
    ) {
      return true;
    }

    if (typeof type === "string") {
      if (type.endsWith("/*")) {
        for (const key of this.types) {
          if (key.startsWith(type.slice(0, -2))) {
            return true;
          }
        }

        return false;
      }

      return this.types.has(type);
    }

    return false;
  }
}

function isSerializedItems(value: unknown): value is Record<string, string>[] {
  if (!Array.isArray(value)) {
    return false;
  }

  const items: readonly unknown[] = value;

  return items.every(
    (item) =>
      item !== null &&
      typeof item === "object" &&
      Object.values(item).every(isText)
  );
}

export function readFromDataTransfer(dataTransfer: DataTransfer): DropItem[] {
  const items: DropItem[] = [];

  if (!isTruthy(dataTransfer)) {
    return items;
  }

  // If our custom drag type is available, use that. This is a JSON serialized
  // representation of all items in the drag, set when there are multiple items
  // of the same type, or an individual item has multiple representations.
  let hasCustomType = false;

  if (dataTransfer.types.includes(CUSTOM_DRAG_TYPE)) {
    try {
      const data = dataTransfer.getData(CUSTOM_DRAG_TYPE);
      const parsed: unknown = JSON.parse(data);

      if (isSerializedItems(parsed)) {
        for (const item of parsed) {
          items.push({
            // oxlint-disable-next-line eslint/require-await -- Preserve the asynchronous text reader contract for data already present in memory.
            getText: async (type) => item[type] ?? "",
            kind: "text",
            types: new Set(Object.keys(item)),
          });
        }

        hasCustomType = true;
      }
    } catch {
      // ignore
    }
  }

  // Otherwise, map native drag items to items of a single representation.
  if (!hasCustomType) {
    const stringItems = new Map<string, string>();

    for (const item of dataTransfer.items) {
      if (item.kind === "string") {
        // The data for all formats must be read here because the data transfer gets
        // cleared out after the event handler finishes. If the item has an empty string
        // as a type, the mime type is unknown. Map to a generic mime type instead.
        stringItems.set(
          item.type || GENERIC_TYPE,
          dataTransfer.getData(item.type)
        );
      } else if (item.kind === "file") {
        // Despite the name, webkitGetAsEntry is also implemented in Firefox and Edge.
        // In the future, we may use getAsFileSystemHandle instead, but that's currently
        // only implemented in Chrome.
        if (typeof item.webkitGetAsEntry === "function") {
          const entry: FileSystemEntry | null = item.webkitGetAsEntry();

          if (!entry) {
            // For some reason, Firefox includes an item with type image/png when copy
            // and pasting any file or directory (no matter the type), but returns `null` for both
            // item.getAsFile() and item.webkitGetAsEntry(). Safari works as expected. Ignore this
            // item if this happens. See https://bugzilla.mozilla.org/show_bug.cgi?id=1699743.
            // This was recently fixed in Chrome Canary: https://bugs.chromium.org/p/chromium/issues/detail?id=1175483.
            continue;
          }

          if (isFileEntry(entry)) {
            items.push(createFileItem(item.getAsFile()));
          } else if (isDirectoryEntry(entry)) {
            items.push(createDirectoryItem(entry));
          }
        } else {
          // Assume it's a file.
          items.push(createFileItem(item.getAsFile()));
        }
      }
    }

    // All string items are different representations of the same item. There's no way to have
    // multiple string items at once in the current DataTransfer API.
    if (stringItems.size > 0) {
      items.push({
        // oxlint-disable-next-line eslint/require-await -- Preserve the asynchronous text reader contract for data already present in memory.
        getText: async (type) => stringItems.get(type) ?? "",
        kind: "text",
        types: new Set(stringItems.keys()),
      });
    }
  }

  return items;
}

async function blobToString(blob: Blob): Promise<string> {
  if (typeof blob.text === "function") {
    return await blob.text();
  }

  // Safari doesn't have the Blob#text() method yet...
  const { promise, resolve, reject } = Promise.withResolvers<string>();
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    if (typeof reader.result === "string") {
      resolve(reader.result);
    } else {
      reject(new TypeError("Expected text from FileReader"));
    }
  });

  reader.addEventListener("error", reject);
  // oxlint-disable-next-line unicorn/prefer-blob-reading-methods -- This is the fallback for browsers without Blob.text().
  reader.readAsText(blob);

  return await promise;
}

function createFileItem(file: File | null): FileDropItem {
  if (!file) {
    throw new Error("No file provided");
  }

  return {
    // oxlint-disable-next-line eslint/require-await -- Native file entries expose a Promise even when the file is already available.
    getFile: async () => file,
    getText: async () => await blobToString(file),
    kind: "file",
    name: file.name,
    type: file.type || GENERIC_TYPE,
  };
}

function isDirectoryEntry(
  entry: FileSystemEntry
): entry is FileSystemDirectoryEntry {
  return entry.isDirectory;
}

function isFileEntry(entry: FileSystemEntry): entry is FileSystemFileEntry {
  return entry.isFile;
}

function createDirectoryItem(
  entry: FileSystemDirectoryEntry
): DirectoryDropItem {
  return {
    getEntries: () => getEntries(entry),
    kind: "directory",
    name: entry.name,
  };
}

async function* getEntries(
  item: FileSystemDirectoryEntry
): AsyncIterable<FileDropItem | DirectoryDropItem> {
  const reader = item.createReader();
  // We must call readEntries repeatedly because there may be a limit to the
  // number of entries that are returned at once.
  let entries: FileSystemEntry[];

  do {
    const { promise, resolve, reject } =
      Promise.withResolvers<FileSystemEntry[]>();

    reader.readEntries(resolve, reject);
    // oxlint-disable-next-line eslint/no-await-in-loop -- The native directory cursor must finish one page before requesting the next.
    entries = await promise;

    for (const entry of entries) {
      if (isFileEntry(entry)) {
        // oxlint-disable-next-line eslint/no-await-in-loop -- Fetch one file per iterator request to preserve directory traversal order and backpressure.
        const file = await getEntryFile(entry);
        yield createFileItem(file);
      } else if (isDirectoryEntry(entry)) {
        yield createDirectoryItem(entry);
      }
    }
  } while (entries.length > 0);
}

async function getEntryFile(entry: FileSystemFileEntry): Promise<File> {
  const { promise, resolve, reject } = Promise.withResolvers<File>();
  entry.file(resolve, reject);

  return await promise;
}

/** Returns whether a drop item contains text data. */
export function isTextDropItem(dropItem: DropItem): dropItem is TextDropItem {
  return dropItem.kind === "text";
}

/** Returns whether a drop item is a file. */
export function isFileDropItem(dropItem: DropItem): dropItem is FileDropItem {
  return dropItem.kind === "file";
}

/** Returns whether a drop item is a directory. */
export function isDirectoryDropItem(
  dropItem: DropItem
): dropItem is DirectoryDropItem {
  return dropItem.kind === "directory";
}

// Global DnD collection state tracker.
export interface DnDState {
  /** A ref for the of the drag items in the current drag session if any. */
  draggingCollectionRef?: Accessor<HTMLElement | null>;
  /** The set of currently dragged keys. */
  draggingKeys: Set<Key>;
  /** A ref for the collection that is targeted for a drop operation, if any. */
  dropCollectionRef?: Accessor<HTMLElement | null>;
}

// oxlint-disable-next-line import/no-mutable-exports -- Preserve the upstream ESM live binding used across drag session modules.
export let globalDndState: DnDState = { draggingKeys: new Set() };

export function setDraggingCollectionRef(
  ref: Accessor<HTMLElement | null>
): void {
  globalDndState.draggingCollectionRef = ref;
}

export function setDraggingKeys(keys: Set<Key>): void {
  globalDndState.draggingKeys = keys;
}

export function setDropCollectionRef(ref?: Accessor<HTMLElement | null>): void {
  globalDndState.dropCollectionRef = ref;
}

export function clearGlobalDnDState(): void {
  globalDndState = { draggingKeys: new Set() };
}

export function setGlobalDnDState(state: DnDState): void {
  globalDndState = state;
}

// Util function to check if the current dragging collection ref is the same as the current targeted droppable collection ref.
// Allows a droppable ref arg in case the global drop collection ref hasn't been set
export function isInternalDropOperation(
  ref?: Accessor<HTMLElement | null>
): boolean {
  const { draggingCollectionRef, dropCollectionRef } = globalDndState;

  return (
    isPresent(draggingCollectionRef?.()) &&
    draggingCollectionRef() ===
      (getTruthyValue(ref?.()) ?? dropCollectionRef?.())
  );
}

type DropEffect = "none" | "copy" | "link" | "move";

// oxlint-disable-next-line import/no-mutable-exports -- Preserve the upstream ESM live binding used across drag session modules.
export let globalDropEffect: DropEffect | undefined;

export function setGlobalDropEffect(dropEffect: DropEffect | undefined): void {
  globalDropEffect = dropEffect;
}

// oxlint-disable-next-line import/no-mutable-exports -- Preserve the upstream ESM live binding used across drag session modules.
export let globalAllowedDropOperations: DROP_OPERATION = DROP_OPERATION.none;

export function setGlobalAllowedDropOperations(o: DROP_OPERATION): void {
  globalAllowedDropOperations = o;
}

function isText<T>(text: T): text is T & string {
  return typeof text === "string";
}
