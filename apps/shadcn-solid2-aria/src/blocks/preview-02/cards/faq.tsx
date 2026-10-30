/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/blocks/preview-02/cards/faq.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { For } from "solid-js";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../../registry/ui/accordion";
import { Button } from "../../../registry/ui/button";
import { Card, CardContent, CardFooter } from "../../../registry/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../registry/ui/tabs";

const GENERAL_QUESTIONS = [
  {
    a: "We use bank-level AES-256 encryption, SOC 2 Type II certified infrastructure, and never store your credentials. All connections use read-only access tokens. We are a SEC registered investment advisor.",
    q: "How secure is my financial data with Ledger?",
  },
  {
    a: "Go to Settings > Linked Accounts and search for your institution. We support over 12,000 banks and brokerages via Plaid and MX.",
    q: "How do I connect my bank or investment accounts?",
  },
  {
    a: "Yes. Navigate to Reports > Tax Export to download a CSV or PDF summary of your transactions, dividends, and capital gains for any tax year.",
    q: "Can I export my data for tax purposes?",
  },
];

const BILLING_QUESTIONS = [
  {
    a: "Basic includes budgeting, goal tracking, and up to 3 linked accounts. Pro adds unlimited accounts, dividend tracking, portfolio analysis, and priority support.",
    q: "What is the difference between Basic and Pro pricing tiers?",
  },
  {
    a: "Go to Settings > Billing > Manage Plan and click Cancel. Your access continues until the end of your current billing period.",
    q: "How do I cancel my subscription?",
  },
  {
    a: "Yes. All new accounts start with a 14-day Pro trial. No credit card required.",
    q: "Do you offer a free trial?",
  },
];

const GOALS_QUESTIONS = [
  {
    a: "Click New Goal from the Savings Targets card. Choose a category, set a target amount and date, and we'll calculate the monthly contribution needed.",
    q: "How do I set up a custom financial goal?",
  },
  {
    a: "Yes. Pro accounts can track unlimited goals. Basic accounts support up to 3 active goals.",
    q: "Can I track multiple goals at once?",
  },
  {
    a: "We divide the remaining amount by the number of months until your target date, adjusted for your current savings rate and any auto-transfer schedules.",
    q: "How are monthly contributions calculated?",
  },
];

function QuestionList(componentProps: {
  questions: { q: string; a: string }[];
}) {
  return (
    <Accordion>
      {
        <For each={componentProps.questions}>
          {(item, index) => (
            <AccordionItem id={`question-${index()}`}>
              <AccordionTrigger>{item.q}</AccordionTrigger>
              <AccordionContent>{item.a}</AccordionContent>
            </AccordionItem>
          )}
        </For>
      }
    </Accordion>
  );
}

export function Faq() {
  return (
    <Card>
      <CardContent>
        <Tabs defaultSelectedKey="general">
          <TabsList class="w-full">
            <TabsTrigger id="general" class="flex-1">
              General
            </TabsTrigger>
            <TabsTrigger id="billing" class="flex-1">
              Billing
            </TabsTrigger>
            <TabsTrigger id="goals" class="flex-1">
              Goals
            </TabsTrigger>
          </TabsList>
          <TabsContent id="general">
            <QuestionList questions={GENERAL_QUESTIONS} />
          </TabsContent>
          <TabsContent id="billing">
            <QuestionList questions={BILLING_QUESTIONS} />
          </TabsContent>
          <TabsContent id="goals">
            <QuestionList questions={GOALS_QUESTIONS} />
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button variant="outline" class="w-full">
          Contact Support
        </Button>
        <Button variant="link" class="w-full">
          Learn More
        </Button>
      </CardFooter>
    </Card>
  );
}

export default Faq;
