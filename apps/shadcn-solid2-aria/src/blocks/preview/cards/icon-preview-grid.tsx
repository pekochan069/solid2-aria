/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/blocks/preview/cards/icon-preview-grid.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import type { IconLibraryName } from "shadcn/icons";
import { For } from "solid-js";

import { Card, CardContent } from "../../../registry/ui/card";
import { IconPlaceholder } from "../../_icons";

const PREVIEW_ICONS = [
  {
    hugeicons: "Copy01Icon",
    lucide: "CopyIcon",
    phosphor: "CopyIcon",
    remixicon: "RiFileCopyLine",
    tabler: "IconCopy",
  },
  {
    hugeicons: "AlertCircleIcon",
    lucide: "CircleAlertIcon",
    phosphor: "WarningCircleIcon",
    remixicon: "RiErrorWarningLine",
    tabler: "IconExclamationCircle",
  },
  {
    hugeicons: "Delete02Icon",
    lucide: "TrashIcon",
    phosphor: "TrashIcon",
    remixicon: "RiDeleteBinLine",
    tabler: "IconTrash",
  },
  {
    hugeicons: "Share03Icon",
    lucide: "ShareIcon",
    phosphor: "ShareIcon",
    remixicon: "RiShareLine",
    tabler: "IconShare",
  },
  {
    hugeicons: "ShoppingBag01Icon",
    lucide: "ShoppingBagIcon",
    phosphor: "BagIcon",
    remixicon: "RiShoppingBagLine",
    tabler: "IconShoppingBag",
  },
  {
    hugeicons: "MoreHorizontalCircle01Icon",
    lucide: "MoreHorizontalIcon",
    phosphor: "DotsThreeIcon",
    remixicon: "RiMoreLine",
    tabler: "IconDots",
  },
  {
    hugeicons: "Loading03Icon",
    lucide: "Loader2Icon",
    phosphor: "SpinnerIcon",
    remixicon: "RiLoaderLine",
    tabler: "IconLoader",
  },
  {
    hugeicons: "PlusSignIcon",
    lucide: "PlusIcon",
    phosphor: "PlusIcon",
    remixicon: "RiAddLine",
    tabler: "IconPlus",
  },
  {
    hugeicons: "MinusSignIcon",
    lucide: "MinusIcon",
    phosphor: "MinusIcon",
    remixicon: "RiSubtractLine",
    tabler: "IconMinus",
  },
  {
    hugeicons: "ArrowLeft02Icon",
    lucide: "ArrowLeftIcon",
    phosphor: "ArrowLeftIcon",
    remixicon: "RiArrowLeftLine",
    tabler: "IconArrowLeft",
  },
  {
    hugeicons: "ArrowRight02Icon",
    lucide: "ArrowRightIcon",
    phosphor: "ArrowRightIcon",
    remixicon: "RiArrowRightLine",
    tabler: "IconArrowRight",
  },
  {
    hugeicons: "Tick02Icon",
    lucide: "CheckIcon",
    phosphor: "CheckIcon",
    remixicon: "RiCheckLine",
    tabler: "IconCheck",
  },
  {
    hugeicons: "ArrowDown01Icon",
    lucide: "ChevronDownIcon",
    phosphor: "CaretDownIcon",
    remixicon: "RiArrowDownSLine",
    tabler: "IconChevronDown",
  },
  {
    hugeicons: "ArrowRight01Icon",
    lucide: "ChevronRightIcon",
    phosphor: "CaretRightIcon",
    remixicon: "RiArrowRightSLine",
    tabler: "IconChevronRight",
  },
  {
    hugeicons: "Search01Icon",
    lucide: "SearchIcon",
    phosphor: "MagnifyingGlassIcon",
    remixicon: "RiSearchLine",
    tabler: "IconSearch",
  },
  {
    hugeicons: "Settings01Icon",
    lucide: "SettingsIcon",
    phosphor: "GearIcon",
    remixicon: "RiSettingsLine",
    tabler: "IconSettings",
  },
] satisfies Record<IconLibraryName, string>[];

export function IconPreviewGrid() {
  return (
    <Card>
      <CardContent>
        <div class="grid grid-cols-8 place-items-center gap-4">
          {
            <For each={PREVIEW_ICONS}>
              {(icon, _index) => (
                <div class="ring-border style-sera:rounded-none flex size-8 items-center justify-center rounded-md ring *:[svg]:size-4">
                  <IconPlaceholder
                    lucide={icon.lucide}
                    tabler={icon.tabler}
                    hugeicons={icon.hugeicons}
                    phosphor={icon.phosphor}
                    remixicon={icon.remixicon}
                  />
                </div>
              )}
            </For>
          }
        </div>
      </CardContent>
    </Card>
  );
}

export default IconPreviewGrid;
