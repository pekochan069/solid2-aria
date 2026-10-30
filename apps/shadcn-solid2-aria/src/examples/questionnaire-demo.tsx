/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/questionnaire-demo.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

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
  QuestionnaireSkip,
  QuestionnaireSubmit,
  QuestionnaireTitle,
} from "../registry/ui/questionnaire";
import { toast } from "../registry/ui/sonner";
// Mount <Toaster /> once at the application root.
import { formString } from "./_form";

const items = [
  {
    choices: [
      { value: "tool-calls" },
      { value: "approvals" },
      { value: "handoffs" },
    ],
    name: "direction",
    required: true,
  },
  {
    choices: [
      { value: "progress" },
      { value: "decisions" },
      { value: "risks" },
      { value: "next-step" },
    ],
    name: "signals",
  },
  {
    choices: [{ value: "now" }, { value: "next-cycle" }, { value: "backlog" }],
    name: "timing",
    required: true,
  },
] as const;

function handleSubmit(event: SubmitEvent & { currentTarget: HTMLFormElement }) {
  event.preventDefault();

  const formData = new FormData(event.currentTarget);

  const answers = {
    direction: formString(formData.get("direction")),
    signals: formData.getAll("signals").map(formString),
    timing: formString(formData.get("timing")),
  };

  toast("Agent plan saved", {
    description: `Direction: ${answers.direction ?? "None"} · Progress signals: ${answers.signals.join(", ") || "None"} · Timing: ${answers.timing ?? "None"}`,
  });
}

export function QuestionnaireDemo() {
  return (
    <Questionnaire
      class="mx-auto max-w-md"
      defaultItem="direction"
      items={items}
      shortcuts="letters"
      onSubmit={handleSubmit}
    >
      <QuestionnaireProgress />

      <QuestionnaireItem name="direction" required>
        <QuestionnaireTitle>
          What should the agent build next?
        </QuestionnaireTitle>
        <QuestionnaireDescription>
          Choose a direction or describe another task.
        </QuestionnaireDescription>
        <QuestionnaireChoices>
          <QuestionnaireChoice value="tool-calls">
            <span class="font-medium">Tool call timeline</span>
            <span class="text-muted-foreground">
              Show what the agent ran and what came back.
            </span>
          </QuestionnaireChoice>
          <QuestionnaireChoice value="approvals">
            <span class="font-medium">Approval checkpoints</span>
            <span class="text-muted-foreground">
              Ask before sensitive or destructive actions.
            </span>
          </QuestionnaireChoice>
          <QuestionnaireChoice value="handoffs">
            <span class="font-medium">Sub-agent handoffs</span>
            <span class="text-muted-foreground">
              Make delegated work and results easier to follow.
            </span>
          </QuestionnaireChoice>
          <QuestionnaireInput
            aria-label="Another agent feature"
            placeholder="Describe another feature…"
          />
        </QuestionnaireChoices>
        <QuestionnaireError />
      </QuestionnaireItem>

      <QuestionnaireItem name="signals" multiple>
        <QuestionnaireTitle>
          What should every progress update include?
        </QuestionnaireTitle>
        <QuestionnaireDescription>
          Select all that apply, or skip this question.
        </QuestionnaireDescription>
        <QuestionnaireChoices>
          <QuestionnaireChoice value="progress">Progress</QuestionnaireChoice>
          <QuestionnaireChoice value="decisions">Decisions</QuestionnaireChoice>
          <QuestionnaireChoice value="risks">Risks</QuestionnaireChoice>
          <QuestionnaireChoice value="next-step">Next step</QuestionnaireChoice>
        </QuestionnaireChoices>
        <QuestionnaireError />
      </QuestionnaireItem>

      <QuestionnaireItem name="timing" required>
        <QuestionnaireTitle>When should work begin?</QuestionnaireTitle>
        <QuestionnaireDescription>
          Choose when the agent should begin the work.
        </QuestionnaireDescription>
        <QuestionnaireChoices>
          <QuestionnaireChoice value="now">Start now</QuestionnaireChoice>
          <QuestionnaireChoice value="next-cycle">
            Next development cycle
          </QuestionnaireChoice>
          <QuestionnaireChoice value="backlog">
            Add it to the backlog
          </QuestionnaireChoice>
        </QuestionnaireChoices>
        <QuestionnaireError />
      </QuestionnaireItem>

      <QuestionnaireActions>
        <QuestionnairePrevious />
        <QuestionnaireSkip />
        <QuestionnaireNext>Next</QuestionnaireNext>
        <QuestionnaireSubmit>Save plan</QuestionnaireSubmit>
      </QuestionnaireActions>
    </Questionnaire>
  );
}

export default QuestionnaireDemo;
