/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/app/(app)/(root)/cards/notification-settings.tsx.
 * Modified for Solid Aria: Solid 2 JSX, local Solid2 Aria components, native attributes, and Lucide icons.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { For } from "solid-js";

import { Button } from "../../registry/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../registry/ui/card";
import { Checkbox } from "../../registry/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "../../registry/ui/field";

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
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>
          Choose which email and push alerts you want to receive.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <For each={NOTIFICATIONS}>
            {(n) => (
              <Field orientation="horizontal">
                <Checkbox
                  id={`notify-${n.id}`}
                  defaultSelected={n.defaultChecked}
                />
                <FieldContent>
                  <FieldLabel for={`notify-${n.id}`}>{n.label}</FieldLabel>
                  <FieldDescription>{n.description}</FieldDescription>
                </FieldContent>
              </Field>
            )}
          </For>
        </FieldGroup>
      </CardContent>
      <CardFooter>
        <Button class="w-full">Save Preferences</Button>
      </CardFooter>
    </Card>
  );
}
