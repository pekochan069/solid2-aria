import {
  CopyIcon,
  CircleAlertIcon,
  TrashIcon,
  ShareIcon,
  ShoppingBagIcon,
  MoreHorizontalIcon,
  Loader2Icon,
  PlusIcon,
  MinusIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  SearchIcon,
  SettingsIcon,
} from "@lucide/solid";
import type { ComponentProps } from "@solidjs/web";
import { dynamic } from "@solidjs/web";
import { omit } from "solid-js";

const icons = new Map(
  Object.entries({
    ArrowLeftIcon,
    ArrowRightIcon,
    CheckIcon,
    ChevronDownIcon,
    ChevronRightIcon,
    CircleAlertIcon,
    CopyIcon,
    Loader2Icon,
    MinusIcon,
    MoreHorizontalIcon,
    PlusIcon,
    SearchIcon,
    SettingsIcon,
    ShareIcon,
    ShoppingBagIcon,
    TrashIcon,
  })
);

export function IconPlaceholder(
  props: ComponentProps<typeof CopyIcon> & {
    lucide: string;
    tabler?: string;
    hugeicons?: string;
    phosphor?: string;
    remixicon?: string;
  }
) {
  const Icon = dynamic(() => icons.get(props.lucide) ?? CircleAlertIcon);

  const rest = omit(
    props,
    "lucide",
    "tabler",
    "hugeicons",
    "phosphor",
    "remixicon"
  );

  return <Icon {...rest} />;
}
