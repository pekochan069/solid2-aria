/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/questionnaire-controlled.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { createSignal } from "solid-js";

import { hasKey } from "../lib/has-key";
// Mount <Toaster /> once at the application root.
import {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoices,
  QuestionnaireDescription,
  QuestionnaireError,
  QuestionnaireItem,
  QuestionnaireNext,
  QuestionnairePrevious,
  QuestionnaireProgress,
  QuestionnaireSubmit,
  QuestionnaireTitle,
} from "../registry/ui/questionnaire";
import { toast } from "../registry/ui/sonner";
import { formString } from "./_form";

const items = [
  { name: "scope", required: true },
  { name: "checks", required: true },
  { name: "output", required: true },
] as const;

const itemLabels = {
  checks: "Verification",
  output: "Final output",
  scope: "Change scope",
} satisfies Record<string, string>;

function handleSubmit(event: SubmitEvent & { currentTarget: HTMLFormElement }) {
  event.preventDefault();

  const formData = new FormData(event.currentTarget);

  toast("Agent workflow configured", {
    description: `Scope: ${formString(formData.get("scope")) ?? "None"} · Verification: ${formString(formData.get("checks")) ?? "None"} · Output: ${formString(formData.get("output")) ?? "None"}`,
  });
}

export function QuestionnaireControlled() {
  const [item, setItem] = createSignal<keyof typeof itemLabels>("scope");

  return (
    <div class="relative mx-auto flex h-full w-full max-w-md flex-col">
      <p
        class="text-muted-foreground absolute end-0 top-0 text-sm"
        role="status"
      >
        Current checkpoint: {itemLabels[item()]}
      </p>

      <Questionnaire
        class="mt-auto"
        item={item()}
        items={items}
        onItemChange={(value) => {
          if (hasKey(itemLabels, value)) {
            setItem(value);
          }
        }}
        onSubmit={handleSubmit}
      >
        <QuestionnaireProgress />

        <QuestionnaireItem name="scope" required>
          <QuestionnaireTitle>What may the agent change?</QuestionnaireTitle>
          <QuestionnaireDescription>
            The host stores the active checkpoint while Questionnaire navigates.
          </QuestionnaireDescription>
          <QuestionnaireChoices>
            <QuestionnaireChoice value="component">
              Only the target component
            </QuestionnaireChoice>
            <QuestionnaireChoice value="tests">
              Component and related tests
            </QuestionnaireChoice>
            <QuestionnaireChoice value="feature">
              The complete feature area
            </QuestionnaireChoice>
          </QuestionnaireChoices>
          <QuestionnaireError />
        </QuestionnaireItem>

        <QuestionnaireItem name="checks" required>
          <QuestionnaireTitle>
            Which verification level should it use?
          </QuestionnaireTitle>
          <QuestionnaireChoices>
            <QuestionnaireChoice value="targeted">
              Targeted tests
            </QuestionnaireChoice>
            <QuestionnaireChoice value="package">
              Package tests and typecheck
            </QuestionnaireChoice>
            <QuestionnaireChoice value="full">
              Full workspace verification
            </QuestionnaireChoice>
          </QuestionnaireChoices>
          <QuestionnaireError />
        </QuestionnaireItem>

        <QuestionnaireItem name="output" required>
          <QuestionnaireTitle>
            What should the agent return when finished?
          </QuestionnaireTitle>
          <QuestionnaireChoices>
            <QuestionnaireChoice value="summary">
              Concise summary
            </QuestionnaireChoice>
            <QuestionnaireChoice value="diff">
              Summary with changed files
            </QuestionnaireChoice>
            <QuestionnaireChoice value="handoff">
              Detailed implementation handoff
            </QuestionnaireChoice>
          </QuestionnaireChoices>
          <QuestionnaireError />
        </QuestionnaireItem>

        <QuestionnaireActions>
          <QuestionnairePrevious />
          <QuestionnaireNext>Next</QuestionnaireNext>
          <QuestionnaireSubmit>Save workflow</QuestionnaireSubmit>
        </QuestionnaireActions>
      </Questionnaire>
    </div>
  );
}

export default QuestionnaireControlled;
