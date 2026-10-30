/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/ui/questionnaire.tsx and packages/react/src/questionnaire/components.tsx.
 * Modified for Solid Aria: Solid 2 reactive props, native forms, navigation visibility, choice indicators, and Lucide icons.
 * Generated for docs with nova styling from apps/v4/registry/styles/style-nova.css.
 * Regenerate with bun run generate:ui; local edits are replaced.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { CheckIcon } from "@lucide/solid";
import type { ComponentProps } from "@solidjs/web";
import { cn } from "cn";
import {
  createEffect,
  createContext,
  useContext,
  createSignal,
  createUniqueId,
  Show,
  omit,
} from "solid-js";

import { Button } from "./button";

interface ItemDefinition {
  name: string;
  disabled?: boolean;
  required?: boolean;
  choices?: readonly {
    value: string;
    disabled?: boolean;
  }[];
}

type QuestionnaireProps = ComponentProps<"form"> & {
  items: readonly ItemDefinition[];
  defaultItem?: string;
  item?: string;
  onItemChange?: (item: string) => void;
  shortcuts?: "letters" | "numbers";
};

interface QuestionnaireState {
  resetVersion: number;
  active: string | undefined;
  index: number;
  items: readonly ItemDefinition[];
  shortcuts: QuestionnaireProps["shortcuts"];
  invalid: string | undefined;
  change: (index: number, validate?: boolean) => void;
}

const QuestionnaireContext = createContext<QuestionnaireState>();

const ItemContext = createContext<{
  name: string;
  multiple?: boolean;
  required?: boolean;
  disabled?: boolean;
  invalid: boolean;
  id: string;
  values: string[];
  select: (value: string, checked: boolean) => void;
  shortcutFor: (value: string) => string | undefined;
}>();

function Questionnaire(props: QuestionnaireProps) {
  const items = () => props.items.filter((item) => !(item.disabled ?? false));

  const [internalItem, setItem] = createSignal<string | undefined>(
    () =>
      props.defaultItem ??
      props.items.find((item) => !(item.disabled ?? false))?.name
  );

  const [invalid, setInvalid] = createSignal<string>();
  const [resetVersion, setResetVersion] = createSignal(0);
  const active = () => props.item ?? internalItem() ?? items()[0]?.name;

  const index = () =>
    Math.max(
      0,
      items().findIndex((item) => item.name === active())
    );

  let form: HTMLFormElement | undefined;

  const validate = (name: string | undefined) => {
    if (!form || name === undefined || name === "") {
      return true;
    }

    const fieldset = [...form.querySelectorAll("fieldset")].find(
      (candidate) => candidate.name === name
    );

    if (!fieldset) {
      return true;
    }

    const controls = [...fieldset.querySelectorAll("input,textarea,select")]
      .filter(
        (
          input
        ): input is
          | HTMLInputElement
          | HTMLTextAreaElement
          | HTMLSelectElement =>
          input instanceof HTMLInputElement ||
          input instanceof HTMLTextAreaElement ||
          input instanceof HTMLSelectElement
      )
      .filter((input) => !input.disabled);

    const answered = controls.some((input) =>
      input instanceof HTMLInputElement &&
      ["checkbox", "radio"].includes(input.type)
        ? input.checked
        : input.value.trim() !== ""
    );

    const required =
      items().find((item) => item.name === name)?.required ??
      fieldset.dataset.required === "true";

    const valid =
      (!required || answered) &&
      controls.every((input) => input.checkValidity());

    if (valid) {
      setInvalid(undefined);
    } else {
      setInvalid(name);
      controls[0]?.focus();
    }

    return valid;
  };

  const change = (nextIndex: number, shouldValidate = false) => {
    if (shouldValidate && !validate(active())) {
      return;
    }

    const next = items()[nextIndex];

    if (next) {
      setItem(next.name);
      props.onItemChange?.(next.name);
      setInvalid(undefined);
      queueMicrotask(() => {
        const field = [...(form?.querySelectorAll("fieldset") ?? [])].find(
          (candidate) => candidate.name === next.name
        );

        field?.focus();
      });
    }
  };

  const state: QuestionnaireState = {
    get active() {
      return active();
    },
    change,
    get index() {
      return index();
    },
    get invalid() {
      return invalid();
    },
    get items() {
      return items();
    },
    get resetVersion() {
      return resetVersion();
    },
    get shortcuts() {
      return props.shortcuts;
    },
  };

  const rest = omit(
    props,
    "items",
    "defaultItem",
    "item",
    "onItemChange",
    "shortcuts",
    "class",
    "onSubmit",
    "onKeyDown",
    "ref",
    "onReset"
  );

  const navigateOnEnter = (event: KeyboardEvent) => {
    if (
      event.key !== "Enter" ||
      event.defaultPrevented ||
      event.shiftKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.altKey ||
      event.isComposing ||
      event.target instanceof HTMLTextAreaElement ||
      event.target instanceof HTMLButtonElement
    ) {
      return false;
    }

    event.preventDefault();

    if (index() < items().length - 1) {
      change(index() + 1, true);
    } else {
      form?.requestSubmit();
    }

    return true;
  };

  return (
    <QuestionnaireContext value={state}>
      <form
        {...rest}
        ref={[
          (el) => {
            form = el;
          },
          ...(typeof props.ref === "function" ? [props.ref] : []),
        ]}
        novalidate
        data-slot="questionnaire"
        class={cn("flex w-full min-w-0 flex-col gap-4", props.class)}
        onReset={(event) => {
          setResetVersion((version) => version + 1);
          change(0);

          if (typeof props.onReset === "function") {
            props.onReset(event);
          }
        }}
        onSubmit={(event) => {
          const bad = items().find((item) => !validate(item.name));

          if (bad) {
            event.preventDefault();
            setItem(bad.name);
            props.onItemChange?.(bad.name);
            setInvalid(bad.name);
          } else if (typeof props.onSubmit === "function") {
            props.onSubmit(event);
          }
        }}
        onKeyDown={(event) => {
          if (typeof props.onKeyDown === "function") {
            props.onKeyDown(event);
          }

          if (navigateOnEnter(event)) {
            return;
          }

          if (
            event.defaultPrevented ||
            !props.shortcuts ||
            event.ctrlKey ||
            event.metaKey ||
            event.altKey ||
            (event.target instanceof HTMLInputElement &&
              !["radio", "checkbox"].includes(event.target.type)) ||
            event.target instanceof HTMLTextAreaElement
          ) {
            return;
          }

          const choiceIndex =
            props.shortcuts === "letters"
              ? (event.key.toLowerCase().codePointAt(0) ?? Number.NaN) - 97
              : Number(event.key) - 1;

          const field = [...(form?.querySelectorAll("fieldset") ?? [])].find(
            (candidate) => candidate.name === active()
          );

          const input = field?.querySelectorAll<HTMLInputElement>(
            "input[type=radio],input[type=checkbox]"
          )[choiceIndex];

          if (input && !input.disabled) {
            event.preventDefault();
            input.click();
            input.focus();
          }
        }}
      />
    </QuestionnaireContext>
  );
}

function QuestionnaireProgress(props: ComponentProps<"div">) {
  const state = useContext(QuestionnaireContext);

  return (
    <div
      {...props}
      data-slot="questionnaire-progress"
      role="progressbar"
      aria-label="Questionnaire progress"
      aria-live="polite"
      aria-valuemin={1}
      aria-valuemax={state.items.length}
      aria-valuenow={state.index + 1}
      class={cn(
        "text-muted-foreground min-h-lh w-fit min-w-[14ch] text-xs font-medium tabular-nums",
        props.class
      )}
    >
      {props.children ?? `Question ${state.index + 1} of ${state.items.length}`}
    </div>
  );
}

function QuestionnaireItem(
  props: ComponentProps<"fieldset"> & {
    name: string;
    multiple?: boolean;
    required?: boolean;
    invalid?: boolean;
    onStatusChange?: (status: "unanswered" | "answered" | "skipped") => void;
  }
) {
  const state = useContext(QuestionnaireContext);
  const id = createUniqueId();
  const [values, setValues] = createSignal<string[]>([]);
  createEffect(
    () => state.resetVersion,
    () => {
      setValues([]);
    }
  );

  const context = {
    get disabled() {
      return Boolean(props.disabled);
    },
    id,
    get invalid() {
      return props.invalid ?? state.invalid === props.name;
    },
    get multiple() {
      return props.multiple;
    },
    get name() {
      return props.name;
    },
    get required() {
      return props.required;
    },
    select: (value: string, checked: boolean) => {
      let next: string[] = [];

      if (props.multiple ?? false) {
        next = values().filter((item) => item !== value);

        if (checked) {
          next.push(value);
        }
      } else if (checked) {
        next = [value];
      }

      setValues(next);
      props.onStatusChange?.(next.length ? "answered" : "unanswered");
    },
    shortcutFor: (value: string): string | undefined => {
      const choices =
        state.items.find((item) => item.name === props.name)?.choices ?? [];

      const index = choices.findIndex((choice) => choice.value === value);

      if (index === -1 || state.shortcuts === undefined) {
        return undefined;
      }

      if (state.shortcuts === "letters" && index < 26) {
        return String.fromCodePoint(65 + index);
      }

      return state.shortcuts === "numbers" && index < 9
        ? String(index + 1)
        : undefined;
    },
    get values() {
      return values();
    },
  };

  const rest = omit(
    props,
    "multiple",
    "required",
    "invalid",
    "onStatusChange",
    "class",
    "children"
  );

  return (
    <ItemContext value={context}>
      <fieldset
        {...rest}
        tabindex={-1}
        hidden={state.active !== props.name}
        data-slot="questionnaire-item"
        data-required={(props.required ?? false) ? "true" : undefined}
        aria-invalid={context.invalid ? "true" : undefined}
        aria-describedby={`${id}-description ${id}-error`}
        class={cn(
          "flex min-w-0 flex-col gap-4 border-0 p-0 outline-none",
          props.class
        )}
      >
        {props.children}
      </fieldset>
    </ItemContext>
  );
}

function QuestionnaireTitle(props: ComponentProps<"legend">) {
  return (
    <legend
      {...props}
      data-slot="questionnaire-title"
      class={cn(
        "font-[family-name:var(--font-heading,var(--font-sans))] text-base leading-snug font-medium text-pretty [&:not(:has(~[data-slot=questionnaire-description]))]:mb-4",
        props.class
      )}
    />
  );
}

function QuestionnaireDescription(props: ComponentProps<"p">) {
  const item = useContext(ItemContext);

  return (
    <p
      {...props}
      id={`${item.id}-description`}
      data-slot="questionnaire-description"
      class={cn("text-muted-foreground text-sm text-pretty", props.class)}
    />
  );
}

function QuestionnaireChoices(props: ComponentProps<"div">) {
  return (
    <div
      {...props}
      data-slot="questionnaire-choices"
      class={cn("group/questionnaire-choices grid min-w-0 gap-2", props.class)}
    />
  );
}

function QuestionnaireChoice(
  props: ComponentProps<"label"> & {
    value: string;
    disabled?: boolean;
    shortcut?: string;
  }
) {
  const item = useContext(ItemContext);
  const shortcut = () => props.shortcut ?? item.shortcutFor(props.value);

  const rest = omit(
    props,
    "value",
    "disabled",
    "shortcut",
    "class",
    "children"
  );

  return (
    <label
      {...rest}
      data-slot="questionnaire-choice"
      data-type={(item.multiple ?? false) ? "checkbox" : "radio"}
      data-shortcut={shortcut()}
      data-checked={item.values.includes(props.value) || undefined}
      data-disabled={
        (props.disabled ?? item.disabled ?? false) ? true : undefined
      }
      class={cn(
        "border-input dark:bg-input/20 hover:bg-muted/50 data-checked:border-primary/40 data-checked:bg-muted dark:data-checked:bg-muted data-invalid:border-destructive has-[>input:focus-visible]:border-ring has-[>input:focus-visible]:ring-ring/50 group/questionnaire-choice relative flex min-h-11 cursor-pointer items-start gap-2.5 rounded-lg border bg-transparent px-3 py-2.5 text-start text-sm transition-colors outline-none select-none has-[>input:focus-visible]:ring-3 data-disabled:pointer-events-none data-disabled:opacity-50",
        props.class
      )}
    >
      <input
        data-slot="questionnaire-choice-input"
        class="absolute inset-0 z-10 size-full cursor-pointer opacity-0"
        type={(item.multiple ?? false) ? "checkbox" : "radio"}
        name={item.name}
        value={props.value}
        aria-keyshortcuts={shortcut()}
        disabled={props.disabled ?? item.disabled}
        checked={item.values.includes(props.value)}
        onChange={(event) => {
          item.select(props.value, event.currentTarget.checked);
        }}
      />
      <span
        aria-hidden="true"
        data-slot="questionnaire-choice-indicator"
        class="border-input dark:bg-input/30 group-data-checked/questionnaire-choice:bg-primary dark:group-data-checked/questionnaire-choice:bg-primary group-data-checked/questionnaire-choice:text-primary-foreground group-data-checked/questionnaire-choice:border-primary pointer-events-none relative flex size-4 shrink-0 translate-y-[--spacing(0.45)] items-center justify-center rounded-[4px] border group-has-data-[slot=questionnaire-choice-description]/questionnaire-choice:translate-y-0.5 group-data-[type=radio]/questionnaire-choice:rounded-full"
      >
        <span
          data-slot="questionnaire-choice-indicator-dot"
          class="bg-primary-foreground hidden size-2 rounded-full group-data-checked/questionnaire-choice:block group-data-[type=checkbox]/questionnaire-choice:hidden"
        />
        <CheckIcon
          data-slot="questionnaire-choice-indicator-check"
          class="hidden size-3.5 group-data-checked/questionnaire-choice:block group-data-[type=radio]/questionnaire-choice:hidden"
        />
      </span>
      <span
        data-slot="questionnaire-choice-label"
        class="flex min-w-0 flex-1 flex-col gap-0.5 leading-snug"
      >
        {props.children}
      </span>
      <Show when={shortcut()}>
        <span
          data-slot="questionnaire-choice-shortcut"
          class="border-input bg-background text-muted-foreground pointer-events-none ms-auto inline-flex size-5 shrink-0 translate-y-[--spacing(0.45)] items-center justify-center rounded-md border font-mono text-[0.625rem] leading-none font-medium group-has-data-[slot=questionnaire-choice-description]/questionnaire-choice:translate-y-0.5"
        >
          {shortcut()}
        </span>
      </Show>
    </label>
  );
}

function QuestionnaireChoiceDescription(props: ComponentProps<"span">) {
  return (
    <span
      {...props}
      data-slot="questionnaire-choice-description"
      class={cn("text-muted-foreground", props.class)}
    />
  );
}

function QuestionnaireInput(props: ComponentProps<"input">) {
  const item = useContext(ItemContext);

  return (
    <div
      data-slot="questionnaire-input-wrapper"
      class="group/questionnaire-input relative w-full min-w-0"
    >
      <input
        {...props}
        name={item.name}
        data-slot="questionnaire-input"
        class={cn(
          "dark:bg-input/30 border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 disabled:bg-input/50 dark:disabled:bg-input/80 h-8 min-h-11 w-full min-w-0 rounded-lg border bg-transparent px-2.5 py-1 text-base transition-[color,box-shadow,background-color] outline-none focus-visible:ring-3 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3 sm:min-h-0 md:text-sm",
          "selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground",
          props.class
        )}
      />
    </div>
  );
}

function QuestionnaireError(props: ComponentProps<"div">) {
  const item = useContext(ItemContext);

  return (
    <div
      {...props}
      id={`${item.id}-error`}
      data-slot="questionnaire-error"
      hidden={!item.invalid}
      role={item.invalid ? "alert" : undefined}
      class={cn("text-destructive mt-2 text-sm", props.class)}
    >
      {props.children ??
        (item.required === true
          ? "Choose an answer to continue."
          : "Choose an answer or skip this question.")}
    </div>
  );
}

function QuestionnaireActions(props: ComponentProps<"div">) {
  return (
    <div
      {...props}
      data-slot="questionnaire-actions"
      class={cn(
        "grid min-h-11 w-full grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 sm:min-h-8",
        props.class
      )}
    />
  );
}

function QuestionnairePrevious(props: ComponentProps<typeof Button>) {
  const state = useContext(QuestionnaireContext);

  return (
    <Show when={state.index > 0}>
      <Button
        variant="outline"
        {...props}
        data-slot="questionnaire-previous"
        class={cn(
          "col-start-1 row-start-1 min-h-11 justify-self-start sm:min-h-0",
          props.class
        )}
        isDisabled={props.isDisabled}
        onPress={(event) => {
          props.onPress?.(event);
          state.change(state.index - 1);
        }}
      >
        {props.children ?? "Previous"}
      </Button>
    </Show>
  );
}

function QuestionnaireSkip(props: ComponentProps<typeof Button>) {
  const state = useContext(QuestionnaireContext);

  return (
    <Show
      when={
        state.items[state.index] !== undefined &&
        state.items[state.index]?.required !== true
      }
    >
      <Button
        variant="outline"
        {...props}
        data-slot="questionnaire-skip"
        class={cn(
          "col-start-2 row-start-1 min-h-11 justify-self-end sm:min-h-0",
          props.class
        )}
        isDisabled={props.isDisabled}
        onPress={(event) => {
          props.onPress?.(event);

          if (state.index === state.items.length - 1) {
            event.target.closest("form")?.requestSubmit();
          } else {
            state.change(state.index + 1);
          }
        }}
      >
        {props.children ?? "Skip"}
      </Button>
    </Show>
  );
}

function QuestionnaireNext(props: ComponentProps<typeof Button>) {
  const state = useContext(QuestionnaireContext);

  return (
    <Show when={state.index < state.items.length - 1}>
      <Button
        {...props}
        data-slot="questionnaire-next"
        class={cn(
          "col-start-3 row-start-1 min-h-11 justify-self-end sm:min-h-0",
          props.class
        )}
        aria-keyshortcuts="Enter"
        isDisabled={props.isDisabled}
        onPress={(event) => {
          props.onPress?.(event);
          state.change(state.index + 1, true);
        }}
      >
        {props.children ?? "Next"}
      </Button>
    </Show>
  );
}

function QuestionnaireSubmit(props: ComponentProps<typeof Button>) {
  const state = useContext(QuestionnaireContext);

  return (
    <Show
      when={state.items.length > 0 && state.index === state.items.length - 1}
    >
      <Button
        {...props}
        type="submit"
        data-slot="questionnaire-submit"
        class={cn(
          "col-start-3 row-start-1 min-h-11 justify-self-end sm:min-h-0",
          props.class
        )}
        aria-keyshortcuts="Enter"
      >
        {props.children ?? "Submit"}
      </Button>
    </Show>
  );
}

export {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoiceDescription,
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
  type QuestionnaireProps,
};
