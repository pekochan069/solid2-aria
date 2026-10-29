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
 * Derived from Adobe React Spectrum: packages/react-aria-components/src/SharedElementTransition.tsx.
 * Modified for Solid Aria: adapted components, contexts, refs, and reactive properties for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { filterDOMProps } from "@solid2-aria/core/utils/filter-dom-props";
import { mergeProps } from "@solid2-aria/core/utils/merge-props";
import type { JSX } from "@solidjs/web";
import {
  createSignal,
  createContext,
  createEffect,
  onSettled,
  Show,
  useContext,
  untrack,
} from "solid-js";

import { assignRef, dom, createRenderProps } from "./utils";
import type { Ref, SlotProps, RenderProps } from "./utils";

interface Snapshot {
  rect: DOMRect;
  style: [string, string][];
}

const SharedElementContext = createContext<Map<string, Snapshot> | null>(null);

export interface SharedElementTransitionProps {
  children?: JSX.Element;
}

export function SharedElementTransition(
  props: SharedElementTransitionProps
): JSX.Element {
  return (
    <SharedElementContext value={new Map()}>
      {props.children}
    </SharedElementContext>
  );
}

export interface SharedElementRenderProps {
  isEntering: boolean;
  isExiting: boolean;
}

export interface SharedElementPropsBase
  extends
    Omit<
      JSX.HTMLAttributes<HTMLDivElement>,
      "children" | "class" | "style" | "ref" | "slot"
    >,
    SlotProps,
    RenderProps<SharedElementRenderProps> {
  ref?: Ref<HTMLDivElement>;
}

export interface SharedElementProps extends SharedElementPropsBase {
  name: string;
  isVisible?: boolean;
}

export function SharedElement(props: SharedElementProps): JSX.Element {
  const scope = useContext(SharedElementContext);

  if (!scope) {
    throw new Error("SharedElement must be inside SharedElementTransition.");
  }

  const [ref, setRef] = createSignal<HTMLDivElement | null>(null, {
    ownedWrite: true,
  });

  const [state, setState] = createSignal<
    "visible" | "hidden" | "entering" | "exiting"
  >(
    untrack(() => (props.isVisible === false ? "hidden" : "visible")),
    { ownedWrite: true }
  );

  let frame: number | undefined;
  let generation = 0;

  const snapshot = () => {
    const el = ref();

    if (!(el?.isConnected === true) || Object.hasOwn(el.dataset, "exiting")) {
      return;
    }

    const style = getComputedStyle(el);

    if (style.transitionProperty !== "none") {
      scope.set(props.name, {
        rect: el.getBoundingClientRect(),
        style: style.transitionProperty
          .split(/\s*,\s*/u)
          .map((property) => [property, style.getPropertyValue(property)]),
      });
    }
  };

  createEffect(
    () => ({
      element: ref(),
      name: props.name,
      visible: props.isVisible !== false,
    }),
    ({ visible, name, element }): undefined | (() => void) => {
      generation += 1;
      const current = generation;

      if (frame !== undefined) {
        cancelAnimationFrame(frame);
      }

      if (visible && !element) {
        setState("visible");

        return undefined;
      }

      if (!element) {
        return undefined;
      }

      const previous = scope.get(name);

      if (visible && previous) {
        scope.delete(name);
        setState("visible");
        const animations = element.getAnimations?.() ?? [];

        const values = previous.style.map(([property, value]) => {
          const currentValue = element.style.getPropertyValue(property);

          if (property === "translate") {
            const rect = element.getBoundingClientRect();
            element.style.setProperty(
              property,
              `${previous.rect.left - rect.left}px ${previous.rect.top - rect.top}px`
            );
          } else {
            element.style.setProperty(property, value);
          }

          return [property, currentValue] as const;
        });

        for (const animation of element.getAnimations?.() ?? []) {
          if (!animations.includes(animation)) {
            animation.cancel();
          }
        }

        frame = requestAnimationFrame(() => {
          for (const [property, value] of values) {
            element.style.setProperty(property, value);
          }

          frame = undefined;
        });
      } else if (visible) {
        setState("entering");
        frame = requestAnimationFrame(() => {
          frame = undefined;

          if (current === generation) {
            setState("visible");
          }
        });
      } else {
        snapshot();
        queueMicrotask(() => {
          if (current !== generation) {
            return;
          }

          if (scope.has(name)) {
            scope.delete(name);
            setState("exiting");

            const hide = async () => {
              await Promise.allSettled(
                (element.getAnimations?.() ?? []).map(
                  // oxlint-disable-next-line typescript/promise-function-async -- Wait on existing animation promises without wrapping them.
                  (animation) => animation.finished
                )
              );

              if (current === generation) {
                setState("hidden");
              }
            };

            void hide();
          } else {
            setState("hidden");
          }
        });
      }

      return snapshot;
    }
  );
  onSettled(() => () => {
    generation += 1;
    snapshot();

    if (frame !== undefined) {
      cancelAnimationFrame(frame);
    }
  });

  const values: SharedElementRenderProps = {
    get isEntering() {
      return state() === "entering";
    },
    get isExiting() {
      return state() === "exiting";
    },
  };

  const render = createRenderProps(mergeProps(props, { values }));

  return (
    <Show when={state() !== "hidden"}>
      <dom.div
        {...filterDOMProps(props, { global: true })}
        {...render}
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
        data-entering={values.isEntering || undefined}
        data-exiting={values.isExiting || undefined}
      />
    </Show>
  );
}
