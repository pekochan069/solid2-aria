/*
 * Copyright 2026 Adobe. All rights reserved.
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
 * Derived from Adobe React Spectrum: packages/react-aria-components/src/PreviewTrigger.tsx.
 * Modified for Solid Aria: adapted components, contexts, refs, warmup animation skipping, and reactive properties for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { FocusableProvider } from "@solid2-aria/core/interactions/create-focusable";
import { createPreviewTrigger } from "@solid2-aria/core/tooltip/create-preview-trigger";
import type { AriaPreviewTriggerProps } from "@solid2-aria/core/tooltip/create-preview-trigger";
import { mergeProps } from "@solid2-aria/core/utils/merge-props";
import type { OverlayTriggerState } from "@solid2-aria/stately/overlays/create-overlay-trigger-state";
import { createTooltipTriggerState } from "@solid2-aria/stately/tooltip/create-tooltip-trigger-state";
import type { FocusableElement } from "@solid2-aria/types-shared";
import type { JSX } from "@solidjs/web";
import { merge, createSignal } from "solid-js";

import { OverlayTriggerStateContext } from "./dialog";
import { PopoverContext } from "./popover";

export interface PreviewTriggerProps extends AriaPreviewTriggerProps {
  children?: JSX.Element;
  delay?: number;
  closeDelay?: number;
}

export function PreviewTrigger(props: PreviewTriggerProps): JSX.Element {
  const [triggerRef, setTriggerRef] = createSignal<FocusableElement | null>(
    null,
    {
      ownedWrite: true,
    }
  );

  const [popoverRef, setPopoverRef] = createSignal<HTMLElement | null>(null, {
    ownedWrite: true,
  });

  const state = createTooltipTriggerState(
    mergeProps(props, {
      get closeDelay() {
        return props.closeDelay ?? 200;
      },
      get delay() {
        return props.delay ?? 600;
      },
    })
  );

  const aria = createPreviewTrigger(
    mergeProps(props, { popoverRef, triggerRef }),
    state
  );

  const overlay: OverlayTriggerState = {
    close() {
      state.close();
    },
    get isOpen() {
      return state.isOpen;
    },
    open() {
      state.open();
    },
    point: null,
    setOpen(open) {
      if (open) {
        state.open();
      } else {
        state.close();
      }
    },
    setPoint() {
      /* empty */
    },
    toggle() {
      if (state.isOpen) {
        state.close();
      } else {
        state.open();
      }
    },
  };

  return (
    <OverlayTriggerStateContext value={overlay}>
      <PopoverContext
        value={mergeProps(
          merge(() => aria.popoverProps ?? {}),
          {
            isNonModal: true,
            ref: (element: HTMLElement) => {
              setPopoverRef(element);
            },
            get shouldSkipAnimation() {
              return state.shouldSkipAnimation;
            },
            trigger: "PreviewTrigger",
            triggerRef,
          }
        )}
      >
        <FocusableProvider
          ref={(element: FocusableElement) => {
            setTriggerRef(element);
          }}
          {...aria.triggerProps}
        >
          {props.children}
        </FocusableProvider>
      </PopoverContext>
    </OverlayTriggerStateContext>
  );
}
