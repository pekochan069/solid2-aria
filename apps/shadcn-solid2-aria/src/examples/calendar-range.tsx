/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/calendar-range.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { CalendarDate } from "@internationalized/date";
import type { DateRange } from "@solid2-aria/components";
import { createSignal } from "solid-js";

import { RangeCalendar } from "../registry/ui/calendar";

export function CalendarRange() {
  const [dateRange, setDateRange] = createSignal<DateRange | undefined>({
    end: new CalendarDate(new Date().getFullYear(), 1, 12).add({ days: 30 }),
    start: new CalendarDate(new Date().getFullYear(), 1, 12),
  });

  return (
    <RangeCalendar
      value={dateRange()}
      onChange={(value) => {
        setDateRange(value);
      }}
      numberOfMonths={2}
      class="rounded-lg border"
    />
  );
}

export default CalendarRange;
