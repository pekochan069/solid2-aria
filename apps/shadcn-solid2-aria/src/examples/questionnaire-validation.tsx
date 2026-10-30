/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/questionnaire-validation.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { createSignal } from "solid-js";
// Mount <Toaster /> once at the application root.
import { z } from "zod";

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

const items = [
  { name: "detail", required: true },
  { name: "audience", required: true },
] as const;

const questionnaireSchema = z
  .object({
    audience: z.enum(["team", "public"]),
    detail: z.enum(["summary", "complete"]),
  })
  .superRefine((answers, context) => {
    if (answers.audience === "public" && answers.detail === "summary") {
      context.addIssue({
        code: "custom",
        message:
          "Public answers need enough context. Choose a complete answer.",
        path: ["detail"],
      });
    }
  });

type QuestionnaireItemName = keyof z.infer<typeof questionnaireSchema>;

type QuestionnaireErrors = Partial<Record<QuestionnaireItemName, string>>;

function ValidationProgress() {
  return <QuestionnaireProgress class="min-w-0" />;
}

export function QuestionnaireValidation() {
  const [item, setItem] = createSignal("detail");
  const [errors, setErrors] = createSignal<QuestionnaireErrors>({});

  function handleSubmit(
    event: SubmitEvent & { currentTarget: HTMLFormElement }
  ) {
    event.preventDefault();

    const result = questionnaireSchema.safeParse(
      Object.fromEntries(new FormData(event.currentTarget))
    );

    if (result.success) {
      setErrors({});
      toast("Agent response configured", {
        description: `Detail: ${result.data.detail} · Audience: ${result.data.audience}`,
      });

      return;
    }

    const nextErrors: QuestionnaireErrors = {};

    for (const issue of result.error.issues) {
      const [name] = issue.path;

      if (
        (name === "detail" || name === "audience") &&
        !((nextErrors[name] ?? "") !== "")
      ) {
        nextErrors[name] = issue.message;
      }
    }

    const firstInvalidItem = result.error.issues[0]?.path[0];

    setErrors(nextErrors);

    if (firstInvalidItem === "detail" || firstInvalidItem === "audience") {
      setItem(firstInvalidItem);
    }
  }

  return (
    <Questionnaire
      class="mx-auto max-w-md"
      item={item()}
      items={items}
      onItemChange={(value) => {
        setItem(value);
      }}
      onSubmit={handleSubmit}
    >
      <Card class="w-full">
        <QuestionnaireItem
          invalid={Boolean(errors().detail)}
          name="detail"
          required
        >
          <CardHeader>
            <QuestionnaireTitle>
              How much detail should the answer include?
            </QuestionnaireTitle>
            <QuestionnaireDescription>
              Choose the response depth.
            </QuestionnaireDescription>
            <CardAction>
              <ValidationProgress />
            </CardAction>
          </CardHeader>
          <CardContent>
            <QuestionnaireChoices>
              <QuestionnaireChoice value="summary">
                Concise summary
              </QuestionnaireChoice>
              <QuestionnaireChoice value="complete">
                Complete answer
              </QuestionnaireChoice>
            </QuestionnaireChoices>
            <QuestionnaireError>{errors().detail}</QuestionnaireError>
          </CardContent>
        </QuestionnaireItem>

        <QuestionnaireItem
          invalid={Boolean(errors().audience)}
          name="audience"
          required
        >
          <CardHeader>
            <QuestionnaireTitle>Who will read the answer?</QuestionnaireTitle>
            <QuestionnaireDescription>
              Public answers require complete context.
            </QuestionnaireDescription>
            <CardAction>
              <ValidationProgress />
            </CardAction>
          </CardHeader>
          <CardContent>
            <QuestionnaireChoices>
              <QuestionnaireChoice value="team">My team</QuestionnaireChoice>
              <QuestionnaireChoice value="public">
                Public audience
              </QuestionnaireChoice>
            </QuestionnaireChoices>
            <QuestionnaireError>{errors().audience}</QuestionnaireError>
          </CardContent>
        </QuestionnaireItem>

        <CardFooter>
          <QuestionnaireActions>
            <QuestionnairePrevious />
            <QuestionnaireNext>Next</QuestionnaireNext>
            <QuestionnaireSubmit>Validate answers</QuestionnaireSubmit>
          </QuestionnaireActions>
        </CardFooter>
      </Card>
    </Questionnaire>
  );
}

export default QuestionnaireValidation;
