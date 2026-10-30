/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/questionnaire-progress.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoices,
  QuestionnaireError,
  QuestionnaireItem,
  QuestionnaireNext,
  QuestionnairePrevious,
  QuestionnaireProgress,
  QuestionnaireSubmit,
  QuestionnaireTitle,
} from "../registry/ui/questionnaire";
import { toast } from "../registry/ui/sonner";
// Mount <Toaster /> once at the application root.
import { formString } from "./_form";

const items = [
  { name: "scope", required: true },
  { name: "strategy", required: true },
  { name: "tests", required: true },
  { name: "delivery", required: true },
] as const;

function handleSubmit(event: SubmitEvent & { currentTarget: HTMLFormElement }) {
  event.preventDefault();

  const formData = new FormData(event.currentTarget);

  toast("Pull request plan ready", {
    description: `Scope: ${formString(formData.get("scope")) ?? "None"} · Commits: ${formString(formData.get("strategy")) ?? "None"} · Tests: ${formString(formData.get("tests")) ?? "None"} · Delivery: ${formString(formData.get("delivery")) ?? "None"}`,
  });
}

export function QuestionnaireProgressExample() {
  return (
    <Questionnaire
      class="mx-auto max-w-md"
      defaultItem="scope"
      items={items}
      onSubmit={handleSubmit}
    >
      <QuestionnaireProgress class="w-full" />

      <QuestionnaireItem name="scope" required>
        <QuestionnaireTitle>How large is the change?</QuestionnaireTitle>
        <QuestionnaireChoices>
          <QuestionnaireChoice value="small">Small patch</QuestionnaireChoice>
          <QuestionnaireChoice value="medium">
            Feature-sized change
          </QuestionnaireChoice>
          <QuestionnaireChoice value="large">
            Cross-package change
          </QuestionnaireChoice>
        </QuestionnaireChoices>
        <QuestionnaireError />
      </QuestionnaireItem>

      <QuestionnaireItem name="strategy" required>
        <QuestionnaireTitle>
          How should commits be organized?
        </QuestionnaireTitle>
        <QuestionnaireChoices>
          <QuestionnaireChoice value="single">
            Single commit
          </QuestionnaireChoice>
          <QuestionnaireChoice value="logical">
            Logical commits
          </QuestionnaireChoice>
          <QuestionnaireChoice value="squash">
            Squash before review
          </QuestionnaireChoice>
        </QuestionnaireChoices>
        <QuestionnaireError />
      </QuestionnaireItem>

      <QuestionnaireItem name="tests" required>
        <QuestionnaireTitle>Which tests should run?</QuestionnaireTitle>
        <QuestionnaireChoices>
          <QuestionnaireChoice value="targeted">
            Targeted tests
          </QuestionnaireChoice>
          <QuestionnaireChoice value="package">
            Package suite
          </QuestionnaireChoice>
          <QuestionnaireChoice value="workspace">
            Full workspace
          </QuestionnaireChoice>
        </QuestionnaireChoices>
        <QuestionnaireError />
      </QuestionnaireItem>

      <QuestionnaireItem name="delivery" required>
        <QuestionnaireTitle>
          How should the work be delivered?
        </QuestionnaireTitle>
        <QuestionnaireChoices>
          <QuestionnaireChoice value="patch">Patch only</QuestionnaireChoice>
          <QuestionnaireChoice value="commit">
            Committed locally
          </QuestionnaireChoice>
          <QuestionnaireChoice value="branch">
            Push a review branch
          </QuestionnaireChoice>
        </QuestionnaireChoices>
        <QuestionnaireError />
      </QuestionnaireItem>

      <QuestionnaireActions>
        <QuestionnairePrevious />
        <QuestionnaireNext>Next</QuestionnaireNext>
        <QuestionnaireSubmit>Finish plan</QuestionnaireSubmit>
      </QuestionnaireActions>
    </Questionnaire>
  );
}

export default QuestionnaireProgressExample;
