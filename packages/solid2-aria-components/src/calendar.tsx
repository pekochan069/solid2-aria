/*
 * Copyright 2022 Adobe. All rights reserved.
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
 * Derived from Adobe React Spectrum: packages/react-aria-components/src/Calendar.tsx.
 * Modified for Solid Aria: composed Solid Aria and Stately primitives with Solid 2 contexts, reactive getters, and DOM refs; uses Solid class props.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import {
  createCalendar as createInternationalCalendar,
  endOfMonth,
  isSameDay,
  isSameMonth,
  isToday,
} from "@internationalized/date";
import type {
  CalendarDate,
  CalendarIdentifier,
  Calendar as ICalendar,
  DateDuration,
} from "@internationalized/date";
import { createCalendar } from "@solid2-aria/core/calendar/create-calendar";
import type { AriaCalendarProps } from "@solid2-aria/core/calendar/create-calendar";
import { createCalendarCell } from "@solid2-aria/core/calendar/create-calendar-cell";
import type { CalendarCellAria } from "@solid2-aria/core/calendar/create-calendar-cell";
import { createCalendarGrid } from "@solid2-aria/core/calendar/create-calendar-grid";
import { createCalendarHeading } from "@solid2-aria/core/calendar/create-calendar-heading";
import type { CalendarHeadingProps as AriaCalendarHeadingProps } from "@solid2-aria/core/calendar/create-calendar-heading";
import { createCalendarMonthPicker } from "@solid2-aria/core/calendar/create-calendar-month-picker";
import type {
  CalendarMonthPickerProps as AriaCalendarMonthPickerProps,
  CalendarMonthPickerAria,
} from "@solid2-aria/core/calendar/create-calendar-month-picker";
import { createCalendarYearPicker } from "@solid2-aria/core/calendar/create-calendar-year-picker";
import type {
  CalendarYearPickerProps as AriaCalendarYearPickerProps,
  CalendarYearPickerAria,
} from "@solid2-aria/core/calendar/create-calendar-year-picker";
import { createRangeCalendar } from "@solid2-aria/core/calendar/create-range-calendar";
import type { AriaRangeCalendarProps } from "@solid2-aria/core/calendar/create-range-calendar";
import { createFocusRing } from "@solid2-aria/core/focus/create-focus-ring";
import { createLocale } from "@solid2-aria/core/i18n/i18n-provider";
import { createHover } from "@solid2-aria/core/interactions/create-hover";
import { filterDOMProps } from "@solid2-aria/core/utils/filter-dom-props";
import { mergeProps } from "@solid2-aria/core/utils/merge-props";
import { requireValue } from "@solid2-aria/core/utils/require-value";
import { VisuallyHidden } from "@solid2-aria/core/visually-hidden/visually-hidden";
import { createCalendarState } from "@solid2-aria/stately/calendar/create-calendar-state";
import { createRangeCalendarState } from "@solid2-aria/stately/calendar/create-range-calendar-state";
import type {
  CalendarState,
  CalendarSelectionMode,
  RangeCalendarState,
  DateValue,
} from "@solid2-aria/stately/calendar/types";
import type { HoverEvents } from "@solid2-aria/types-shared";
import type {
  GlobalDOMAttributes,
  DOMAttributes,
} from "@solid2-aria/types-shared-web";
import type { JSX } from "@solidjs/web";
import {
  untrack,
  merge,
  createSignal,
  createContext,
  createMemo,
  For,
  Show,
  omit,
  useContext,
} from "solid-js";

import { ButtonContext } from "./button";
import { Heading, HeadingContext } from "./heading";
import type { HeadingProps } from "./heading";
import { TextContext } from "./text";
import {
  dom,
  assignRef,
  createContextProps,
  createSlottedContext,
  createRenderProps,
} from "./utils";
import type {
  ContextValue,
  RenderProps,
  StyleProps,
  SlotProps,
  DOMRenderProps,
  Ref,
} from "./utils";

export interface CalendarRenderProps<
  M extends CalendarSelectionMode = "single",
> {
  isDisabled: boolean;
  state: CalendarState<M>;
  isInvalid: boolean;
}

export interface RangeCalendarRenderProps extends Omit<
  CalendarRenderProps,
  "state"
> {
  state: RangeCalendarState;
}

export interface CalendarProps<
  T extends DateValue,
  M extends CalendarSelectionMode = "single",
>
  extends
    Omit<AriaCalendarProps<T, M>, "errorMessage" | "validationState">,
    RenderProps<CalendarRenderProps<M>>,
    SlotProps,
    GlobalDOMAttributes<HTMLDivElement> {
  visibleDuration?: DateDuration;
  createCalendar?: (identifier: CalendarIdentifier) => ICalendar;
  ref?: Ref<HTMLDivElement>;
}

export interface RangeCalendarProps<T extends DateValue>
  extends
    Omit<AriaRangeCalendarProps<T>, "errorMessage" | "validationState">,
    RenderProps<RangeCalendarRenderProps>,
    SlotProps,
    GlobalDOMAttributes<HTMLDivElement> {
  visibleDuration?: DateDuration;
  createCalendar?: (identifier: CalendarIdentifier) => ICalendar;
  ref?: Ref<HTMLDivElement>;
}

type CalendarContextProps = CalendarProps<DateValue, CalendarSelectionMode>;

export const CalendarContext =
  createContext<ContextValue<CalendarContextProps, HTMLDivElement>>(null);

export const RangeCalendarContext =
  createContext<ContextValue<RangeCalendarProps<DateValue>, HTMLDivElement>>(
    null
  );

export const CalendarStateContext =
  createContext<CalendarState<CalendarSelectionMode> | null>(null);

export const RangeCalendarStateContext =
  createContext<RangeCalendarState | null>(null);

export function Calendar<
  T extends DateValue,
  M extends CalendarSelectionMode = "single",
>(input: CalendarProps<T, M>): JSX.Element {
  const [props, , setRef] = createContextProps(
    input,
    untrack(() => input.ref),
    CalendarContext
  );

  const locale = createLocale();
  // SAFETY: A calendar subtree preserves its input date class and selection mode; the shared context represents both supported modes.
  // oxlint-disable-next-line anti-slop/no-chained-type-assertions, typescript/no-unsafe-type-assertion -- Generic callback variance is erased only at this shared context boundary.
  const contextProps = props as unknown as CalendarContextProps;

  const state = createCalendarState(
    mergeProps(props, {
      get createCalendar() {
        return props.createCalendar ?? createInternationalCalendar;
      },
      get locale() {
        return locale.locale;
      },
    })
  );

  const aria = createCalendar(props, state);

  const values: CalendarRenderProps<M> = {
    get isDisabled() {
      return props.isDisabled ?? false;
    },
    get isInvalid() {
      return state.isValueInvalid;
    },
    state,
  };

  const render = createRenderProps(
    mergeProps(props, { defaultClass: "solid2-aria-Calendar", values })
  );

  return (
    <dom.div
      {...mergeProps(
        filterDOMProps(props, { global: true }),
        render,
        merge(() => aria.calendarProps)
      )}
      ref={(element: HTMLDivElement) => {
        setRef(element);
      }}
      slot={
        typeof props.slot === "string" && props.slot.length > 0
          ? props.slot
          : undefined
      }
      data-disabled={props.isDisabled === true ? true : undefined}
      data-invalid={state.isValueInvalid || undefined}
    >
      <ButtonContext
        value={{
          slots: {
            get next() {
              return aria.nextButtonProps;
            },
            get previous() {
              return aria.prevButtonProps;
            },
          },
        }}
      >
        <HeadingContext
          value={{
            "aria-hidden": "true",
            get children() {
              return aria.title;
            },
            level: 2,
          }}
        >
          <CalendarStateContext value={state}>
            <CalendarContext value={contextProps}>
              <TextContext
                value={{
                  slots: {
                    get errorMessage() {
                      return aria.errorMessageProps;
                    },
                  },
                }}
              >
                <VisuallyHidden>
                  <h2>{aria.calendarProps["aria-label"]}</h2>
                </VisuallyHidden>
                {render.children}
                <VisuallyHidden>
                  <button
                    aria-label={aria.nextButtonProps["aria-label"]}
                    disabled={aria.nextButtonProps.isDisabled}
                    onClick={() => {
                      state.focusNextPage();
                    }}
                    tabindex={-1}
                  />
                </VisuallyHidden>
              </TextContext>
            </CalendarContext>
          </CalendarStateContext>
        </HeadingContext>
      </ButtonContext>
    </dom.div>
  );
}

export function RangeCalendar<T extends DateValue>(
  input: RangeCalendarProps<T>
): JSX.Element {
  const [props, ref, setRef] = createContextProps(
    input,
    untrack(() => input.ref),
    RangeCalendarContext
  );

  const locale = createLocale();

  // SAFETY: Range calendar state preserves the date class supplied by its value and callback; the internal factory exposes the common DateValue interface.
  // oxlint-disable-next-line anti-slop/no-chained-type-assertions, typescript/no-unsafe-type-assertion -- Widen the invariant generic callback at the state and context boundary.
  const contextProps = props as unknown as RangeCalendarProps<DateValue>;

  const state = createRangeCalendarState(
    mergeProps(contextProps, {
      get createCalendar() {
        return props.createCalendar ?? createInternationalCalendar;
      },
      get locale() {
        return locale.locale;
      },
    })
  );

  const aria = createRangeCalendar(props, state, ref);

  const values: RangeCalendarRenderProps = {
    get isDisabled() {
      return props.isDisabled ?? false;
    },
    get isInvalid() {
      return state.isValueInvalid;
    },
    state,
  };

  const render = createRenderProps(
    mergeProps(props, { defaultClass: "solid2-aria-RangeCalendar", values })
  );

  return (
    <dom.div
      {...mergeProps(
        filterDOMProps(props, { global: true }),
        render,
        merge(() => aria.calendarProps)
      )}
      ref={(element: HTMLDivElement) => {
        setRef(element);
      }}
      slot={
        typeof props.slot === "string" && props.slot.length > 0
          ? props.slot
          : undefined
      }
      data-disabled={props.isDisabled === true ? true : undefined}
      data-invalid={state.isValueInvalid || undefined}
    >
      <ButtonContext
        value={{
          slots: {
            get next() {
              return aria.nextButtonProps;
            },
            get previous() {
              return aria.prevButtonProps;
            },
          },
        }}
      >
        <HeadingContext
          value={{
            "aria-hidden": "true",
            get children() {
              return aria.title;
            },
            level: 2,
          }}
        >
          <RangeCalendarStateContext value={state}>
            <RangeCalendarContext value={contextProps}>
              <TextContext
                value={{
                  slots: {
                    get errorMessage() {
                      return aria.errorMessageProps;
                    },
                  },
                }}
              >
                <VisuallyHidden>
                  <h2>{aria.calendarProps["aria-label"]}</h2>
                </VisuallyHidden>
                {render.children}
                <VisuallyHidden>
                  <button
                    aria-label={aria.nextButtonProps["aria-label"]}
                    disabled={aria.nextButtonProps.isDisabled}
                    onClick={() => {
                      state.focusNextPage();
                    }}
                    tabindex={-1}
                  />
                </VisuallyHidden>
              </TextContext>
            </RangeCalendarContext>
          </RangeCalendarStateContext>
        </HeadingContext>
      </ButtonContext>
    </dom.div>
  );
}

interface InternalCalendarGridContextValue {
  headerProps: DOMAttributes;
  weekDays: string[];
  startDate: CalendarDate;
  weeksInMonth: number;
}

const InternalCalendarGridContext =
  createContext<InternalCalendarGridContextValue | null>(null);

export interface CalendarGridProps
  extends
    StyleProps,
    DOMRenderProps<"table", undefined>,
    GlobalDOMAttributes<HTMLTableElement> {
  children?: JSX.Element | ((date: CalendarDate) => JSX.Element);
  offset?: DateDuration;
  weekdayStyle?: "narrow" | "short" | "long";
  ref?: Ref<HTMLTableElement>;
}

export interface CalendarGridHeaderProps
  extends
    StyleProps,
    DOMRenderProps<"thead", undefined>,
    GlobalDOMAttributes<HTMLTableSectionElement> {
  children: (day: string) => JSX.Element;
  ref?: Ref<HTMLTableSectionElement>;
}

export interface CalendarHeaderCellProps
  extends
    StyleProps,
    DOMRenderProps<"th", undefined>,
    GlobalDOMAttributes<HTMLTableCellElement> {
  children?: JSX.Element;
  ref?: Ref<HTMLTableCellElement>;
  id?: string;
}

export interface CalendarGridBodyProps
  extends
    StyleProps,
    DOMRenderProps<"tbody", undefined>,
    GlobalDOMAttributes<HTMLTableSectionElement> {
  children: (date: CalendarDate) => JSX.Element;
  ref?: Ref<HTMLTableSectionElement>;
}

function calendarState() {
  return (
    useContext(CalendarStateContext) ??
    requireValue(
      useContext(RangeCalendarStateContext),
      "Expected required element or component context"
    )
  );
}

export function CalendarGrid(props: CalendarGridProps): JSX.Element {
  const state = calendarState();
  const calendar = createSlottedContext(CalendarContext);
  const rangeCalendar = createSlottedContext(RangeCalendarContext);

  const start = createMemo(() =>
    props.offset
      ? state.visibleRange.start.add(props.offset)
      : state.visibleRange.start
  );

  const aria = createCalendarGrid(
    {
      get endDate() {
        return endOfMonth(start());
      },
      get firstDayOfWeek() {
        return calendar?.firstDayOfWeek ?? rangeCalendar?.firstDayOfWeek;
      },
      get startDate() {
        return start();
      },
      get weekdayStyle() {
        return props.weekdayStyle;
      },
    },
    state
  );

  const context = {
    get headerProps() {
      return aria.headerProps;
    },
    get startDate() {
      return start();
    },
    get weekDays() {
      return aria.weekDays;
    },
    get weeksInMonth() {
      return aria.weeksInMonth;
    },
  };

  return (
    <InternalCalendarGridContext value={context}>
      <dom.table
        {...mergeProps(
          filterDOMProps(props, { global: true }),
          merge(() => aria.gridProps)
        )}
        ref={(element: HTMLTableElement) => {
          assignRef(
            untrack(() => props.ref),
            element
          );
        }}
        style={props.style}

        class={props.class ?? "solid2-aria-CalendarGrid"}
        render={props.render}
      >
        {typeof props.children === "function" ? (
          <>
            <CalendarGridHeader>
              {(day) => <CalendarHeaderCell>{day}</CalendarHeaderCell>}
            </CalendarGridHeader>
            <CalendarGridBody>
              {(date) => (
                <>
                  {typeof props.children === "function"
                    ? props.children(date)
                    : null}
                </>
              )}
            </CalendarGridBody>
          </>
        ) : (
          props.children
        )}
      </dom.table>
    </InternalCalendarGridContext>
  );
}

export function CalendarGridHeader(
  props: CalendarGridHeaderProps
): JSX.Element {
  const ctx = requireValue(
    useContext(InternalCalendarGridContext),
    "Expected required element or component context"
  );

  return (
    <dom.thead
      {...mergeProps(
        filterDOMProps(props, { global: true }),
        merge(() => ctx.headerProps)
      )}
      ref={(el: HTMLTableSectionElement) => {
        assignRef(
          untrack(() => props.ref),
          el
        );
      }}
      style={props.style}
      class={props.class ?? "solid2-aria-CalendarGridHeader"}
      render={props.render}
    >
      <tr>
        <For each={ctx.weekDays}>{(day) => <>{props.children(day)}</>}</For>
      </tr>
    </dom.thead>
  );
}

export function CalendarHeaderCell(
  props: CalendarHeaderCellProps
): JSX.Element {
  return (
    <dom.th
      {...filterDOMProps(props, { global: true })}
      ref={(el: HTMLTableCellElement) => {
        assignRef(
          untrack(() => props.ref),
          el
        );
      }}
      style={props.style}
      class={props.class ?? "solid2-aria-CalendarHeaderCell"}
      render={props.render}
    >
      {props.children}
    </dom.th>
  );
}

export function CalendarGridBody(props: CalendarGridBodyProps): JSX.Element {
  const state = calendarState();

  const ctx = requireValue(
    useContext(InternalCalendarGridContext),
    "Expected required element or component context"
  );

  const weeks = createMemo(() =>
    Array.from({ length: ctx.weeksInMonth }, (_, index) => index)
  );

  return (
    <dom.tbody
      {...filterDOMProps(props, { global: true })}
      ref={(el: HTMLTableSectionElement) => {
        assignRef(
          untrack(() => props.ref),
          el
        );
      }}
      style={props.style}
      class={props.class ?? "solid2-aria-CalendarGridBody"}
      render={props.render}
    >
      <For each={weeks()}>
        {(week) => (
          <tr>
            <For each={state.getDatesInWeek(week, ctx.startDate)} keyed={false}>
              {(date) => (
                <Show when={date()} fallback={<td />}>
                  {(current) => <>{props.children(current())}</>}
                </Show>
              )}
            </For>
          </tr>
        )}
      </For>
    </dom.tbody>
  );
}

export interface CalendarCellRenderProps extends Omit<
  CalendarCellAria,
  "cellProps" | "buttonProps"
> {
  date: CalendarDate;
  isHovered: boolean;
  isSelectionStart: boolean;
  isSelectionEnd: boolean;
  isFocusVisible: boolean;
  isOutsideMonth: boolean;
  isToday: boolean;
}

export interface CalendarCellProps
  extends
    RenderProps<CalendarCellRenderProps>,
    HoverEvents,
    GlobalDOMAttributes<HTMLTableCellElement> {
  date: CalendarDate;
  ref?: Ref<HTMLTableCellElement>;
}

export function CalendarCell(props: CalendarCellProps): JSX.Element {
  const state = calendarState();
  const grid = useContext(InternalCalendarGridContext);

  const [buttonRef, setButtonRef] = createSignal<HTMLDivElement | null>(null, {
    ownedWrite: true,
  });

  const outside = () =>
    Boolean(state.visibleDuration.days) || Boolean(state.visibleDuration.weeks)
      ? false
      : !isSameMonth(grid?.startDate ?? state.visibleRange.start, props.date);

  const aria = createCalendarCell(
    {
      get date() {
        return props.date;
      },
      get isOutsideMonth() {
        return outside();
      },
    },
    state,
    buttonRef
  );

  const focus = createFocusRing();

  const hover = createHover(
    mergeProps(props, {
      get isDisabled() {
        return aria.isDisabled || aria.isUnavailable;
      },
    })
  );

  const boundary = (end: boolean) =>
    "highlightedRange" in state &&
    !!state.highlightedRange &&
    isSameDay(
      props.date,
      end ? state.highlightedRange.end : state.highlightedRange.start
    );

  const values: CalendarCellRenderProps = mergeProps(
    omit(aria, "cellProps", "buttonProps"),
    {
      get date() {
        return props.date;
      },
      get isFocusVisible() {
        return aria.isFocused && focus.isFocusVisible;
      },
      get isHovered() {
        return hover.isHovered;
      },
      get isOutsideMonth() {
        return outside();
      },
      get isSelectionEnd() {
        return boundary(true);
      },
      get isSelectionStart() {
        return boundary(false);
      },
      get isToday() {
        return isToday(props.date, state.timeZone);
      },
    }
  );

  const render = createRenderProps(
    mergeProps(props, {
      get defaultChildren() {
        return aria.formattedDate;
      },
      defaultClass: "solid2-aria-CalendarCell",
      values,
    })
  );

  const content = createMemo(() => render.children);

  return (
    <td
      {...aria.cellProps}
      ref={(element: HTMLTableCellElement) => {
        assignRef(
          untrack(() => props.ref),
          element
        );
      }}
    >
      <dom.div
        {...mergeProps(
          filterDOMProps(props, { global: true }),
          merge(() => aria.buttonProps),
          merge(() => focus.focusProps ?? {}),
          merge(() => hover.hoverProps ?? {}),
          omit(render, "children")
        )}
        ref={(element: HTMLDivElement) => {
          setButtonRef(element);
        }}
        data-focused={aria.isFocused || undefined}
        data-hovered={hover.isHovered || undefined}
        data-pressed={aria.isPressed || undefined}
        data-unavailable={aria.isUnavailable || undefined}
        data-disabled={aria.isDisabled || undefined}
        data-focus-visible={values.isFocusVisible || undefined}
        data-outside-visible-range={aria.isOutsideVisibleRange || undefined}
        data-outside-month={outside() || undefined}
        data-selected={aria.isSelected || undefined}
        data-selection-start={values.isSelectionStart || undefined}
        data-selection-end={values.isSelectionEnd || undefined}
        data-invalid={aria.isInvalid || undefined}
        data-today={values.isToday || undefined}
      >
        {content()}
      </dom.div>
    </td>
  );
}

export interface CalendarYearPickerProps extends AriaCalendarYearPickerProps {
  children: (props: CalendarYearPickerAria) => JSX.Element;
}

export function CalendarYearPicker(
  props: CalendarYearPickerProps
): JSX.Element {
  const aria = createCalendarYearPicker(props, calendarState());

  return untrack(() => props.children(aria));
}

export interface CalendarMonthPickerProps extends AriaCalendarMonthPickerProps {
  children: (props: CalendarMonthPickerAria) => JSX.Element;
}

export function CalendarMonthPicker(
  props: CalendarMonthPickerProps
): JSX.Element {
  const aria = createCalendarMonthPicker(props, calendarState());

  return untrack(() => props.children(aria));
}

export interface CalendarHeadingProps
  extends AriaCalendarHeadingProps, HeadingProps {}

export function CalendarHeading(props: CalendarHeadingProps): JSX.Element {
  const text = createCalendarHeading(props, calendarState());

  return (
    <Heading
      {
        // oxlint-disable solid/reactivity -- Keep prop filtering in the renderer's lazy evaluation.
        ...omit(props, "offset", "format")
        // oxlint-enable solid/reactivity
      }
      class={props.class ?? "solid2-aria-CalendarHeading"}
    >
      {text()}
    </Heading>
  );
}
