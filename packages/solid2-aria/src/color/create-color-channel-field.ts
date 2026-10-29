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
 * Derived from Adobe React Spectrum: packages/react-aria/src/color/useColorChannelField.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type {
  ColorChannelFieldProps,
  ColorChannelFieldState,
} from "@solid2-aria/stately/color/create-color-channel-field-state";
import type { AriaLabelingProps } from "@solid2-aria/types-shared";
import { merge, omit } from "solid-js";
import type { Accessor } from "solid-js";

import { createLocale } from "../i18n/i18n-provider";
import { createNumberField } from "../numberfield/create-number-field";
import type { NumberFieldAria } from "../numberfield/create-number-field";
import { ariaValue } from "../utils/aria-value";
import { getTruthyValue, isTruthy } from "../utils/truthy";

export interface AriaColorChannelFieldProps
  extends ColorChannelFieldProps, AriaLabelingProps {}

export type ColorChannelFieldAria = NumberFieldAria;

/**
 * Provides the behavior and accessibility implementation for a color channel field, allowing users
 * to edit the value of an individual color channel.
 */
export function createColorChannelField(
  props: AriaColorChannelFieldProps,
  state: ColorChannelFieldState,
  inputRef: Accessor<HTMLInputElement | null>
): ColorChannelFieldAria {
  const _result0 = createLocale();

  return createNumberField(
    merge(omit(props, "value", "defaultValue", "onChange", "validate"), {
      get "aria-label"() {
        // Provide a default aria-label if no other label is provided.
        return ariaValue(
          ariaValue(
            getTruthyValue(props["aria-label"]) ??
              (isTruthy(props.label) || isTruthy(props["aria-labelledby"])
                ? undefined
                : state.colorValue.getChannelName(
                    props.channel,
                    _result0.locale
                  ))
          )
        );
      },
      defaultValue: undefined,
      onChange: undefined,
      validate: undefined,
      value: undefined,
    }),
    state,
    inputRef
  );
}
