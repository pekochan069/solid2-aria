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
 * Derived from Adobe React Spectrum: packages/react-aria/src/selection/useSelectableList.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type {
  Collection,
  Key,
  KeyboardDelegate,
  LayoutDelegate,
  Node,
  Orientation,
} from "@solid2-aria/types-shared";
import type { DOMAttributes } from "@solid2-aria/types-shared-web";
import { merge, createMemo } from "solid-js";

import { createCollator } from "../i18n/create-collator";
import { getTruthyValue } from "../utils/truthy";
import { createSelectableCollection } from "./create-selectable-collection";
import type { AriaSelectableCollectionOptions } from "./create-selectable-collection";
import { ListKeyboardDelegate } from "./list-keyboard-delegate";

export interface AriaSelectableListOptions extends Omit<
  AriaSelectableCollectionOptions,
  "keyboardDelegate"
> {
  /**
   * State of the collection.
   */
  collection: Collection<Node<unknown>>;
  /**
   * A delegate object that implements behavior for keyboard focus movement.
   */
  keyboardDelegate?: KeyboardDelegate;
  /**
   * A delegate object that provides layout information for items in the collection.
   * By default this uses the DOM, but this can be overridden to implement things like
   * virtualized scrolling.
   */
  layoutDelegate?: LayoutDelegate;
  /**
   * The item keys that are disabled. These items cannot be selected, focused, or otherwise
   * interacted with.
   */
  disabledKeys: Set<Key>;
  /**
   * The primary orientation of the items. Usually this is the direction that the collection
   * scrolls.
   *
   * @default 'vertical'
   */
  orientation?: Orientation;
}

export interface SelectableListAria {
  /**
   * Props for the option element.
   */
  listProps: DOMAttributes;
}

/**
 * Handles interactions with a selectable list.
 */
export function createSelectableList(
  props: AriaSelectableListOptions
): SelectableListAria {
  // By default, a KeyboardDelegate is provided which uses the DOM to query layout information (e.g. for page up/page down).
  // When virtualized, the layout object will be passed in as a prop and override this.
  const collator = createCollator({
    get sensitivity(): "base" {
      return "base";
    },
    get usage(): "search" {
      return "search";
    },
  });

  const disabledBehavior = createMemo(
    () => props.selectionManager.disabledBehavior
  );

  const delegate = createMemo(
    () =>
      getTruthyValue(props.keyboardDelegate) ??
      new ListKeyboardDelegate({
        collator,
        collection: props.collection,
        disabledBehavior: disabledBehavior(),
        disabledKeys: props.disabledKeys,
        layoutDelegate: props.layoutDelegate,
        orientation: props.orientation,
        ref: props.ref,
      })
  );

  const _result1 = createSelectableCollection(
    merge(props, {
      get keyboardDelegate() {
        return delegate();
      },
      get ref() {
        return props.ref;
      },
      get selectionManager() {
        return props.selectionManager;
      },
    })
  );

  return {
    get listProps() {
      return _result1.collectionProps;
    },
  };
}
