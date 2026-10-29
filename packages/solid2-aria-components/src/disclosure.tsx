/*
 * Copyright 2024 Adobe. All rights reserved.
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
 * Derived from Adobe React Spectrum: packages/react-aria-components/src/Disclosure.tsx.
 * Modified for Solid Aria: adapted components, contexts, refs, and reactive properties for Solid 2; uses Solid class props.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { createDisclosure } from "@solid2-aria/core/disclosure/create-disclosure";
import type { AriaDisclosureProps } from "@solid2-aria/core/disclosure/create-disclosure";
import { createFocusRing } from "@solid2-aria/core/focus/create-focus-ring";
import { filterDOMProps } from "@solid2-aria/core/utils/filter-dom-props";
import { mergeProps } from "@solid2-aria/core/utils/merge-props";
import { createDisclosureGroupState } from "@solid2-aria/stately/disclosure/create-disclosure-group-state";
import type {
  DisclosureGroupState,
  DisclosureGroupProps as GroupOptions,
} from "@solid2-aria/stately/disclosure/create-disclosure-group-state";
import { createDisclosureState } from "@solid2-aria/stately/disclosure/create-disclosure-state";
import type { DisclosureState } from "@solid2-aria/stately/disclosure/create-disclosure-state";
import type { Key } from "@solid2-aria/types-shared";
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
import type { Accessor } from "solid-js";

import { ButtonContext } from "./button";
import {
  assignRef,
  dom,
  DEFAULT_SLOT,
  createContextProps,
  createRenderProps,
} from "./utils";
import type { ContextValue, Ref, RenderProps, SlotProps } from "./utils";

export interface DisclosureGroupRenderProps {
  isDisabled: boolean;
  state: DisclosureGroupState;
}

export interface DisclosureGroupProps
  extends GroupOptions, RenderProps<DisclosureGroupRenderProps> {
  ref?: Ref<HTMLDivElement>;
}

export interface DisclosureRenderProps {
  isExpanded: boolean;
  isFocusVisibleWithin: boolean;
  isDisabled: boolean;
  state: DisclosureState;
}

export interface DisclosureProps
  extends AriaDisclosureProps, RenderProps<DisclosureRenderProps>, SlotProps {
  id?: Key;
  ref?: Ref<HTMLDivElement>;
}

export interface DisclosurePanelRenderProps {
  isFocusVisibleWithin: boolean;
}

export interface DisclosurePanelProps extends RenderProps<DisclosurePanelRenderProps> {
  ref?: Ref<HTMLDivElement>;
  role?: "group" | "region";
  shouldForceMount?: boolean;
  "aria-label"?: string;
  "aria-labelledby"?: string;
}

export const DisclosureGroupStateContext =
  createContext<DisclosureGroupState | null>(null);

export const DisclosureStateContext = createContext<DisclosureState | null>(
  null
);

export const DisclosureContext =
  createContext<ContextValue<DisclosureProps, HTMLDivElement>>(null);

const PanelContext = createContext<{
  panelProps: JSX.HTMLAttributes<HTMLElement>;
  panelRef: Accessor<HTMLDivElement | null>;
  setPanelRef: (element: HTMLDivElement) => void;
} | null>(null);

export function DisclosureGroup(props: DisclosureGroupProps): JSX.Element {
  const state = createDisclosureGroupState(props);

  const values = {
    get isDisabled() {
      return state.isDisabled;
    },
    state,
  };

  const render = createRenderProps(
    mergeProps(props, {
      defaultClass: "solid2-aria-DisclosureGroup",
      values,
    })
  );

  return (
    <dom.div
      {...filterDOMProps(props, { global: true })}
      {...render}
      ref={(element: HTMLDivElement) => {
        assignRef(
          untrack(() => props.ref),
          element
        );
      }}
      data-disabled={state.isDisabled || undefined}
    >
      <DisclosureGroupStateContext value={state}>
        {render.children}
      </DisclosureGroupStateContext>
    </dom.div>
  );
}

export function Disclosure(input: DisclosureProps): JSX.Element {
  const [props, , setRef] = createContextProps(
    input,
    untrack(() => input.ref),
    DisclosureContext
  );

  const group = useContext(DisclosureGroupStateContext);
  const defaultId = createUniqueId();
  const id = () => props.id ?? defaultId;

  const options = mergeProps(props, {
    get isDisabled() {
      return props.isDisabled ?? group?.isDisabled;
    },
    get isExpanded() {
      return group ? group.expandedKeys.has(id()) : props.isExpanded;
    },
    onExpandedChange(expanded: boolean) {
      group?.toggleKey(id());
      props.onExpandedChange?.(expanded);
    },
  });

  const state = createDisclosureState(options);

  const [panelRef, setPanelRef] = createSignal<HTMLDivElement | null>(null, {
    ownedWrite: true,
  });

  const aria = createDisclosure(options, state, panelRef);
  const focus = createFocusRing({ within: true });

  const values: DisclosureRenderProps = {
    get isDisabled() {
      return options.isDisabled === true;
    },
    get isExpanded() {
      return state.isExpanded;
    },
    get isFocusVisibleWithin() {
      return focus.isFocusVisible;
    },
    state,
  };

  const render = createRenderProps(
    mergeProps(props, { defaultClass: "solid2-aria-Disclosure", values })
  );

  const panel = {
    get panelProps() {
      return aria.panelProps;
    },
    panelRef,
    setPanelRef: (element: HTMLDivElement) => {
      setPanelRef(element);
    },
  };

  return (
    <dom.div
      {...mergeProps(
        omit(filterDOMProps(props, { global: true }), "id"),
        merge(() => focus.focusProps ?? {}),
        render
      )}
      ref={(element: HTMLDivElement) => {
        setRef(element);
      }}
      data-expanded={state.isExpanded || undefined}
      data-disabled={values.isDisabled || undefined}
      data-focus-visible-within={values.isFocusVisibleWithin || undefined}
    >
      <DisclosureStateContext value={state}>
        <PanelContext value={panel}>
          <ButtonContext
            value={{
              slots: {
                [DEFAULT_SLOT]: {},
                get trigger() {
                  return aria.buttonProps;
                },
              },
            }}
          >
            {render.children}
          </ButtonContext>
        </PanelContext>
      </DisclosureStateContext>
    </dom.div>
  );
}

export function DisclosurePanel(props: DisclosurePanelProps): JSX.Element {
  const context = useContext(PanelContext);

  if (!context) {
    throw new Error("DisclosurePanel requires Disclosure");
  }

  const focus = createFocusRing({ within: true });

  const values = {
    get isFocusVisibleWithin() {
      return focus.isFocusVisible;
    },
  };

  const render = createRenderProps(
    mergeProps(props, {
      defaultClass: "solid2-aria-DisclosurePanel",
      values,
    })
  );

  return (
    <dom.div
      {...mergeProps(
        filterDOMProps(props, { global: true }),
        merge(() => context.panelProps ?? {}),
        merge(() => focus.focusProps ?? {}),
        render
      )}
      role={props.role ?? "group"}
      ref={[
        (element: HTMLDivElement) => {
          context.setPanelRef(element);
        },
        (element: HTMLDivElement) => {
          assignRef(
            untrack(() => props.ref),
            element
          );
        },
      ]}
      data-focus-visible-within={values.isFocusVisibleWithin || undefined}
    >
      {render.children}
    </dom.div>
  );
}
