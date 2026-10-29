/*
 * Copyright 2020 Adobe. All rights reserved.
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
 * Derived from Adobe React Spectrum: packages/react-aria/src/toast/useToast.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type {
  QueuedToast,
  ToastState,
} from "@solid2-aria/stately/toast/create-toast-state";
import type {
  AriaLabelingProps,
  FocusableElement,
} from "@solid2-aria/types-shared";
import type { DOMAttributes } from "@solid2-aria/types-shared-web";
import {
  merge,
  createMemo,
  createEffect,
  createSignal,
  onSettled,
} from "solid-js";
import type { Accessor } from "solid-js";

import intlMessages from "../../intl/toast/index";
import type { AriaButtonProps } from "../button/create-button";
import { createLocalizedStringFormatter } from "../i18n/create-localized-string-formatter";
import { ariaValue } from "../utils/aria-value";
import { createId, createSlotId } from "../utils/create-id";
import { filterDOMProps } from "../utils/filter-dom-props";
import { isPresent } from "../utils/is-present";
import { getTruthyValue } from "../utils/truthy";

export interface AriaToastProps<T> extends AriaLabelingProps {
  /** The toast object. */
  toast: QueuedToast<T>;
}

export interface ToastAria {
  /** Props for the toast container, non-modal dialog element. */
  toastProps: DOMAttributes;
  /** Props for the toast content alert message. */
  contentProps: DOMAttributes;
  /** Props for the toast title element. */
  titleProps: DOMAttributes;
  /** Props for the toast description element, if any. */
  descriptionProps: DOMAttributes;
  /** Props for the toast close button. */
  closeButtonProps: AriaButtonProps;
}

/**
 * Provides the behavior and accessibility implementation for a toast component. Toasts display
 * brief, temporary notifications of actions, errors, or other events in an application.
 */
export function createToast<T>(
  props: AriaToastProps<T>,
  state: ToastState<T>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ref: Accessor<FocusableElement | null>
): ToastAria {
  const _result0 = merge(() => props.toast);
  createEffect(
    () => ({ observedTimer: _result0.timer, timeout: _result0.timeout }),
    ({ timeout, observedTimer }): undefined | (() => void) => {
      if (
        !isPresent(observedTimer) ||
        timeout === null ||
        timeout === undefined
      ) {
        return undefined;
      }

      const timer = observedTimer;
      timer.reset(timeout);

      return () => {
        timer.pause();
      };
    },
    { ssrSource: "client" }
  );
  const titleId = createId();
  const descriptionId = createSlotId();

  const stringFormatter = createLocalizedStringFormatter(
    intlMessages,
    "@react-aria/toast"
  );

  // This is required for NVDA announcements, without it NVDA will NOT announce the toast when it appears.
  // Originally was tied to animationStart/End via https://github.com/adobe/react-spectrum/pull/6223/commits/e22e319df64958e822ab7cd9685e96818cae9ba5
  // but toasts don't always have animations.
  const [isVisible, setIsVisible] = createSignal(false, { ownedWrite: true });
  onSettled(() => {
    setIsVisible(true);
  });

  const toastProps = createMemo(() =>
    filterDOMProps(props, { labelable: true })
  );

  return {
    get closeButtonProps() {
      return {
        get "aria-label"() {
          return ariaValue(ariaValue(stringFormatter.format("close")));
        },
        onPress: () => {
          state.close(_result0.key);
        },
      };
    },
    get contentProps() {
      return {
        get "aria-atomic"() {
          return ariaValue(ariaValue("true"));
        },
        get "aria-hidden"() {
          return ariaValue(ariaValue(isVisible() ? undefined : "true"));
        },
        get role(): "alert" {
          return "alert" as const;
        },
      };
    },
    get descriptionProps() {
      return {
        get id() {
          return descriptionId();
        },
      };
    },
    get titleProps() {
      return {
        get id() {
          return titleId();
        },
      };
    },
    get toastProps() {
      return merge(toastProps(), {
        get "aria-describedby"() {
          return ariaValue(
            ariaValue(
              getTruthyValue(props["aria-describedby"]) ?? descriptionId()
            )
          );
        },
        get "aria-labelledby"() {
          return ariaValue(
            ariaValue(getTruthyValue(props["aria-labelledby"]) ?? titleId())
          );
        },
        get "aria-modal"() {
          return ariaValue(ariaValue("false"));
        },
        get role(): "alertdialog" {
          return "alertdialog" as const;
        },
        get tabindex(): 0 {
          return 0;
        },
      });
    },
  };
}
