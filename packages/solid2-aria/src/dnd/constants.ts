/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
/*
 * Derived from Adobe React Spectrum: packages/react-aria/src/dnd/constants.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { DropOperation } from "@solid2-aria/types-shared";

import { addBits } from "../utils/bit-mask";

export interface IDropOperation {
  readonly none: 0;
  readonly cancel: 0;
  readonly move: number;
  readonly copy: number;
  readonly link: number;
  readonly all: number;
}

export enum DROP_OPERATION {
  // oxlint-disable-next-line typescript/no-duplicate-enum-values -- Native none and application cancel intentionally share the empty mask.
  none = 0,
  cancel = 0,
  move = 1,
  copy = 2,
  link = 4,
  all = 7,
}

interface DropOperationAllowed extends IDropOperation {
  readonly copyMove: number;
  readonly copyLink: number;
  readonly linkMove: number;
  readonly all: number;
  readonly uninitialized: number;
}

// See https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer/effectAllowed
export const DROP_OPERATION_ALLOWED: DropOperationAllowed = {
  ...DROP_OPERATION,
  all: DROP_OPERATION.all,
  copyLink: addBits(DROP_OPERATION.copy, DROP_OPERATION.link),
  copyMove: addBits(DROP_OPERATION.copy, DROP_OPERATION.move),
  linkMove: addBits(DROP_OPERATION.link, DROP_OPERATION.move),
  uninitialized: DROP_OPERATION.all,
};

interface EffectAllowedByMask {
  [mask: number]: DataTransfer["effectAllowed"];
}

export const EFFECT_ALLOWED: EffectAllowedByMask = {
  0: "none",
  1: "move",
  2: "copy",
  3: "copyMove",
  4: "link",
  5: "linkMove",
  6: "copyLink",
  7: "all",
};

// ensure we don't map to 'uninitialized'.
EFFECT_ALLOWED[DROP_OPERATION.all] = "all";

type DropEffect = "none" | "link" | "copy" | "move";

export const DROP_EFFECT_TO_DROP_OPERATION = {
  copy: "copy",
  link: "link",
  move: "move",
  none: "cancel",
} satisfies { [K in DropEffect]: DropOperation };

export const DROP_OPERATION_TO_DROP_EFFECT = {
  cancel: "none",
  copy: "copy",
  link: "link",
  move: "move",
} satisfies { [K in DropOperation]: DropEffect };

export const NATIVE_DRAG_TYPES = new Set<string>([
  "text/plain",
  "text/uri-list",
  "text/html",
]);

export const CUSTOM_DRAG_TYPE = "application/vnd.react-aria.items+json";
export const GENERIC_TYPE = "application/octet-stream";
