/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/questionnaire-dialog.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { createSignal } from "solid-js";

// Mount <Toaster /> once at the application root.
import { Button } from "../registry/ui/button";
import {
  Dialog,
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "../registry/ui/dialog";
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
  { name: "tests", required: true },
] as const;

export function QuestionnaireDialog() {
  const [open, setOpen] = createSignal(false);

  function handleSubmit(
    event: SubmitEvent & { currentTarget: HTMLFormElement }
  ) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    setOpen(false);
    toast("Clarification sent", {
      description: `Scope: ${formString(formData.get("scope")) ?? "None"} · Verification: ${formString(formData.get("tests")) ?? "None"}`,
    });
  }

  return (
    <DialogTrigger
      isOpen={open()}
      onOpenChange={(value) => {
        setOpen(value);
      }}
    >
      <Button variant="outline">Open clarification</Button>
      <Dialog>
        <Questionnaire
          defaultItem="scope"
          items={items}
          onSubmit={handleSubmit}
        >
          <QuestionnaireItem name="scope" required>
            <DialogHeader>
              <QuestionnaireProgress />
              <QuestionnaireTitle>Which files are in scope?</QuestionnaireTitle>
              <QuestionnaireDescription>
                Choose how broadly the agent can update the workspace.
              </QuestionnaireDescription>
            </DialogHeader>
            <QuestionnaireChoices>
              <QuestionnaireChoice value="component">
                Component only
              </QuestionnaireChoice>
              <QuestionnaireChoice value="feature">
                Complete feature directory
              </QuestionnaireChoice>
              <QuestionnaireChoice value="workspace">
                Any related workspace file
              </QuestionnaireChoice>
            </QuestionnaireChoices>
            <QuestionnaireError />
          </QuestionnaireItem>

          <QuestionnaireItem name="tests" required>
            <DialogHeader>
              <QuestionnaireProgress />
              <QuestionnaireTitle>
                How much verification is needed?
              </QuestionnaireTitle>
              <QuestionnaireDescription>
                Choose the checks the agent should run before handoff.
              </QuestionnaireDescription>
            </DialogHeader>
            <QuestionnaireChoices>
              <QuestionnaireChoice value="targeted">
                Targeted tests
              </QuestionnaireChoice>
              <QuestionnaireChoice value="package">
                Package tests
              </QuestionnaireChoice>
              <QuestionnaireChoice value="full">
                Full workspace verification
              </QuestionnaireChoice>
            </QuestionnaireChoices>
            <QuestionnaireError />
          </QuestionnaireItem>

          <DialogFooter>
            <DialogClose type="button" variant="outline">
              Cancel
            </DialogClose>
            <QuestionnaireActions>
              <QuestionnairePrevious />
              <QuestionnaireNext>Next</QuestionnaireNext>
              <QuestionnaireSubmit>Send answer</QuestionnaireSubmit>
            </QuestionnaireActions>
          </DialogFooter>
        </Questionnaire>
      </Dialog>
    </DialogTrigger>
  );
}

export default QuestionnaireDialog;
