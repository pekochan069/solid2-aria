import { expect, test } from "bun:test";

import { CalendarDate, createCalendar } from "@internationalized/date";
import { createCalendarState } from "@solid2-aria/stately/calendar/create-calendar-state";
import { createRoot, flush } from "solid-js";

import { createCalendarMonthPicker } from "../src/calendar/create-calendar-month-picker";
import { createCalendarYearPicker } from "../src/calendar/create-calendar-year-picker";

for (const locale of ["en-US", "en-US-u-ca-hebrew", "ja-JP-u-ca-japanese"]) {
  test(`calendar pickers preserve labels and current dates in ${locale}`, () => {
    const root = createRoot((dispose) => {
      const state = createCalendarState({
        createCalendar,
        defaultFocusedValue: new CalendarDate(2026, 10, 15),
        locale,
      });

      return {
        dispose,
        months: createCalendarMonthPicker({}, state),
        state,
        years: createCalendarYearPicker({}, state),
      };
    });

    try {
      flush();
      const months = root.months.items;
      const years = root.years.items;
      root.state.setFocusedDate(root.state.focusedDate.add({ days: 1 }));
      flush();
      expect(root.months.items).toBe(months);
      expect(root.years.items).toBe(years);

      const targetMonth = months.find(
        (item) => item.id === (root.state.focusedDate.month === 1 ? 2 : 1)
      );

      if (!targetMonth) {
        throw new Error("Missing target month");
      }

      const expectedMonth = root.state.focusedDate
        .set({ month: targetMonth.id })
        .toString();

      expect(targetMonth.date.toString()).toBe(expectedMonth);
      root.months.onChange(targetMonth.id);
      flush();
      expect(root.state.focusedDate.toString()).toBe(expectedMonth);

      const targetYear = root.years.items.find(
        (item) => item.id === Number(root.years.value) + 1
      );

      if (!targetYear) {
        throw new Error("Missing target year");
      }

      const expectedYear = targetYear.date.toString();
      root.years.onChange(targetYear.id);
      flush();
      expect(root.state.focusedDate.toString()).toBe(expectedYear);
    } finally {
      root.dispose();
    }
  });
}
