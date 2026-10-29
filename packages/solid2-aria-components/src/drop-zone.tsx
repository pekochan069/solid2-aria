/*
 * Copyright 2023 Adobe. All rights reserved.
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
 * Derived from Adobe React Spectrum: packages/react-aria-components/src/DropZone.tsx.
 * Modified for Solid Aria: DOM refs, focus, drag, clipboard and render state use Solid factories; uses Solid class props.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { createButton } from "@solid2-aria/core/button/create-button";
import { createClipboard } from "@solid2-aria/core/dnd/create-clipboard";
import { createDrop } from "@solid2-aria/core/dnd/create-drop";
import type { DropOptions } from "@solid2-aria/core/dnd/create-drop";
import { createFocusRing } from "@solid2-aria/core/focus/create-focus-ring";
import { createLocalizedStringFormatter } from "@solid2-aria/core/i18n/create-localized-string-formatter";
import { createHover } from "@solid2-aria/core/interactions/create-hover";
import { createSlotId } from "@solid2-aria/core/utils/create-id";
import { createLabels } from "@solid2-aria/core/utils/create-labels";
import { filterDOMProps } from "@solid2-aria/core/utils/filter-dom-props";
import { focusWithoutScrolling } from "@solid2-aria/core/utils/focus-without-scrolling";
import { isFocusable } from "@solid2-aria/core/utils/is-focusable";
import { mergeProps } from "@solid2-aria/core/utils/merge-props";
import { createVisuallyHidden } from "@solid2-aria/core/visually-hidden/visually-hidden";
import type { AriaLabelingProps, HoverEvents } from "@solid2-aria/types-shared";
import type { GlobalDOMAttributes } from "@solid2-aria/types-shared-web";
import { merge, untrack, createSignal, createContext } from "solid-js";

import intlMessages from "../intl";
import { TextContext } from "./text";
import { dom, createContextProps, createRenderProps } from "./utils";
import type { ContextValue, RenderProps, SlotProps, Ref } from "./utils";

export interface DropZoneRenderProps {
  isHovered: boolean;
  isFocused: boolean;
  isFocusVisible: boolean;
  isDropTarget: boolean;
  isDisabled: boolean;
}

export interface DropZoneProps
  extends
    Omit<DropOptions, "getDropOperationForPoint" | "ref" | "hasDropButton">,
    HoverEvents,
    RenderProps<DropZoneRenderProps>,
    SlotProps,
    AriaLabelingProps,
    GlobalDOMAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
}

export const DropZoneContext =
  createContext<ContextValue<DropZoneProps, HTMLDivElement>>(null);

export function DropZone(input: DropZoneProps) {
  const [props, ref, setRef] = createContextProps(
    input,
    untrack(() => input.ref),
    DropZoneContext
  );

  const [buttonRef, setButtonRef] = createSignal<HTMLButtonElement | null>(
    null,
    { ownedWrite: true }
  );

  const drop = createDrop(
    mergeProps(props, { hasDropButton: true, ref: buttonRef })
  );

  const button = createButton(
    mergeProps(
      {
        get children() {
          return props.children;
        },
      },
      drop.dropButtonProps ?? {}
    ),
    buttonRef
  );

  const hover = createHover(props);
  const focus = createFocusRing();
  const hidden = createVisuallyHidden();
  const textId = createSlotId();

  const formatter = createLocalizedStringFormatter(
    intlMessages,
    "@solid2-aria/components"
  );

  const labels = createLabels({
    get "aria-label"() {
      return props["aria-label"] ?? formatter.format("dropzoneLabel");
    },
    get "aria-labelledby"() {
      return (
        [textId(), props["aria-labelledby"]].filter(Boolean).join(" ") ||
        undefined
      );
    },
  });

  const clipboard = createClipboard({
    get isDisabled() {
      return props.isDisabled;
    },
    onPaste: (items) =>
      props.onDrop?.({
        dropOperation: "copy",
        items,
        type: "drop",
        x: 0,
        y: 0,
      }),
  });

  const values = {
    get isDisabled() {
      return props.isDisabled === true;
    },
    get isDropTarget() {
      return drop.isDropTarget;
    },
    get isFocusVisible() {
      return focus.isFocusVisible;
    },
    get isFocused() {
      return focus.isFocused;
    },
    get isHovered() {
      return hover.isHovered;
    },
  };

  const render = createRenderProps(
    mergeProps(props, { defaultClass: "solid2-aria-DropZone", values })
  );

  return (
    <TextContext
      value={{
        slots: {
          label: {
            get id() {
              return textId();
            },
          },
        },
      }}
    >
      <dom.div
        {...mergeProps(
          filterDOMProps(props, { global: true }),
          render,
          merge(() => drop.dropProps ?? {}),
          merge(() => hover.hoverProps ?? {})
        )}
        ref={(element: HTMLDivElement) => {
          setRef(element);
        }}
        slot={props.slot ?? undefined}
        data-hovered={hover.isHovered || undefined}
        data-focused={focus.isFocused || undefined}
        data-focus-visible={focus.isFocusVisible || undefined}
        data-drop-target={drop.isDropTarget || undefined}
        data-disabled={props.isDisabled ?? undefined}
        onClick={(event) => {
          let target =
            event.target instanceof HTMLElement ? event.target : null;

          while (target && ref()?.contains(target) === true) {
            if (isFocusable(target)) {
              break;
            }

            const focusTarget = buttonRef();

            if (target === ref() && focusTarget) {
              focusWithoutScrolling(focusTarget);
              break;
            }

            target = target.parentElement;
          }
        }}
      >
        <div {...hidden.visuallyHiddenProps}>
          <button
            {...mergeProps(
              merge(() => button.buttonProps ?? {}),
              merge(() => focus.focusProps ?? {}),
              merge(() => clipboard.clipboardProps ?? {}),
              labels
            )}

            ref={(element: HTMLButtonElement) => {
              setButtonRef(element);
            }}
          />
        </div>
        {render.children}
      </dom.div>
    </TextContext>
  );
}
