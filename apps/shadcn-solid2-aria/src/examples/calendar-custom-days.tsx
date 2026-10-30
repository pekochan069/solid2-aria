/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/calendar-custom-days.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { CalendarDate, isWeekend } from "@internationalized/date";
import type { DateRange } from "@solid2-aria/components";
import { createLocale as useLocale } from "@solid2-aria/components";
import { createSignal } from "solid-js";

import { RangeCalendar } from "../registry/ui/calendar";
import { Card, CardContent } from "../registry/ui/card";

export function CalendarCustomDays() {
  const locale = useLocale();

  const [range, setRange] = createSignal<DateRange | undefined>({
    end: new CalendarDate(new Date().getFullYear(), 12, 8).add({ days: 10 }),
    start: new CalendarDate(new Date().getFullYear(), 12, 8),
  });

  return (
    <Card class="mx-auto w-fit p-0">
      <CardContent class="p-0">
        <RangeCalendar
          value={range()}
          onChange={(value) => {
            setRange(value);
          }}
          numberOfMonths={1}
          captionLayout="dropdown"
          class="[--cell-size:--spacing(10)] md:[--cell-size:--spacing(12)]"
          headerFormat={{ month: "long" }}
          renderCell={({ isOutsideMonth, date, defaultChildren }) => (
            <>
              {defaultChildren}
              {!isOutsideMonth && (
                <span>{isWeekend(date, locale.locale) ? "$120" : "$100"}</span>
              )}
            </>
          )}
        />
      </CardContent>
    </Card>
  );
}

export default CalendarCustomDays;
