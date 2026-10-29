/*
 * Copyright 2021 Adobe. All rights reserved.
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
 * Derived from Adobe React Spectrum: packages/react-aria/src/label/useField.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { HelpTextProps, Validation } from "@solid2-aria/types-shared";
import type { DOMAttributes } from "@solid2-aria/types-shared-web";

import { createSlotId } from "../utils/create-id";
import { getLegacyOption } from "../utils/legacy-option";
import { mergeProps } from "../utils/merge-props";
import { createLabel } from "./create-label";
import type { LabelAria, LabelAriaProps } from "./create-label";

export interface AriaFieldProps<T = unknown>
  extends LabelAriaProps, HelpTextProps, Omit<Validation<T>, "isRequired"> {}

export interface FieldAria extends LabelAria {
  /** Props for the description element, if any. */
  descriptionProps: DOMAttributes;
  /** Props for the error message element, if any. */
  errorMessageProps: DOMAttributes;
}

/**
 * Provides the accessibility implementation for input fields. Fields accept user input, gain
 * context from their label, and may display a description or error message.
 *
 * @param props - Props for the Field.
 */
export function createField<T>(props: AriaFieldProps<T>): FieldAria {
  const label = createLabel(props);

  const descriptionId = createSlotId(() => [
    Boolean(props.description),
    Boolean(props.errorMessage),
    props.isInvalid,
    getLegacyOption(props, "validationState"),
  ]);

  const errorMessageId = createSlotId(() => [
    Boolean(props.description),
    Boolean(props.errorMessage),
    props.isInvalid,
    getLegacyOption(props, "validationState"),
  ]);

  return {
    get descriptionProps() {
      return {
        get id() {
          return descriptionId();
        },
      };
    },
    get errorMessageProps() {
      return {
        get id() {
          return errorMessageId();
        },
      };
    },
    get fieldProps() {
      return mergeProps(label.fieldProps, {
        get "aria-describedby"() {
          return (
            [descriptionId(), errorMessageId(), props["aria-describedby"]]
              .filter(Boolean)
              .join(" ") || undefined
          );
        },
      });
    },
    get labelProps() {
      return label.labelProps;
    },
  };
}
