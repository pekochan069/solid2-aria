/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/accordion-basic.tsx.
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
      "Click on 'Forgot Password' on the login page, enter your email address, and we'll send you a link to reset your password. The link will expire in 24 hours.",
    trigger: "How do I reset my password?",
    value: "item-1",
  },
  {
    content:
      "Yes, you can upgrade or downgrade your plan at any time from your account settings. Changes will be reflected in your next billing cycle.",
    trigger: "Can I change my subscription plan?",
    value: "item-2",
  },
  {
    content:
      "We accept all major credit cards, PayPal, and bank transfers. All payments are processed securely through our payment partners.",
    trigger: "What payment methods do you accept?",
    value: "item-3",
  },
];

export function AccordionBasic() {
  return (
    <Accordion defaultExpandedKeys={["item-1"]} class="max-w-lg">
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

export default AccordionBasic;
