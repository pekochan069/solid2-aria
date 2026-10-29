/*
 * Copyright 2024 Adobe. All rights reserved.
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
 * Derived from Adobe React Spectrum: packages/react-aria-components/src/Autocomplete.tsx.
 * Modified for Solid Aria: adapted collection ownership, contexts, accessibility primitives, and reactive properties for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { createAutocomplete } from "@solid2-aria/core/autocomplete/create-autocomplete";
import type {
  AriaAutocompleteProps,
  InputProps,
} from "@solid2-aria/core/autocomplete/create-autocomplete";
import { mergeProps } from "@solid2-aria/core/utils/merge-props";
import { createAutocompleteState } from "@solid2-aria/stately/autocomplete/create-autocomplete-state";
import type { AutocompleteState } from "@solid2-aria/stately/autocomplete/create-autocomplete-state";
import type {
  AriaLabelingProps,
  DOMProps,
  Node,
} from "@solid2-aria/types-shared";
import type { JSX } from "@solidjs/web";
import { untrack, merge, createSignal, createContext } from "solid-js";

import { createSlottedContext } from "./utils";
import type { ContextValue, SlotProps, SlottedContextValue } from "./utils";

export const AutocompleteContext =
  createContext<SlottedContextValue<Partial<AutocompleteProps<unknown>>>>(null);

export const AutocompleteStateContext = createContext<AutocompleteState | null>(
  null
);

export const SelectableCollectionContext =
  createContext<
    ContextValue<SelectableCollectionContextValue<unknown>, HTMLElement>
  >(null);

export const FieldInputContext =
  createContext<ContextValue<InputProps, HTMLElement>>(null);

export interface AutocompleteProps<T = object>
  extends AriaAutocompleteProps<T>, SlotProps {}

export interface SelectableCollectionContextValue<T>
  extends DOMProps, AriaLabelingProps {
  filter?: (nodeTextValue: string, node: Node<T>) => boolean;
  /** Whether the collection items should use virtual focus instead of being focused directly. */
  shouldUseVirtualFocus?: boolean;
  /** Whether typeahead is disabled. */
  disallowTypeAhead?: boolean;
}

export function Autocomplete<T>(input: AutocompleteProps<T>): JSX.Element {
  const [inputRef, setInputRef] = createSignal<HTMLInputElement | null>(null, {
    ownedWrite: true,
  });

  const [collectionRef, setCollectionRef] = createSignal<HTMLElement | null>(
    null,
    { ownedWrite: true }
  );

  const props = mergeProps(
    createSlottedContext(
      AutocompleteContext,
      untrack(() => input.slot)
    ),
    input
  );

  const state = createAutocompleteState(props);

  const aria = createAutocomplete(
    mergeProps(props, { collectionRef, inputRef }),
    state
  );

  return (
    <AutocompleteStateContext value={state}>
      <FieldInputContext
        value={mergeProps(
          merge(() => aria.inputProps ?? {}),
          {
            ref: (element: HTMLElement) => {
              setInputRef(element instanceof HTMLInputElement ? element : null);
            },
          }
        )}
      >
        <SelectableCollectionContext
          value={mergeProps(
            merge(() => aria.collectionProps ?? {}),
            {
              get filter() {
                return aria.filter;
              },
              ref: [
                (element: HTMLElement) => {
                  setCollectionRef(element);
                },
                aria.collectionRef,
              ],
            }
          )}
        >
          {props.children}
        </SelectableCollectionContext>
      </FieldInputContext>
    </AutocompleteStateContext>
  );
}
