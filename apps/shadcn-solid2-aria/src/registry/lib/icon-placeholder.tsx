import type { ComponentProps } from "@solidjs/web";
import { dynamic } from "@solidjs/web";
import { omit } from "solid-js";

import { lucideIcons } from "../icons/libs/lucide";

type IconPlaceholderProps = ComponentProps<typeof lucideIcons.CheckIcon> & {
  lucide: keyof typeof lucideIcons;
  tabler?: string;
  hugeicons?: string;
  phosphor?: string;
  remixicon?: string;
};

export function IconPlaceholder(props: IconPlaceholderProps) {
  const rest = omit(
    props,
    "lucide",
    "tabler",
    "hugeicons",
    "phosphor",
    "remixicon"
  );

  const Icon = dynamic(() => lucideIcons[props.lucide]);

  return <Icon aria-hidden="true" {...rest} />;
}
