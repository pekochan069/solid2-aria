/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/blocks/sidebar-15/components/date-picker.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { CalendarDate } from "@internationalized/date";
import { createSignal } from "solid-js";

import { Calendar } from "../../../registry/ui/calendar";
import {
  SidebarGroup,
  SidebarGroupContent,
} from "../../../registry/ui/sidebar";

export function DatePicker() {
  const [date, setDate] = createSignal<CalendarDate | undefined>(
    new CalendarDate(new Date().getFullYear(), new Date().getMonth() + 1, 12)
  );

  return (
    <SidebarGroup class="px-0">
      <SidebarGroupContent>
        <Calendar
          value={date()}
          onChange={(value) => {
            setDate(value);
          }}
          captionLayout="dropdown"
          class="bg-transparent [--cell-size:2.1rem]"
        />
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export default DatePicker;
