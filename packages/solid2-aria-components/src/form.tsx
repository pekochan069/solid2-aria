/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
/*
 * Derived from Adobe React Spectrum: packages/react-aria-components/src/Form.tsx.
 * Modified for Solid Aria: adapted components, contexts, refs, and reactive properties for Solid 2; uses Solid class props.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { mergeProps } from "@solid2-aria/core/utils/merge-props";
import { FormValidationContext } from "@solid2-aria/stately/form/create-form-validation-state";
import type { ValidationErrors } from "@solid2-aria/types-shared";
import type { JSX } from "@solidjs/web";
import { untrack, createContext, omit, useContext } from "solid-js";

import { dom, createContextProps } from "./utils";
import type { Ref, ContextValue, SlotProps } from "./utils";

export interface FormProps
  extends
    Omit<
      JSX.FormHTMLAttributes<HTMLFormElement>,
      "ref" | "class" | "style" | "slot"
    >,
    SlotProps {
  class?: JSX.ClassValue;
  validationBehavior?: "native" | "aria";
  validationErrors?: ValidationErrors;
  ref?: Ref<HTMLFormElement>;
}

export const FormContext =
  createContext<ContextValue<FormProps, HTMLFormElement>>(null);

const NestedFormContext = createContext(false);

export function Form(input: FormProps): JSX.Element {
  const nested = useContext(NestedFormContext);

  const [props, , setRef] = createContextProps(
    nested ? mergeProps(input, { slot: null }) : input,
    untrack(() => input.ref),
    FormContext
  );

  return (
    <dom.form
      {
        // oxlint-disable solid/reactivity -- Keep prop filtering in the renderer's lazy evaluation.
        ...omit(props, "validationBehavior", "validationErrors", "ref", "slot")
        // oxlint-enable solid/reactivity
      }
      novalidate={props.validationBehavior === "aria" || props.novalidate}
      class={props.class ?? "solid2-aria-Form"}
      ref={(element: HTMLFormElement) => {
        setRef(element);
      }}
    >
      <NestedFormContext value={true}>
        <FormContext value={props}>
          <FormValidationContext value={props.validationErrors ?? {}}>
            {props.children}
          </FormValidationContext>
        </FormContext>
      </NestedFormContext>
    </dom.form>
  );
}
