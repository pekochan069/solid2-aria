/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/calendar-presets.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { CalendarDate, getLocalTimeZone, today } from "@internationalized/date";
import { createSignal, For } from "solid-js";

import { Button } from "../registry/ui/button";
import { Calendar } from "../registry/ui/calendar";
import { Card, CardContent, CardFooter } from "../registry/ui/card";

export function CalendarWithPresets() {
  const [date, setDate] = createSignal<CalendarDate | undefined>(
    new CalendarDate(new Date().getFullYear(), 2, 12)
  );

  const [currentMonth, setCurrentMonth] = createSignal<CalendarDate>(
    new CalendarDate(new Date().getFullYear(), new Date().getMonth() + 1, 1)
  );

  return (
    <Card class="mx-auto w-fit max-w-[300px]" size="sm">
      <CardContent>
        <Calendar
          value={date()}
          onChange={(value) => {
            setDate(value);
          }}
          focusedValue={currentMonth()}
          onFocusChange={(value) => {
            setCurrentMonth(value);
          }}
          weeksInMonth={6}
          class="p-0 [--cell-size:--spacing(9.5)]"
        />
      </CardContent>
      <CardFooter class="flex flex-wrap gap-2 border-t">
        {
          <For
            each={[
              { label: "Today", value: 0 },
              { label: "Tomorrow", value: 1 },
              { label: "In 3 days", value: 3 },
              { label: "In a week", value: 7 },
              { label: "In 2 weeks", value: 14 },
            ]}
          >
            {(preset) => (
              <Button
                variant="outline"
                size="sm"
                class="flex-1"
                onPress={() => {
                  const newDate = today(getLocalTimeZone()).add({
                    days: preset.value,
                  });

                  setDate(newDate);
                  setCurrentMonth(newDate);
                }}
              >
                {preset.label}
              </Button>
            )}
          </For>
        }
      </CardFooter>
    </Card>
  );
}

export default CalendarWithPresets;
