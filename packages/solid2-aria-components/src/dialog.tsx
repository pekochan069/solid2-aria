/*
 * Copyright 2022 Adobe. All rights reserved.
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
 * Derived from Adobe React Spectrum: packages/react-aria-components/src/Dialog.tsx.
 * Modified for Solid Aria: adapted components, contexts, refs, and reactive properties for Solid 2; uses Solid class props.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { createIsHidden } from "@solid2-aria/core/collections/hidden";
import { createDialog } from "@solid2-aria/core/dialog/create-dialog";
import type { AriaDialogProps } from "@solid2-aria/core/dialog/create-dialog";
import { createOverlayTrigger } from "@solid2-aria/core/overlays/create-overlay-trigger";
import { filterDOMProps } from "@solid2-aria/core/utils/filter-dom-props";
import { mergeProps } from "@solid2-aria/core/utils/merge-props";
import { createMenuTriggerState } from "@solid2-aria/stately/menu/create-menu-trigger-state";
import type { OverlayTriggerProps } from "@solid2-aria/stately/overlays/create-overlay-trigger-state";
import type { JSX } from "@solidjs/web";
import {
  merge,
  untrack,
  createSignal,
  createContext,
  createUniqueId,
  useContext,
  omit,
} from "solid-js";

import { ButtonContext } from "./button";
import { HeadingContext } from "./heading";
import {
  RootMenuTriggerStateContext,
  OverlayTriggerStateContext,
} from "./overlay-contexts";
import { PopoverContext } from "./popover";
import { TextContext } from "./text";
import {
  dom,
  DEFAULT_SLOT,
  createContextProps,
  createRenderProps,
} from "./utils";
import type { ContextValue, Ref, RenderProps, SlotProps } from "./utils";

export { OverlayTriggerStateContext } from "./overlay-contexts";

export interface DialogTriggerProps extends OverlayTriggerProps {
  children?: JSX.Element;
}

export interface DialogRenderProps {
  close: () => void;
}

export interface DialogProps
  extends
    AriaDialogProps,
    SlotProps,
    RenderProps<DialogRenderProps, "section"> {
  ref?: Ref<HTMLElement>;
}

export const DialogContext =
  createContext<ContextValue<DialogProps, HTMLElement>>(null);

export function DialogTrigger(props: DialogTriggerProps): JSX.Element {
  if (createIsHidden()) {
    // oxlint-disable-next-line solid/components-return-once -- Static collection traversal and context registration are fixed when the owner is created.
    return null;
  }

  const state = createMenuTriggerState(props);

  const [triggerRef, setTriggerRef] = createSignal<HTMLButtonElement | null>(
    null,
    { ownedWrite: true }
  );

  const aria = createOverlayTrigger({ type: "dialog" }, state, triggerRef);
  const id = createUniqueId();

  const buttonProps = mergeProps(
    merge(() => aria.triggerProps ?? {}),
    {
      id,
      get isPressed() {
        return state.isOpen;
      },
      ref: (element: HTMLButtonElement) => {
        setTriggerRef(element);
      },
    }
  );

  return (
    <OverlayTriggerStateContext value={state}>
      <RootMenuTriggerStateContext value={state}>
        <DialogContext
          value={{
            "aria-labelledby": id,
            get id() {
              return typeof aria.overlayProps.id === "string"
                ? aria.overlayProps.id
                : undefined;
            },
          }}
        >
          <PopoverContext
            value={mergeProps(
              merge(() => aria.overlayProps ?? {}),
              {
                "aria-labelledby": id,
                trigger: "DialogTrigger",
                triggerRef,
              }
            )}
          >
            <ButtonContext value={buttonProps}>{props.children}</ButtonContext>
          </PopoverContext>
        </DialogContext>
      </RootMenuTriggerStateContext>
    </OverlayTriggerStateContext>
  );
}

export function Dialog(input: DialogProps): JSX.Element {
  if (createIsHidden()) {
    // oxlint-disable-next-line solid/components-return-once -- Static collection traversal and context registration are fixed when the owner is created.
    return null;
  }

  const [props, ref, setRef] = createContextProps(
    input,
    untrack(() => input.ref),
    DialogContext
  );

  const state = useContext(OverlayTriggerStateContext);

  const aria = createDialog(
    mergeProps(omit(props, "aria-labelledby"), {
      get "aria-labelledby"() {
        return input["aria-labelledby"];
      },
    }),
    ref
  );

  const render = createRenderProps(
    mergeProps(props, {
      defaultClass: "solid2-aria-Dialog",
      values: {
        close() {
          state?.close();
        },
      },
    })
  );

  return (
    <dom.section
      {...mergeProps(
        filterDOMProps(props, { global: true }),
        render,
        merge(() => aria.dialogProps ?? {})
      )}
      aria-labelledby={
        aria.dialogProps["aria-labelledby"] ?? props["aria-labelledby"]
      }
      ref={(element: HTMLElement) => {
        setRef(element);
      }}
      slot={props.slot ?? undefined}
    >
      <HeadingContext
        value={{
          slots: {
            [DEFAULT_SLOT]: {},
            get title() {
              return aria.titleProps;
            },
          },
        }}
      >
        <TextContext
          value={{
            slots: {
              [DEFAULT_SLOT]: {},
              get description() {
                return aria.contentProps;
              },
            },
          }}
        >
          <ButtonContext
            value={{
              slots: {
                [DEFAULT_SLOT]: {},
                close: {
                  onPress() {
                    state?.close();
                  },
                },
              },
            }}
          >
            {render.children}
          </ButtonContext>
        </TextContext>
      </HeadingContext>
    </dom.section>
  );
}
