/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/calendar-booked-dates.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { CalendarDate, isSameDay } from "@internationalized/date";
import { createSignal } from "solid-js";

import { Calendar } from "../registry/ui/calendar";
import { Card, CardContent } from "../registry/ui/card";

export function CalendarBookedDates() {
  const [date, setDate] = createSignal<CalendarDate | undefined>(
    new CalendarDate(new Date().getFullYear(), 2, 3)
  );

  const bookedDates = Array.from(
    { length: 15 },
    (_, i) => new CalendarDate(new Date().getFullYear(), 2, 12 + i)
  );

  return (
    <Card class="mx-auto w-fit p-0">
      <CardContent class="p-0">
        <Calendar
          value={date()}
          onChange={(value) => {
            setDate(value);
          }}
          isDateUnavailable={(dateValue) =>
            bookedDates.some((d) => isSameDay(dateValue, d))
          }
        />
      </CardContent>
    </Card>
  );
}

export default CalendarBookedDates;
