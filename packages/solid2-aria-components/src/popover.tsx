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
 * Derived from Adobe React Spectrum: packages/react-aria-components/src/Popover.tsx.
 * Modified for Solid Aria: adapted components, contexts, refs, dialog semantics, animation state, and reactive properties for Solid 2; uses Solid class props.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { createIsHidden } from "@solid2-aria/core/collections/hidden";
import { getInteractionModality } from "@solid2-aria/core/interactions/create-focus-visible";
import { focusSafely } from "@solid2-aria/core/interactions/focus-safely";
import type { PlacementAxis } from "@solid2-aria/core/overlays/create-overlay-position";
import { createPopover } from "@solid2-aria/core/overlays/create-popover";
import type { AriaPopoverProps } from "@solid2-aria/core/overlays/create-popover";
import { DismissButton } from "@solid2-aria/core/overlays/dismiss-button";
import { Overlay } from "@solid2-aria/core/overlays/overlay";
import {
  createEnterAnimation,
  createExitAnimation,
} from "@solid2-aria/core/utils/animation";
import { filterDOMProps } from "@solid2-aria/core/utils/filter-dom-props";
import { mergeProps } from "@solid2-aria/core/utils/merge-props";
import { requireValue } from "@solid2-aria/core/utils/require-value";
import { isFocusWithin } from "@solid2-aria/core/utils/shadowdom/dom-functions";
import { createOverlayTriggerState } from "@solid2-aria/stately/overlays/create-overlay-trigger-state";
import type { OverlayTriggerProps } from "@solid2-aria/stately/overlays/create-overlay-trigger-state";
import type { GlobalDOMAttributes } from "@solid2-aria/types-shared-web";
import type { JSX } from "@solidjs/web";
import {
  merge,
  createSignal,
  createContext,
  createEffect,
  onSettled,
  Show,
  useContext,
  untrack,
} from "solid-js";
import type { Accessor } from "solid-js";

import { OverlayArrowContext } from "./overlay-arrow";
import { OverlayTriggerStateContext } from "./overlay-contexts";
import { dom, createContextProps, createRenderProps } from "./utils";
import type { ContextValue, Ref, RenderProps, SlotProps } from "./utils";

const fallbackTrigger = () => null;

export interface PopoverRenderProps {
  trigger: string | undefined;
  placement: PlacementAxis | null;
  isEntering: boolean;
  isExiting: boolean;
}

type ClearableContext = (props: {
  value: null;
  children: JSX.Element;
}) => JSX.Element;

export interface PopoverProps
  extends
    Omit<AriaPopoverProps, "triggerRef" | "popoverRef" | "arrowRef">,
    OverlayTriggerProps,
    Pick<
      JSX.HTMLAttributes<HTMLElement>,
      | Extract<
          keyof GlobalDOMAttributes<HTMLElement>,
          keyof JSX.HTMLAttributes<HTMLElement>
        >
      | "id"
      | "aria-label"
      | "aria-labelledby"
      | "aria-describedby"
      | "aria-details"
    >,
    SlotProps,
    RenderProps<PopoverRenderProps> {
  ref?: Ref<HTMLElement>;
  triggerRef?: Accessor<Element | null>;
  trigger?: string;
  clearContexts?: ClearableContext[];
  isEntering?: boolean;
  isExiting?: boolean;
  /** Whether automatic entry and exit animations should be skipped when swapping overlays. */
  shouldSkipAnimation?: boolean;
  UNSTABLE_portalContainer?: Element;
  onEnter?: (element: HTMLElement) => void | Promise<void>;
  onExit?: (element: HTMLElement) => void | Promise<void>;
}

export const PopoverContext =
  createContext<ContextValue<PopoverProps, HTMLElement>>(null);

export function Popover(input: PopoverProps): JSX.Element {
  if (createIsHidden()) {
    // SAFETY: The hidden collection renderer must still visit the popup's child thunk to discover its items.
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion, solid/components-return-once -- The renderer resolves deferred JSX children inside the hidden collection owner. Static collection traversal and context registration are fixed when the owner is created.
    return <>{input.children as JSX.Element}</>;
  }

  const [props, ref, setRef] = createContextProps(
    input,
    untrack(() => input.ref),
    PopoverContext
  );

  const context = useContext(OverlayTriggerStateContext);
  const local = createOverlayTriggerState(props);

  const state = untrack(
    () =>
      props.isOpen !== undefined || props.defaultOpen !== undefined || !context
  )
    ? local
    : requireValue(context, "Expected context");

  const exitAnimation = createExitAnimation(
    ref,
    () => state.isOpen,
    (element): void | Promise<void> => untrack(() => props.onExit)?.(element)
  );

  const exiting = () =>
    props.isExiting === true ||
    (props.shouldSkipAnimation !== true && exitAnimation());

  return (
    <Show when={state.isOpen || exiting()}>
      <Overlay
        portalContainer={props.UNSTABLE_portalContainer}
        isExiting={exiting()}
        shouldContainFocus={!(props.isNonModal === true)}
      >
        <PopoverInner
          props={props}
          popoverRef={ref}
          setPopoverRef={(element: HTMLElement | null) => {
            setRef(element);
          }}
          state={state}
          exiting={exiting}
        />
      </Overlay>
    </Show>
  );
}

function PopoverInner(args: {
  props: PopoverProps;
  popoverRef: Accessor<HTMLElement | null>;
  setPopoverRef: (element: HTMLElement | null) => void;
  state: ReturnType<typeof createOverlayTriggerState>;
  exiting: () => boolean;
}): JSX.Element {
  onSettled(() => () => {
    args.setPopoverRef(null);
  });

  const [arrowRef, setArrowRef] = createSignal<HTMLDivElement | null>(null, {
    ownedWrite: true,
  });

  const aria = createPopover(
    mergeProps(
      merge(() => args.props ?? {}),
      {
        arrowRef,
        get offset() {
          return args.props.offset ?? 8;
        },
        get placement() {
          return args.props.placement ?? "bottom";
        },
        get popoverRef() {
          return args.popoverRef;
        },
        get triggerRef() {
          return args.props.triggerRef ?? fallbackTrigger;
        },
      }
    ),
    untrack(() => args.state)
  );

  const entering = createEnterAnimation(
    untrack(() => args.popoverRef),
    () => aria.placement !== null,
    (element): void | Promise<void> =>
      untrack(() => args.props.onEnter)?.(element)
  );

  const [isDialog, setDialog] = createSignal(
    untrack(() => args.props.trigger === "PreviewTrigger")
  );

  createEffect(
    () =>
      [
        args.popoverRef(),
        args.props.isNonModal !== true ||
          args.props.trigger === "SubmenuTrigger" ||
          args.props.trigger === "PreviewTrigger",
      ] as const,
    ([element, required]) => {
      setDialog(
        !!element && required && !element.querySelector('[role="dialog"]')
      );
    }
  );

  createEffect(
    () => [isDialog(), args.popoverRef(), args.props.trigger] as const,
    ([dialog, element, trigger]) => {
      if (dialog && element && trigger !== "PreviewTrigger") {
        onSettled(() => {
          if (
            (trigger !== "SubmenuTrigger" ||
              getInteractionModality() !== "pointer") &&
            !isFocusWithin(element)
          ) {
            focusSafely(element);
          }
        });
      }
    }
  );

  const values: PopoverRenderProps = {
    get isEntering() {
      return (
        args.props.isEntering === true ||
        (args.props.shouldSkipAnimation !== true && entering())
      );
    },
    get isExiting() {
      return args.exiting();
    },
    get placement() {
      return aria.placement;
    },
    get trigger() {
      return args.props.trigger;
    },
  };

  const render = createRenderProps(
    mergeProps(
      merge(() => args.props ?? {}),
      { defaultClass: "solid2-aria-Popover", values }
    )
  );

  const [triggerWidth, setTriggerWidth] = createSignal<string>();
  createEffect(
    () => args.props.triggerRef?.(),
    (trigger) => {
      if (!trigger) {
        return;
      }

      const measure = () => {
        setTriggerWidth(`${trigger.getBoundingClientRect().width}px`);
      };

      measure();
      const observer = new ResizeObserver(measure);
      observer.observe(trigger);

      // oxlint-disable-next-line typescript/consistent-return -- Setup returns cleanup only when the observed element exists.
      return () => {
        observer.disconnect();
      };
    },
    { ssrSource: "client" }
  );

  return (
    <>
      {!(args.props.isNonModal === true) && (
        <dom.div
          {...aria.underlayProps}
          style={{ inset: "0", position: "fixed" }}
          data-testid="underlay"
        />
      )}
      <dom.div
        {...mergeProps(
          filterDOMProps(args.props, { global: true }),
          merge(() => aria.popoverProps ?? {}),
          render
        )}
        ref={(element: HTMLElement) => {
          args.setPopoverRef(element);
        }}
        id={isDialog() ? args.props.id : undefined}
        role={isDialog() ? "dialog" : undefined}
        tabindex={isDialog() ? -1 : undefined}
        aria-label={args.props["aria-label"]}
        aria-labelledby={args.props["aria-labelledby"]}
        slot={
          args.props.slot === false || args.props.slot === ""
            ? undefined
            : (args.props.slot ?? undefined)
        }
        style={{
          ...(typeof aria.popoverProps.style === "object"
            ? aria.popoverProps.style
            : undefined),
          "--trigger-anchor-point": aria.triggerAnchorPoint
            ? `${aria.triggerAnchorPoint.x}px ${aria.triggerAnchorPoint.y}px`
            : undefined,
          "--trigger-width": triggerWidth(),
          ...(typeof render.style === "object" ? render.style : undefined),
        }}
        data-trigger={values.trigger}
        data-placement={values.placement}
        data-entering={values.isEntering || undefined}
        data-exiting={values.isExiting || undefined}
      >
        <OverlayArrowContext
          value={mergeProps(
            merge(() => aria.arrowProps ?? {}),
            {
              get placement() {
                return aria.placement;
              },
              ref: (element: HTMLDivElement) => {
                setArrowRef(element);
              },
            }
          )}
        >
          {!(args.props.isNonModal === true) && (
            <DismissButton onDismiss={args.state.close} />
          )}
          <ClearContexts
            contexts={[PopoverContext, ...(args.props.clearContexts ?? [])]}
          >
            {render.children}
          </ClearContexts>
          <DismissButton onDismiss={args.state.close} />
        </OverlayArrowContext>
      </dom.div>
    </>
  );
}

function ClearContexts(props: {
  contexts: ClearableContext[];
  children?: JSX.Element;
}): JSX.Element {
  const contexts = untrack(() => props.contexts);

  const render = (index: number): JSX.Element => {
    const Current = contexts[index];

    return Current ? (
      <Current value={null}>{render(index + 1)}</Current>
    ) : (
      props.children
    );
  };

  return untrack(() => render(0));
}
