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
 * Derived from Adobe React Spectrum: packages/react-aria-components/src/Tooltip.tsx.
 * Modified for Solid Aria: adapted components, contexts, refs, warmup animation state, and reactive properties for Solid 2; included data attributes in the tooltip contract; uses Solid class props.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { FocusableProvider } from "@solid2-aria/core/interactions/create-focusable";
import { createOverlayPosition } from "@solid2-aria/core/overlays/create-overlay-position";
import type {
  PositionProps,
  PlacementAxis,
} from "@solid2-aria/core/overlays/create-overlay-position";
import { Overlay } from "@solid2-aria/core/overlays/overlay";
import { createTooltip } from "@solid2-aria/core/tooltip/create-tooltip";
import { createTooltipTrigger } from "@solid2-aria/core/tooltip/create-tooltip-trigger";
import {
  createEnterAnimation,
  createExitAnimation,
} from "@solid2-aria/core/utils/animation";
import { filterDOMProps } from "@solid2-aria/core/utils/filter-dom-props";
import { mergeProps } from "@solid2-aria/core/utils/merge-props";
import { requireValue } from "@solid2-aria/core/utils/require-value";
import { createTooltipTriggerState } from "@solid2-aria/stately/tooltip/create-tooltip-trigger-state";
import type {
  TooltipTriggerProps,
  TooltipTriggerState,
} from "@solid2-aria/stately/tooltip/create-tooltip-trigger-state";
import type { FocusableElement, DOMProps } from "@solid2-aria/types-shared";
import type { JSX } from "@solidjs/web";
import {
  merge,
  createSignal,
  createContext,
  Show,
  useContext,
  untrack,
  onSettled,
} from "solid-js";
import type { Accessor } from "solid-js";

import { OverlayArrowContext } from "./overlay-arrow";
import { dom, createContextProps, createRenderProps } from "./utils";
import type { ContextValue, Ref, RenderProps } from "./utils";

const fallbackTrigger = () => null;

export interface TooltipTriggerComponentProps extends TooltipTriggerProps {
  children?: JSX.Element;
}

export interface TooltipRenderProps {
  placement: PlacementAxis | null;
  isEntering: boolean;
  isExiting: boolean;
}

export interface TooltipProps
  extends
    PositionProps,
    TooltipTriggerProps,
    RenderProps<TooltipRenderProps>,
    Pick<DOMProps, `data-${string}`> {
  ref?: Ref<HTMLDivElement>;
  triggerRef?: Accessor<Element | null>;
  isEntering?: boolean;
  isExiting?: boolean;
  UNSTABLE_portalContainer?: Element;
  "aria-label"?: JSX.HTMLAttributes<HTMLDivElement>["aria-label"];
  "aria-labelledby"?: JSX.HTMLAttributes<HTMLDivElement>["aria-labelledby"];
}

export const TooltipContext =
  createContext<ContextValue<TooltipProps, HTMLDivElement>>(null);

export const TooltipTriggerStateContext =
  createContext<TooltipTriggerState | null>(null);

export function TooltipTrigger(
  props: TooltipTriggerComponentProps
): JSX.Element {
  const state = createTooltipTriggerState(props);

  const [ref, setRef] = createSignal<FocusableElement | null>(null, {
    ownedWrite: true,
  });

  const aria = createTooltipTrigger(props, state, ref);

  return (
    <TooltipTriggerStateContext value={state}>
      <TooltipContext
        value={mergeProps(
          merge(() => aria.tooltipProps ?? {}),
          { triggerRef: ref }
        )}
      >
        <FocusableProvider
          {...aria.triggerProps}
          ref={(element: FocusableElement) => {
            setRef(element);
          }}
        >
          {props.children}
        </FocusableProvider>
      </TooltipContext>
    </TooltipTriggerStateContext>
  );
}

export function Tooltip(input: TooltipProps): JSX.Element {
  const [props, ref, setRef] = createContextProps(
    input,
    untrack(() => input.ref),
    TooltipContext
  );

  const context = useContext(TooltipTriggerStateContext);
  const local = createTooltipTriggerState(props);

  const state = untrack(
    () =>
      props.isOpen !== undefined || props.defaultOpen !== undefined || !context
  )
    ? local
    : requireValue(context, "Expected context");

  const exitAnimation = createExitAnimation(ref, () => state.isOpen);

  const exiting = () =>
    props.isExiting === true || (!state.shouldSkipAnimation && exitAnimation());

  return (
    <Show when={state.isOpen || exiting()}>
      <Overlay
        portalContainer={props.UNSTABLE_portalContainer}
        disableFocusManagement
      >
        <TooltipInner
          props={props}
          tooltipRef={ref}
          setTooltipRef={(element: HTMLDivElement | null) => {
            setRef(element);
          }}
          state={state}
          exiting={exiting}
        />
      </Overlay>
    </Show>
  );
}

function TooltipInner(args: {
  props: TooltipProps;
  tooltipRef: Accessor<HTMLDivElement | null>;
  setTooltipRef: (element: HTMLDivElement | null) => void;
  state: TooltipTriggerState;
  exiting: () => boolean;
}): JSX.Element {
  onSettled(() => () => {
    args.setTooltipRef(null);
  });

  const [arrowRef, setArrowRef] = createSignal<HTMLDivElement | null>(null, {
    ownedWrite: true,
  });

  const position = createOverlayPosition(
    mergeProps(
      merge(() => args.props ?? {}),
      {
        arrowRef,
        get isOpen() {
          return args.state.isOpen;
        },
        onClose() {
          args.state.close(true);
        },
        get overlayRef() {
          return args.tooltipRef;
        },
        get placement() {
          return args.props.placement ?? "top";
        },
        get targetRef() {
          return args.props.triggerRef ?? fallbackTrigger;
        },
      }
    )
  );

  const aria = createTooltip(
    mergeProps(
      merge(() => args.props ?? {}),
      {
        get "aria-label"() {
          return typeof args.props["aria-label"] === "string"
            ? args.props["aria-label"]
            : undefined;
        },
        get "aria-labelledby"() {
          return typeof args.props["aria-labelledby"] === "string"
            ? args.props["aria-labelledby"]
            : undefined;
        },
      }
    ),
    untrack(() => args.state)
  );

  const entering = createEnterAnimation(
    untrack(() => args.tooltipRef),
    () => position.placement !== null
  );

  const values: TooltipRenderProps = {
    get isEntering() {
      return (
        args.props.isEntering === true ||
        (!args.state.shouldSkipAnimation && entering())
      );
    },
    get isExiting() {
      return args.exiting();
    },
    get placement() {
      return position.placement;
    },
  };

  const render = createRenderProps(
    mergeProps(
      merge(() => args.props ?? {}),
      { defaultClass: "solid2-aria-Tooltip", values }
    )
  );

  return (
    <dom.div
      {...mergeProps(
        filterDOMProps(args.props, { global: true }),
        merge(() => position.overlayProps ?? {}),
        merge(() => aria.tooltipProps ?? {}),
        render
      )}
      style={{
        ...(typeof position.overlayProps.style === "object"
          ? position.overlayProps.style
          : undefined),
        ...(typeof render.style === "object" ? render.style : undefined),
      }}
      ref={(element: HTMLDivElement) => {
        args.setTooltipRef(element);
      }}
      data-placement={values.placement}
      data-entering={values.isEntering || undefined}
      data-exiting={values.isExiting || undefined}
    >
      <OverlayArrowContext
        value={mergeProps(
          merge(() => position.arrowProps ?? {}),
          {
            get placement() {
              return position.placement;
            },
            ref: (element: HTMLDivElement) => {
              setArrowRef(element);
            },
          }
        )}
      >
        {render.children}
      </OverlayArrowContext>
    </dom.div>
  );
}
