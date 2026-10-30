import type ArrowRight02Icon from "@hugeicons/core-free-icons/ArrowRight02Icon";
import { dynamic } from "@solidjs/web";
import type { ComponentProps } from "@solidjs/web";
import { For, omit } from "solid-js";

type IconData = typeof ArrowRight02Icon;

export function HugeIcon(
  props: ComponentProps<"svg"> & { icon: IconData; size?: number }
) {
  const rest = omit(props, "icon", "size");

  function attributes(values: IconData[number][1]) {
    return Object.fromEntries(
      Object.entries(values)
        .filter(([name]) => name !== "key")
        .map(([name, value]) => [
          name.replaceAll(/[A-Z]/gu, (letter) => `-${letter.toLowerCase()}`),
          name === "strokeWidth" ? (props["stroke-width"] ?? 2) : value,
        ])
    );
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.size ?? 24}
      height={props.size ?? 24}
      viewBox="0 0 24 24"
      fill="none"
      color="currentColor"
      aria-hidden="true"
      {...rest}
    >
      <For each={props.icon}>
        {([tag, values]) => {
          const Tag = dynamic(() => tag);

          return <Tag {...attributes(values)} />;
        }}
      </For>
    </svg>
  );
}
