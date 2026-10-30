/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/questionnaire-navigation-state.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { createSignal } from "solid-js";

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
// Mount <Toaster /> once at the application root.
import type { QuestionnaireItemStatus } from "./_support";

const items = [
  { name: "permission", required: true },
  { name: "verification", required: true },
] as const;

type ItemName = "permission" | "verification";

function handleSubmit(event: SubmitEvent & { currentTarget: HTMLFormElement }) {
  event.preventDefault();

  const formData = new FormData(event.currentTarget);

  toast("Permissions saved", {
    description: `Permission: ${formString(formData.get("permission")) ?? "None"} · Verification: ${formString(formData.get("verification")) ?? "None"}`,
  });
}

export function QuestionnaireNavigationState() {
  const [item, setItem] = createSignal<ItemName>("permission");

  const [statuses, setStatuses] = createSignal<
    Record<ItemName, QuestionnaireItemStatus>
  >({
    permission: "unanswered",
    verification: "unanswered",
  });

  const unanswered = () => statuses()[item()] === "unanswered";

  function setStatus(name: ItemName, status: QuestionnaireItemStatus) {
    setStatuses((current) => ({ ...current, [name]: status }));
  }

  return (
    <Questionnaire
      class="mx-auto max-w-md"
      item={item()}
      items={items}
      onItemChange={(nextItem) => {
        if (nextItem === "permission" || nextItem === "verification") {
          setItem(nextItem);
        }
      }}
      onSubmit={handleSubmit}
    >
      <QuestionnaireProgress />

      <QuestionnaireItem
        name="permission"
        required
        onStatusChange={(status) => {
          setStatus("permission", status);
        }}
      >
        <QuestionnaireTitle>What may the agent modify?</QuestionnaireTitle>
        <QuestionnaireDescription>
          Next is intentionally disabled until an answer is selected.
        </QuestionnaireDescription>
        <QuestionnaireChoices>
          <QuestionnaireChoice value="files">Project files</QuestionnaireChoice>
          <QuestionnaireChoice value="tests">
            Project files and tests
          </QuestionnaireChoice>
          <QuestionnaireChoice value="config">
            Files, tests, and configuration
          </QuestionnaireChoice>
        </QuestionnaireChoices>
        <QuestionnaireError />
      </QuestionnaireItem>

      <QuestionnaireItem
        name="verification"
        required
        onStatusChange={(status) => {
          setStatus("verification", status);
        }}
      >
        <QuestionnaireTitle>
          What must pass before completion?
        </QuestionnaireTitle>
        <QuestionnaireChoices>
          <QuestionnaireChoice value="tests">Tests</QuestionnaireChoice>
          <QuestionnaireChoice value="types">
            Tests and types
          </QuestionnaireChoice>
          <QuestionnaireChoice value="all">
            Tests, types, and visual QA
          </QuestionnaireChoice>
        </QuestionnaireChoices>
        <QuestionnaireError />
      </QuestionnaireItem>

      <QuestionnaireActions>
        <QuestionnairePrevious />
        <QuestionnaireNext
          class="data-[status=unanswered]:opacity-50"
          isDisabled={unanswered()}
          variant="secondary"
        >
          Next
        </QuestionnaireNext>
        <QuestionnaireSubmit isDisabled={unanswered()}>
          Save permissions
        </QuestionnaireSubmit>
      </QuestionnaireActions>
    </Questionnaire>
  );
}

export default QuestionnaireNavigationState;
