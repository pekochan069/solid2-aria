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
 * Derived from Adobe React Spectrum: packages/react-aria/src/calendar/useCalendar.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { CalendarProps } from "@solid2-aria/stately/calendar/create-calendar-state";
import type {
  CalendarSelectionMode,
  CalendarState,
} from "@solid2-aria/stately/calendar/types";
import type { DateValue } from "@solid2-aria/stately/datepicker/types";
import type { AriaLabelingProps, DOMProps } from "@solid2-aria/types-shared";

import { createCalendarBase } from "./create-calendar-base";
import type { CalendarAria } from "./create-calendar-base";

export interface AriaCalendarProps<
  T extends DateValue,
  M extends CalendarSelectionMode = "single",
>
  extends CalendarProps<T, M>, DOMProps, AriaLabelingProps {}

/**
 * Provides the behavior and accessibility implementation for a calendar component.
 * A calendar displays one or more date grids and allows users to select a single date.
 */
export function createCalendar<
  T extends DateValue,
  M extends CalendarSelectionMode = "single",
>(props: AriaCalendarProps<T, M>, state: CalendarState<M>): CalendarAria {
  return createCalendarBase(props, state);
}
