/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/questionnaire-resume.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { Button } from "../registry/ui/button";
import {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoices,
  QuestionnaireDescription,
  QuestionnaireError,
  QuestionnaireInput,
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
  { name: "change", required: true },
  { name: "verification", required: true },
  { name: "notes" },
] as const;

function handleSubmit(event: SubmitEvent & { currentTarget: HTMLFormElement }) {
  event.preventDefault();

  const formData = new FormData(event.currentTarget);

  const answers = {
    change: formString(formData.get("change")),
    notes: formString(formData.get("notes")),
    verification: formData.getAll("verification").map(formString),
  };

  toast("Draft updated", {
    description: `Migration: ${answers.change ?? "None"} · Verification: ${answers.verification.join(", ") || "None"} · Notes: ${answers.notes ?? "None"}`,
  });
}

export function QuestionnaireResume() {
  return (
    <Questionnaire
      class="mx-auto max-w-md"
      defaultItem="verification"
      items={items}
      onReset={() => {
        toast("Saved answers restored");
      }}
      onSubmit={handleSubmit}
    >
      <QuestionnaireProgress />

      <QuestionnaireItem name="change" required>
        <QuestionnaireTitle>What kind of migration is this?</QuestionnaireTitle>
        <QuestionnaireDescription>
          This answer was saved during the previous session.
        </QuestionnaireDescription>
        <QuestionnaireChoices>
          <QuestionnaireChoice value="incremental">
            Incremental migration
          </QuestionnaireChoice>
          <QuestionnaireChoice value="cutover">
            Single cutover
          </QuestionnaireChoice>
        </QuestionnaireChoices>
        <QuestionnaireError />
      </QuestionnaireItem>

      <QuestionnaireItem name="verification" multiple required>
        <QuestionnaireTitle>
          How should the migration be verified?
        </QuestionnaireTitle>
        <QuestionnaireDescription>
          These checks were selected during the previous session.
        </QuestionnaireDescription>
        <QuestionnaireChoices>
          <QuestionnaireChoice value="tests">
            Run migration tests
          </QuestionnaireChoice>
          <QuestionnaireChoice value="typecheck">
            Run the typecheck
          </QuestionnaireChoice>
          <QuestionnaireChoice value="manual">
            Perform a manual smoke test
          </QuestionnaireChoice>
        </QuestionnaireChoices>
        <QuestionnaireError />
      </QuestionnaireItem>

      <QuestionnaireItem name="notes">
        <QuestionnaireTitle>
          Anything else the agent should remember?
        </QuestionnaireTitle>
        <QuestionnaireDescription>
          This note was saved with the draft.
        </QuestionnaireDescription>
        <QuestionnaireInput
          aria-label="Saved migration note"
          defaultValue="Keep the existing public API stable."
        />
      </QuestionnaireItem>

      <QuestionnaireActions>
        <Button type="reset" variant="outline">
          Reset changes
        </Button>
        <QuestionnairePrevious />
        <QuestionnaireNext>Next</QuestionnaireNext>
        <QuestionnaireSubmit>Update draft</QuestionnaireSubmit>
      </QuestionnaireActions>
    </Questionnaire>
  );
}

export default QuestionnaireResume;
