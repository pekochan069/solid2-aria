/*
 * Copyright 2025 Adobe. All rights reserved.
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
 * Derived from Adobe React Spectrum: packages/react-aria-components/src/HiddenDateInput.tsx.
 * Modified for Solid Aria: composed Solid Aria and Stately primitives with Solid 2 contexts, reactive getters, and DOM refs.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import {
  parseDate,
  parseDateTime,
  toCalendarDate,
  toCalendarDateTime,
  toLocalTimeZone,
} from "@internationalized/date";
import type {
  HTMLAttributes,
  InputHTMLAttributes,
} from "@solid2-aria/core/types";
import { mergeProps } from "@solid2-aria/core/utils/merge-props";
import { createVisuallyHidden } from "@solid2-aria/core/visually-hidden/visually-hidden";
import type { DateFieldState } from "@solid2-aria/stately/datepicker/create-date-field-state";
import type { DatePickerState } from "@solid2-aria/stately/datepicker/create-date-picker-state";
import type { JSX } from "@solidjs/web";
import { untrack, merge } from "solid-js";

interface HiddenDateInputProps {
  autoComplete?: string;
  name?: string;
  isDisabled?: boolean;
  state: DateFieldState | DatePickerState;
}

export interface HiddenDateAria {
  containerProps: HTMLAttributes<HTMLDivElement>;
  inputProps: InputHTMLAttributes;
}

export function createHiddenDateInput(
  props: HiddenDateInputProps,
  state: DateFieldState | DatePickerState
): HiddenDateAria {
  const hidden = createVisuallyHidden({
    style: { left: 0, position: "fixed", top: 0 },
  });

  return {
    containerProps: mergeProps(
      merge(() => hidden.visuallyHiddenProps ?? {}),
      {
        "aria-hidden": "true",
        "data-a11y-ignore": "aria-hidden-focus",
        "data-react-aria-prevent-focus": true,
      }
    ),
    inputProps: {
      get autocomplete() {
        return props.autoComplete;
      },
      get disabled() {
        return props.isDisabled;
      },
      form: "",
      get name() {
        return props.name;
      },
      onChange(event) {
        const { value } = event.currentTarget;

        if (!value) {
          return;
        }

        try {
          state.setValue(
            state.granularity === "day"
              ? parseDate(value)
              : parseDateTime(value)
          );
        } catch {
          // Ignore incomplete native date values, as with the upstream autofill input.
        }
      },
      get step() {
        if (state.granularity === "second") {
          return 1;
        }

        return state.granularity === "hour" ? 3600 : 60;
      },
      tabindex: -1,
      get type() {
        return state.granularity === "day" ? "date" : "datetime-local";
      },
      get value() {
        if (!state.value) {
          return "";
        }

        return state.granularity === "day"
          ? toCalendarDate(state.value).toString()
          : toCalendarDateTime(
              "timeZone" in state.value
                ? toLocalTimeZone(state.value)
                : state.value
            ).toString();
      },
    },
  };
}

export function HiddenDateInput(props: HiddenDateInputProps): JSX.Element {
  const aria = createHiddenDateInput(
    props,
    untrack(() => props.state)
  );

  return (
    <div {...aria.containerProps} data-testid="hidden-dateinput-container">
      <input {...aria.inputProps} />
    </div>
  );
}
