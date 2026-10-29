/*
 * Copyright 2023 Adobe. All rights reserved.
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
 * Derived from Adobe React Spectrum: packages/react-aria-components/src/FieldError.tsx.
 * Modified for Solid Aria: adapted components, contexts, refs, and reactive properties for Solid 2; uses Solid class props.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { filterDOMProps } from "@solid2-aria/core/utils/filter-dom-props";
import { mergeProps } from "@solid2-aria/core/utils/merge-props";
import type { ValidationResult } from "@solid2-aria/types-shared";
import type { JSX } from "@solidjs/web";
import { untrack, createContext, Show, useContext } from "solid-js";

import { Text } from "./text";
import { createRenderProps } from "./utils";
import type { Ref, SlotProps, RenderProps } from "./utils";

export type FieldErrorRenderProps = ValidationResult;

export interface FieldErrorProps
  extends RenderProps<FieldErrorRenderProps>, SlotProps {
  id?: string;
  elementType?: keyof JSX.IntrinsicElements;
  ref?: Ref<HTMLElement>;
}

export const FieldErrorContext = createContext<ValidationResult | null>(null);

export function FieldError(props: FieldErrorProps): JSX.Element {
  const validation = useContext(FieldErrorContext);

  return (
    <Show when={validation?.isInvalid === true && validation}>
      {(v) => <FieldErrorInner {...props} validation={v()} />}
    </Show>
  );
}

function FieldErrorInner(
  props: FieldErrorProps & { validation: ValidationResult }
): JSX.Element {
  const { validation } = untrack(() => props);

  const render = createRenderProps(
    mergeProps(props, {
      get defaultChildren() {
        return validation.validationErrors.join(" ") || undefined;
      },
      defaultClass: "solid2-aria-FieldError",
      values: validation,
    })
  );

  return (
    <Text
      {...filterDOMProps(props, { global: true })}
      {...render}
      slot="errorMessage"
      elementType={props.elementType}
      ref={props.ref}
    />
  );
}
