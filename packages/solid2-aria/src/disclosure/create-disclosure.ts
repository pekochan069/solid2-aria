/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
/*
 * Derived from Adobe React Spectrum: packages/react-aria/src/disclosure/useDisclosure.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { DisclosureState } from "@solid2-aria/stately/disclosure/create-disclosure-state";
import type { PressEvent } from "@solid2-aria/types-shared";
import { onSettled, createEffect, createSignal, flush } from "solid-js";
import type { Accessor } from "solid-js";

import type { AriaButtonProps } from "../button/create-button";
import type { HTMLAttributes } from "../types";
import { ariaValue } from "../utils/aria-value";
import { createEvent } from "../utils/create-event";
import { createId } from "../utils/create-id";
import { finishAnimations } from "../utils/finish-animations";
import { isPresent } from "../utils/is-present";
import { isTruthy } from "../utils/truthy";

export interface AriaDisclosureProps {
  /** Whether the disclosure is disabled. */
  isDisabled?: boolean;
  /** Handler that is called when the disclosure's expanded state changes. */
  onExpandedChange?: (isExpanded: boolean) => void;
  /** Whether the disclosure is expanded (controlled). */
  isExpanded?: boolean;
  /** Whether the disclosure is expanded by default (uncontrolled). */
  defaultExpanded?: boolean;
}

export interface DisclosureAria {
  /** Props for the disclosure button. */
  buttonProps: AriaButtonProps;
  /** Props for the disclosure panel. */
  panelProps: HTMLAttributes;
}

/**
 * Provides the behavior and accessibility implementation for a disclosure component.
 *
 * @param props - Props for the disclosure.
 * @param state - State for the disclosure, as returned by `useDisclosureState`.
 * @param ref - A ref for the disclosure panel.
 */
export function createDisclosure(
  props: AriaDisclosureProps,
  state: DisclosureState,
  ref: Accessor<HTMLElement | null>
): DisclosureAria {
  const _result0 = props;
  const triggerId = createId();
  const panelId = createId();
  const [mounted, setMounted] = createSignal(false);
  onSettled(() => {
    setMounted(true);
  });
  let raf: number | null = null;

  const handleBeforeMatch = () => {
    // Wait a frame to revert browser's removal of hidden attribute
    raf = requestAnimationFrame(() => {
      const refElement = ref();

      if (refElement) {
        refElement.setAttribute("hidden", "until-found");
      }
    });
    // Force sync state update
    state.toggle();
    flush();
  };

  createEvent(ref, "beforematch", handleBeforeMatch);
  let isExpandedRef: boolean | null = null;
  createEffect(
    () => ({
      element: ref(),
      input0: _result0.isDisabled,
      input3: !mounted(),
      isExpanded: state.isExpanded,
    }),
    ({ isExpanded, input3, element }) => {
      const refElement = element;

      // Cancel any pending RAF to prevent stale updates
      if (isTruthy(raf)) {
        cancelAnimationFrame(raf);
      }

      if (refElement && !input3) {
        const panel = refElement;

        if (
          !isPresent(isExpandedRef) ||
          typeof panel.getAnimations !== "function"
        ) {
          // On initial render (and in tests), set attributes without animation.
          if (isExpanded) {
            panel.removeAttribute("hidden");
            panel.style.setProperty("--disclosure-panel-width", "auto");
            panel.style.setProperty("--disclosure-panel-height", "auto");
          } else {
            panel.setAttribute("hidden", "until-found");
            panel.style.setProperty("--disclosure-panel-width", "0px");
            panel.style.setProperty("--disclosure-panel-height", "0px");
          }
        } else if (isExpanded !== isExpandedRef) {
          if (isExpanded) {
            panel.removeAttribute("hidden");
            // Set the width and height as pixels so they can be animated.
            panel.style.setProperty(
              "--disclosure-panel-width",
              `${panel.scrollWidth}px`
            );
            panel.style.setProperty(
              "--disclosure-panel-height",
              `${panel.scrollHeight}px`
            );
            void finishAnimations(panel.getAnimations(), () => {
              panel.style.setProperty("--disclosure-panel-width", "auto");
              panel.style.setProperty("--disclosure-panel-height", "auto");
            });
          } else {
            panel.style.setProperty(
              "--disclosure-panel-width",
              `${panel.scrollWidth}px`
            );
            panel.style.setProperty(
              "--disclosure-panel-height",
              `${panel.scrollHeight}px`
            );
            // Force style re-calculation to trigger animations.
            panel.getBoundingClientRect();
            // Animate to zero size.
            panel.style.setProperty("--disclosure-panel-width", "0px");
            panel.style.setProperty("--disclosure-panel-height", "0px");
            // Wait for animations to apply the hidden attribute.
            void finishAnimations(panel.getAnimations(), () => {
              panel.setAttribute("hidden", "until-found");
            });
          }
        }

        isExpandedRef = isExpanded;
      }
    },
    { ssrSource: "client" }
  );
  onSettled(() => () => {
    if (isTruthy(raf)) {
      cancelAnimationFrame(raf);
    }
  });

  return {
    get buttonProps() {
      return {
        get "aria-controls"() {
          return ariaValue(ariaValue(panelId()));
        },
        get "aria-expanded"() {
          return ariaValue(ariaValue(state.isExpanded));
        },
        get id() {
          return triggerId();
        },
        get isDisabled() {
          return _result0.isDisabled;
        },
        onPress: (e: PressEvent) => {
          if (!isTruthy(_result0.isDisabled) && e.pointerType !== "keyboard") {
            state.toggle();
          }
        },
        onPressStart(e: PressEvent) {
          if (e.pointerType === "keyboard" && !isTruthy(_result0.isDisabled)) {
            state.toggle();
          }
        },
      };
    },
    get panelProps() {
      // This can be overridden at the panel element level.
      return {
        get "aria-hidden"() {
          return ariaValue(ariaValue(!state.isExpanded));
        },
        get "aria-labelledby"() {
          return ariaValue(ariaValue(triggerId()));
        },
        get hidden() {
          return mounted() ? undefined : !state.isExpanded;
        },
        get id() {
          return panelId();
        },
        get role(): "group" {
          return "group";
        },
      };
    },
  };
}
