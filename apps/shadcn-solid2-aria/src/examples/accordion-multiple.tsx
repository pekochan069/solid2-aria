/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/accordion-multiple.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { For } from "solid-js";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../registry/ui/accordion";

const items = [
  {
    content:
      "Manage how you receive notifications. You can enable email alerts for updates or push notifications for mobile devices.",
    trigger: "Notification Settings",
    value: "notifications",
  },
  {
    content:
      "Control your privacy settings and security preferences. Enable two-factor authentication, manage connected devices, review active sessions, and configure data sharing preferences. You can also download your data or delete your account.",
    trigger: "Privacy & Security",
    value: "privacy",
  },
  {
    content:
      "View your current plan, payment history, and upcoming invoices. Update your payment method, change your subscription tier, or cancel your subscription.",
    trigger: "Billing & Subscription",
    value: "billing",
  },
];

export function AccordionMultiple() {
  return (
    <Accordion
      allowsMultipleExpanded
      class="max-w-lg"
      defaultExpandedKeys={["notifications"]}
    >
      {
        <For each={items}>
          {(item) => (
            <AccordionItem id={item.value}>
              <AccordionTrigger>{item.trigger}</AccordionTrigger>
              <AccordionContent>{item.content}</AccordionContent>
            </AccordionItem>
          )}
        </For>
      }
    </Accordion>
  );
}

export default AccordionMultiple;
