/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/questionnaire-card.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { createUniqueId } from "solid-js";

// Mount <Toaster /> once at the application root.
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
} from "../registry/ui/card";
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
  {
    choices: [{ value: "fix" }, { value: "refactor" }, { value: "docs" }],
    name: "task",
    required: true,
  },
  {
    choices: [{ value: "summary" }, { value: "files" }, { value: "review" }],
    name: "output",
    required: true,
  },
] as const;

function handleSubmit(event: SubmitEvent & { currentTarget: HTMLFormElement }) {
  event.preventDefault();

  const formData = new FormData(event.currentTarget);

  toast("Agent task created", {
    description: `Task: ${formString(formData.get("task")) ?? "None"} · Handoff: ${formString(formData.get("output")) ?? "None"}`,
  });
}

export function QuestionnaireCard() {
  const taskTitleId = createUniqueId();
  const outputTitleId = createUniqueId();

  return (
    <Questionnaire
      class="mx-auto max-w-md"
      defaultItem="task"
      items={items}
      shortcuts="numbers"
      onSubmit={handleSubmit}
    >
      <Card>
        <QuestionnaireItem aria-labelledby={taskTitleId} name="task" required>
          <CardHeader>
            <QuestionnaireTitle id={taskTitleId}>
              What should the agent work on?
            </QuestionnaireTitle>
            <QuestionnaireDescription>
              Choose the task that should be handled next.
            </QuestionnaireDescription>
            <CardAction>
              <QuestionnaireProgress />
            </CardAction>
          </CardHeader>
          <CardContent>
            <QuestionnaireChoices>
              <QuestionnaireChoice value="fix">
                Fix the failing tests
              </QuestionnaireChoice>
              <QuestionnaireChoice value="refactor">
                Refactor the data layer
              </QuestionnaireChoice>
              <QuestionnaireChoice value="docs">
                Update the integration guide
              </QuestionnaireChoice>
            </QuestionnaireChoices>
            <QuestionnaireError />
          </CardContent>
        </QuestionnaireItem>

        <QuestionnaireItem
          aria-labelledby={outputTitleId}
          name="output"
          required
        >
          <CardHeader>
            <QuestionnaireTitle id={outputTitleId}>
              What should the final handoff include?
            </QuestionnaireTitle>
            <QuestionnaireDescription>
              Pick the level of detail needed for review.
            </QuestionnaireDescription>
            <CardAction>
              <QuestionnaireProgress />
            </CardAction>
          </CardHeader>
          <CardContent>
            <QuestionnaireChoices>
              <QuestionnaireChoice value="summary">
                Summary only
              </QuestionnaireChoice>
              <QuestionnaireChoice value="files">
                Summary and changed files
              </QuestionnaireChoice>
              <QuestionnaireChoice value="review">
                Full review handoff
              </QuestionnaireChoice>
            </QuestionnaireChoices>
            <QuestionnaireError />
          </CardContent>
        </QuestionnaireItem>

        <CardFooter>
          <QuestionnaireActions class="w-full">
            <QuestionnairePrevious />
            <QuestionnaireNext>Next</QuestionnaireNext>
            <QuestionnaireSubmit>Create task</QuestionnaireSubmit>
          </QuestionnaireActions>
        </CardFooter>
      </Card>
    </Questionnaire>
  );
}

export default QuestionnaireCard;
