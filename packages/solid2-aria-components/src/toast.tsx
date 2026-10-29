/*
 * Copyright 2025 Adobe. All rights reserved.
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
 * Derived from Adobe React Spectrum: packages/react-aria-components/src/Toast.tsx.
 * Modified for Solid Aria: adapted components, contexts, refs, and reactive properties for Solid 2; uses Solid class props.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { createFocusRing } from "@solid2-aria/core/focus/create-focus-ring";
import { createHover } from "@solid2-aria/core/interactions/create-hover";
import { createUNSAFE_PortalContext } from "@solid2-aria/core/overlays/portal-provider";
import { createToast } from "@solid2-aria/core/toast/create-toast";
import { createToastRegion } from "@solid2-aria/core/toast/create-toast-region";
import { filterDOMProps } from "@solid2-aria/core/utils/filter-dom-props";
import { mergeProps } from "@solid2-aria/core/utils/merge-props";
import { createToastQueue } from "@solid2-aria/stately/toast/create-toast-state";
import type {
  ToastQueue,
  ToastState,
  QueuedToast,
  ToastOptions,
} from "@solid2-aria/stately/toast/create-toast-state";
import { Portal, isServer } from "@solidjs/web";
import type { JSX } from "@solidjs/web";
import {
  merge,
  untrack,
  createSignal,
  createContext,
  For,
  Show,
  useContext,
} from "solid-js";

import { ButtonContext } from "./button";
import { HeadingContext } from "./heading";
import { TextContext } from "./text";
import {
  assignRef,
  dom,
  DEFAULT_SLOT,
  createContextProps,
  createRenderProps,
} from "./utils";
import type { ContextValue, Ref, RenderProps } from "./utils";

export interface ToastRegionRenderProps<T> {
  visibleToasts: QueuedToast<T>[];
  isHovered: boolean;
  isFocused: boolean;
  isFocusVisible: boolean;
}

export interface ToastRegionProps<T> extends Omit<
  RenderProps<ToastRegionRenderProps<T>>,
  "children"
> {
  queue: ToastQueue<T>;
  children?: JSX.Element | ((props: { toast: QueuedToast<T> }) => JSX.Element);
  ref?: Ref<HTMLDivElement>;
  "aria-label"?: string;
}

export interface ToastListProps<T> {
  children: (props: { toast: QueuedToast<T> }) => JSX.Element;
  ref?: Ref<HTMLOListElement>;
  class?: JSX.ClassValue;
  style?: JSX.CSSProperties;
}

export interface ToastRenderProps<T> {
  toast: QueuedToast<T>;
  isFocused: boolean;
  isFocusVisible: boolean;
}

export interface ToastProps<T> extends RenderProps<ToastRenderProps<T>> {
  toast: QueuedToast<T>;
  ref?: Ref<HTMLDivElement>;
}

export interface ToastContentProps extends RenderProps<undefined> {
  ref?: Ref<HTMLDivElement>;
}

type AnyToastState = Omit<ToastState<unknown>, "add"> & {
  add: {
    // oxlint-disable-next-line typescript/method-signature-style, anti-slop/no-unknown-parameters -- Toast content is generic; the queue and render callback retain its actual type.
    bivarianceHack(content: unknown, options?: ToastOptions): string;
  }["bivarianceHack"];
};

export const UNSTABLE_ToastStateContext = createContext<AnyToastState | null>(
  null
);

export const ToastContentContext =
  createContext<ContextValue<ToastContentProps, HTMLDivElement>>(null);

export function UNSTABLE_ToastRegion<T>(
  props: ToastRegionProps<T>
): JSX.Element {
  const state = createToastQueue(untrack(() => props.queue));

  const [ref, setRef] = createSignal<HTMLDivElement | null>(null, {
    ownedWrite: true,
  });

  const aria = createToastRegion(props, state, ref);
  const focus = createFocusRing({ within: true });
  const hover = createHover({});
  const portal = createUNSAFE_PortalContext();

  const values: ToastRegionRenderProps<T> = {
    get isFocusVisible() {
      return focus.isFocusVisible;
    },
    get isFocused() {
      return focus.isFocused;
    },
    get isHovered() {
      return hover.isHovered;
    },
    get visibleToasts() {
      return state.visibleToasts;
    },
  };

  const render = createRenderProps(
    mergeProps(props, {
      children: undefined,
      defaultClass: "solid2-aria-ToastRegion",
      values,
    })
  );

  if (isServer) {
    // oxlint-disable-next-line solid/components-return-once -- Static collection traversal and context registration are fixed when the owner is created.
    return null;
  }

  return (
    <Show when={state.visibleToasts.length > 0}>
      <Portal mount={portal.getContainer?.() ?? document.body}>
        <UNSTABLE_ToastStateContext value={state}>
          <dom.div
            {...mergeProps(
              filterDOMProps(props, { global: true }),
              merge(() => aria.regionProps ?? {}),
              merge(() => focus.focusProps ?? {}),
              merge(() => hover.hoverProps ?? {}),
              render
            )}
            ref={[
              (element: HTMLDivElement) => {
                setRef(element);
              },
              (element: HTMLDivElement) => {
                assignRef(
                  untrack(() => props.ref),
                  element
                );
              },
            ]}
            data-hovered={values.isHovered || undefined}
            data-focused={values.isFocused || undefined}
            data-focus-visible={values.isFocusVisible || undefined}
          >
            {typeof props.children === "function" ? (
              <For each={state.visibleToasts}>
                {(toast) =>
                  typeof props.children === "function"
                    ? props.children({ toast })
                    : null
                }
              </For>
            ) : (
              props.children
            )}
          </dom.div>
        </UNSTABLE_ToastStateContext>
      </Portal>
    </Show>
  );
}

export function UNSTABLE_ToastList<T>(props: ToastListProps<T>): JSX.Element {
  const state = useContext(UNSTABLE_ToastStateContext);

  if (!state) {
    throw new Error("ToastList requires ToastRegion");
  }

  return (
    <dom.ol
      class={props.class ?? "solid2-aria-ToastList"}
      style={props.style}
      ref={(element: HTMLOListElement) => {
        assignRef(
          untrack(() => props.ref),
          element
        );
      }}
    >
      <For each={state.visibleToasts}>
        {(toast) => {
          // SAFETY: This region renders the same T values enqueued by its owning toast queue.
          // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The shared region context erases its generic content type.
          const typedToast = toast as QueuedToast<T>;

          return props.children({ toast: typedToast });
        }}
      </For>
    </dom.ol>
  );
}

export function UNSTABLE_Toast<T>(props: ToastProps<T>): JSX.Element {
  const state = useContext(UNSTABLE_ToastStateContext);

  if (!state) {
    throw new Error("Toast requires ToastRegion");
  }

  const [ref, setRef] = createSignal<HTMLDivElement | null>(null, {
    ownedWrite: true,
  });

  const aria = createToast(props, state, ref);
  const focus = createFocusRing({ within: true });

  const values: ToastRenderProps<T> = {
    get isFocusVisible() {
      return focus.isFocusVisible;
    },
    get isFocused() {
      return focus.isFocused;
    },
    get toast() {
      return props.toast;
    },
  };

  const render = createRenderProps(
    mergeProps(props, { defaultClass: "solid2-aria-Toast", values })
  );

  return (
    <dom.div
      {...mergeProps(
        filterDOMProps(props, { global: true }),
        merge(() => aria.toastProps ?? {}),
        merge(() => focus.focusProps ?? {}),
        render
      )}
      ref={[
        (element: HTMLDivElement) => {
          setRef(element);
        },
        (element: HTMLDivElement) => {
          assignRef(
            untrack(() => props.ref),
            element
          );
        },
      ]}
      data-focused={values.isFocused || undefined}
      data-focus-visible={values.isFocusVisible || undefined}
    >
      <ToastContentContext value={aria.contentProps}>
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
                  return aria.descriptionProps;
                },
              },
            }}
          >
            <ButtonContext
              value={{
                slots: {
                  [DEFAULT_SLOT]: {},
                  get close() {
                    return aria.closeButtonProps;
                  },
                },
              }}
            >
              {render.children}
            </ButtonContext>
          </TextContext>
        </HeadingContext>
      </ToastContentContext>
    </dom.div>
  );
}

export function UNSTABLE_ToastContent(input: ToastContentProps): JSX.Element {
  const [props, , setRef] = createContextProps(
    input,
    untrack(() => input.ref),
    ToastContentContext
  );

  const render = createRenderProps(
    mergeProps(props, {
      defaultClass: "solid2-aria-ToastContent",
      values: undefined,
    })
  );

  return (
    <dom.div
      {...mergeProps(filterDOMProps(props, { global: true }), render)}
      ref={(element: HTMLDivElement) => {
        setRef(element);
      }}
    />
  );
}
