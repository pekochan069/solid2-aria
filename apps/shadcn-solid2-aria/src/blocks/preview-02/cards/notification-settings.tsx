/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/blocks/preview-02/cards/notification-settings.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { createSignal, For, createMemo } from "solid-js";

import { Button } from "../../../registry/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../registry/ui/card";
import { Checkbox } from "../../../registry/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "../../../registry/ui/field";

const NOTIFICATIONS = [
  {
    defaultChecked: true,
    description: "Deposits, withdrawals, and transfers.",
    id: "transactions",
    label: "Transaction alerts",
  },
  {
    defaultChecked: true,
    description: "Login attempts and account changes.",
    id: "security",
    label: "Security alerts",
  },
  {
    defaultChecked: false,
    description: "Updates at 25%, 50%, 75%, and 100%.",
    id: "goals",
    label: "Goal milestones",
  },
  {
    defaultChecked: false,
    description: "Daily portfolio summary and price alerts.",
    id: "market",
    label: "Market updates",
  },
];

export function NotificationSettings() {
  const [checked, setChecked] = createSignal<Record<string, boolean>>(
    Object.fromEntries(NOTIFICATIONS.map((n) => [n.id, n.defaultChecked]))
  );

  const allChecked = createMemo(() =>
    NOTIFICATIONS.every((n) => checked()[n.id] === true)
  );

  const someChecked = createMemo(
    () => NOTIFICATIONS.some((n) => checked()[n.id] === true) && !allChecked()
  );

  const handleSelectAll = (value: boolean) => {
    setChecked(Object.fromEntries(NOTIFICATIONS.map((n) => [n.id, value])));
  };

  const handleToggle = (id: string, value: boolean) => {
    setChecked((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>
          Choose what you want to be notified about.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field orientation="horizontal">
            <Checkbox
              id="notify-all"
              isSelected={allChecked()}
              isIndeterminate={someChecked()}
              onChange={(value) => {
                handleSelectAll(value);
              }}
            />
            <FieldContent>
              <FieldLabel for="notify-all">Select all</FieldLabel>
            </FieldContent>
          </Field>
          {
            <For each={NOTIFICATIONS}>
              {(n) => (
                <Field orientation="horizontal">
                  <Checkbox
                    id={`notify-${n.id}`}
                    isSelected={checked()[n.id]}
                    onChange={(value) => {
                      handleToggle(n.id, value);
                    }}
                  />
                  <FieldContent>
                    <FieldLabel for={`notify-${n.id}`}>{n.label}</FieldLabel>
                    <FieldDescription>{n.description}</FieldDescription>
                  </FieldContent>
                </Field>
              )}
            </For>
          }
        </FieldGroup>
      </CardContent>
      <CardFooter>
        <Button class="w-full">Save Preferences</Button>
      </CardFooter>
    </Card>
  );
}

export default NotificationSettings;
