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
 * Derived from Adobe React Spectrum: packages/react-aria/src/select/HiddenSelect.tsx.
 * Modified for Solid Aria: adapted components, imports, and reactive lifecycle for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type {
  SelectionMode,
  SelectState,
} from "@solid2-aria/stately/select/create-select-state";
import type { FocusableElement } from "@solid2-aria/types-shared";
import type { JSX } from "@solidjs/web";
import { createSignal, createMemo, For, merge, Show, untrack } from "solid-js";
import type { Accessor, Element as SolidElement } from "solid-js";

import { createFormValidation } from "../form/create-form-validation";
import { createFormReset } from "../utils/create-form-reset";
import { isPresent } from "../utils/is-present";
import { whenTruthy } from "../utils/truthy";
import { createVisuallyHidden } from "../visually-hidden/visually-hidden";
import { selectData } from "./create-select";

export interface AriaHiddenSelectProps {
  autoComplete?: string;
  label?: SolidElement;
  name?: string;
  form?: string;
  isDisabled?: boolean;
}

export interface HiddenSelectProps<
  T,
  M extends SelectionMode = "single",
> extends AriaHiddenSelectProps {
  state: SelectState<T, M>;
  triggerRef: Accessor<FocusableElement | null>;
}

export interface AriaHiddenSelectOptions extends AriaHiddenSelectProps {
  selectRef?: Accessor<HTMLSelectElement | HTMLInputElement | null>;
}

export interface HiddenSelectAria {
  containerProps: JSX.HTMLAttributes<HTMLDivElement> & {
    "data-react-aria-prevent-focus": boolean;
    "data-a11y-ignore": string;
  };
  inputProps: JSX.InputHTMLAttributes<HTMLInputElement>;
  selectProps: JSX.SelectHTMLAttributes<HTMLSelectElement>;
}

export function createHiddenSelect<T, M extends SelectionMode = "single">(
  props: AriaHiddenSelectOptions,
  state: SelectState<T, M>,
  triggerRef: Accessor<FocusableElement | null>
): HiddenSelectAria {
  const data = () => selectData.get(state);

  const hidden = createVisuallyHidden({
    style: { left: 0, position: "fixed", top: 0 },
  });

  createFormReset(
    () => props.selectRef?.() ?? null,
    () => state.defaultValue,
    state.setValue
  );
  createFormValidation(
    {
      focus: () => triggerRef()?.focus(),
      get validationBehavior() {
        return data()?.validationBehavior;
      },
    },
    state,
    props.selectRef
  );

  const onChange: JSX.EventHandler<HTMLSelectElement, Event> = (event) => {
    const element = event.currentTarget;

    const value = element.multiple
      ? Array.from(element.selectedOptions, (option) => option.value)
      : element.value;

    state.setValue(value);
  };

  return {
    containerProps:
      // oxlint-disable solid/reactivity -- Keep prop filtering in the renderer's lazy evaluation.
      merge(hidden.visuallyHiddenProps, {
        "aria-hidden": "true",
        "data-a11y-ignore": "aria-hidden-focus",
        "data-react-aria-prevent-focus": true,
      } satisfies HiddenSelectAria["containerProps"]),
    // oxlint-enable solid/reactivity
    inputProps: { style: { display: "none" } },
    selectProps: {
      get autocomplete() {
        return props.autoComplete;
      },
      get disabled() {
        return props.isDisabled ?? data()?.isDisabled;
      },
      get form() {
        return props.form ?? data()?.form;
      },
      get multiple() {
        return state.selectionManager.selectionMode === "multiple";
      },
      get name() {
        return props.name ?? data()?.name;
      },
      onChange,
      onInput: onChange,
      get required() {
        return data()?.validationBehavior === "native" && data()?.isRequired;
      },
      tabindex: -1,
      get value() {
        const { value } = state;

        if (Array.isArray(value)) {
          return value.map(String);
        }

        if (isPresent(value)) {
          return String(value);
        }

        return "";
      },
    },
  };
}

export function HiddenSelect<T, M extends SelectionMode = "single">(
  props: HiddenSelectProps<T, M>
): SolidElement {
  const [selectRef, setSelectRef] = createSignal<
    HTMLSelectElement | HTMLInputElement | null
  >(null, { ownedWrite: true });

  const aria = createHiddenSelect(
    merge(props, { selectRef }),
    untrack(() => props.state),
    untrack(() => props.triggerRef)
  );

  const values = createMemo(() => {
    const { value } = props.state;

    return Array.isArray(value) ? value : [value];
  });

  return (
    <Show
      when={props.state.collection.size <= 300}
      fallback={
        <>
          <For each={values().length ? values() : [null]}>
            {(value, index) => (
              <input
                type={
                  selectData.get(props.state)?.validationBehavior === "native"
                    ? "text"
                    : "hidden"
                }
                ref={(node) => {
                  if (index() === 0) {
                    setSelectRef(node);
                  }
                }}
                autocomplete={aria.selectProps.autocomplete}
                name={aria.selectProps.name}
                form={aria.selectProps.form}
                disabled={aria.selectProps.disabled}
                value={isPresent(value) ? String(value) : ""}
                style={{ display: "none" }}
                required={index() === 0 && aria.selectProps.required}
              />
            )}
          </For>
        </>
      }
    >
      <div {...aria.containerProps} data-testid="hidden-select-container">
        <label>
          {props.label}
          <select
            {...aria.selectProps}
            ref={(node) => {
              setSelectRef(node);
            }}
          >
            <option value="" label={"\u00A0"}>
              {"\u00A0"}
            </option>
            <For each={[...props.state.collection.getKeys()]}>
              {(key) => (
                <Show
                  when={props.state.collection.getItem(key)?.type === "item"}
                >
                  <option
                    value={String(key)}
                    defaultSelected={props.state.selectionManager.isSelected(
                      key
                    )}
                    selected={props.state.selectionManager.isSelected(key)}
                  >
                    {props.state.collection.getItem(key)?.textValue}
                  </option>
                </Show>
              )}
            </For>
            {whenTruthy(
              whenTruthy(props.state.collection.size === 0, () => props.name),
              () =>
                values().map((value) => (
                  <option
                    value={isPresent(value) ? String(value) : ""}
                    selected
                    defaultSelected
                  />
                ))
            )}
          </select>
        </label>
      </div>
    </Show>
  );
}
