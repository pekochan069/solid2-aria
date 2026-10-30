/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/calendar-time.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { CalendarDate } from "@internationalized/date";
import { Clock2Icon } from "@lucide/solid";
import { createSignal } from "solid-js";

import { Calendar } from "../registry/ui/calendar";
import { Card, CardContent, CardFooter } from "../registry/ui/card";
import { Field, FieldGroup, FieldLabel } from "../registry/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../registry/ui/input-group";

export function CalendarWithTime() {
  const [date, setDate] = createSignal<CalendarDate | undefined>(
    new CalendarDate(new Date().getFullYear(), new Date().getMonth() + 1, 12)
  );

  return (
    <Card size="sm" class="mx-auto w-fit">
      <CardContent>
        <Calendar
          value={date()}
          onChange={(value) => {
            setDate(value);
          }}
          class="p-0"
        />
      </CardContent>
      <CardFooter class="bg-card border-t">
        <FieldGroup>
          <Field>
            <FieldLabel for="time-from">Start Time</FieldLabel>
            <InputGroup>
              <InputGroupInput
                id="time-from"
                type="time"
                step="1"
                defaultValue="10:30:00"
                class="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
              />
              <InputGroupAddon>
                <Clock2Icon class="text-muted-foreground" />
              </InputGroupAddon>
            </InputGroup>
          </Field>
          <Field>
            <FieldLabel for="time-to">End Time</FieldLabel>
            <InputGroup>
              <InputGroupInput
                id="time-to"
                type="time"
                step="1"
                defaultValue="12:30:00"
                class="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
              />
              <InputGroupAddon>
                <Clock2Icon class="text-muted-foreground" />
              </InputGroupAddon>
            </InputGroup>
          </Field>
        </FieldGroup>
      </CardFooter>
    </Card>
  );
}

export default CalendarWithTime;
