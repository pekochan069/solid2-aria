import { ChevronDownIcon } from "@lucide/solid";
import type { JSX } from "@solidjs/web";
import { For, createSignal } from "solid-js";

import { Button } from "../../registry/ui/button";

const optionLabels = {
  class: "Class",
  geist: "Geist",
  hex: "HEX",
  hsl: "HSL",
  inherit: "Inherit",
  inter: "Inter",
  mono: "Geist Mono",
  oklch: "OKLCH",
  rgb: "RGB",
  sans: "System Sans",
  serif: "Georgia",
  var: "CSS Variable",
} as const;

function optionLabel(value: string) {
  return (
    Object.entries(optionLabels).find(([key]) => key === value)?.[1] ??
    value.charAt(0).toUpperCase() + value.slice(1)
  );
}

export function Picker(props: {
  label: string;
  value: string;
  options: readonly string[] | readonly { value: string; label: string }[];
  onChange: (value: string) => void;
  icon?: JSX.Element;
}) {
  return (
    <label class="tool-picker">
      <span>{props.label}</span>
      <select
        aria-label={props.label}
        value={props.value}
        onChange={(event) => {
          props.onChange(event.currentTarget.value);
        }}
      >
        <For each={props.options}>
          {(option) =>
            typeof option === "string" ? (
              <option value={option}>{optionLabel(option)}</option>
            ) : (
              <option value={option.value}>{option.label}</option>
            )
          }
        </For>
      </select>
      <span class="tool-picker-chevron" aria-hidden="true">
        {props.icon ?? <ChevronDownIcon size={16} />}
      </span>
    </label>
  );
}

export function CopyAction(props: { value: string; children: JSX.Element }) {
  const [status, setStatus] = createSignal("");

  async function copy() {
    try {
      await navigator.clipboard.writeText(props.value);
      setStatus("Copied");
    } catch {
      setStatus("Copy failed");
    }
  }

  return (
    <Button
      variant="outline"
      onPress={() => {
        void copy();
      }}
    >
      {props.children}
      <span role="status">{status() ? ` · ${status()}` : ""}</span>
    </Button>
  );
}
