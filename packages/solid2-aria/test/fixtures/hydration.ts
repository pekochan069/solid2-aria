import { isServer } from "@solidjs/web";
import { createEffect, createSignal } from "solid-js";

import { createButton } from "../../src/button/create-button";
import { createFocusRing } from "../../src/focus/create-focus-ring";
import { createHover } from "../../src/interactions/create-hover";
import { createDescription } from "../../src/utils/create-description";
import { createId, createSlotId } from "../../src/utils/create-id";
import { noop } from "../../src/utils/noop";

export const cases = {
  button: () => createButton({}, () => null),
  dependencies: () => {
    createEffect(() => [], noop);
  },
  description: () => createDescription(),
  effect: () => {
    createEffect(() => true, noop);
  },
  focus: () => createFocusRing(),
  hover: () => createHover({}),
  id: () => createId(),
  slot: () => createSlotId(),
  ssr: () => isServer,
  store: () => {
    // oxlint-disable-next-line solid/no-unused-signal -- The hydration fixture intentionally creates an unwritten signal.
    const [value] = createSignal("value");

    return value;
  },
};
