/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/calendar-demo.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { getLocalTimeZone, today } from "@internationalized/date";
import type { CalendarDate } from "@internationalized/date";
import { createSignal } from "solid-js";

import { Calendar } from "../registry/ui/calendar";

export default function CalendarDemo() {
  const [date, setDate] = createSignal<CalendarDate | undefined>(
    today(getLocalTimeZone())
  );

  return (
    <Calendar
      value={date()}
      onChange={(value) => {
        setDate(value);
      }}
      class="rounded-lg border"
      captionLayout="dropdown"
    />
  );
}
