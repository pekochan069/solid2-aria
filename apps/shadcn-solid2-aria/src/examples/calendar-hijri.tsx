/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/calendar-hijri.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { CalendarDate } from "@internationalized/date";
import { I18nProvider } from "@solid2-aria/components";
import { createSignal } from "solid-js";

import { Calendar } from "../registry/ui/calendar";

export default function CalendarHijri() {
  const [date, setDate] = createSignal<CalendarDate | undefined>(
    new CalendarDate(2025, 6, 12)
  );

  return (
    <div dir="rtl">
      <I18nProvider locale="fa-AF-u-ca-persian">
        <Calendar
          value={date()}
          onChange={(value) => {
            setDate(value);
          }}
          class="rounded-lg border"
        />
      </I18nProvider>
    </div>
  );
}
