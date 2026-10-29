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
 * Derived from Adobe React Spectrum: packages/react-aria/src/link/useLink.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type {
  AriaLabelingProps,
  FocusableElement,
  FocusableProps,
  LinkDOMProps,
  PressEvents,
} from "@solid2-aria/types-shared";
import type { DOMAttributes } from "@solid2-aria/types-shared-web";
import { omit, createMemo } from "solid-js";
import type { Accessor } from "solid-js";

import { createFocusable } from "../interactions/create-focusable";
import { createPress } from "../interactions/create-press";
import type { MouseEvent as NativeMouseEvent } from "../types";
import { ariaValue } from "../utils/aria-value";
import { filterDOMProps } from "../utils/filter-dom-props";
import { mergeProps } from "../utils/merge-props";
import {
  handleLinkClick,
  createLinkProps,
  createRouter,
} from "../utils/open-link";
import { getTruthyValue, isTruthy } from "../utils/truthy";

export interface LinkProps extends PressEvents, FocusableProps {}

export interface AriaLinkProps
  extends LinkProps, LinkDOMProps, AriaLabelingProps {
  /**
   * Indicates whether this element represents the current item within a container or set of related
   * elements.
   */
  "aria-current"?:
    | boolean
    | "true"
    | "false"
    | "page"
    | "step"
    | "location"
    | "date"
    | "time";
}

export interface AriaLinkOptions extends AriaLinkProps {
  /** Whether the link is disabled. */
  isDisabled?: boolean;
  /**
   * The HTML element used to render the link, e.g. 'a', or 'span'.
   *
   * @default 'a'
   */
  elementType?: string;
}

export interface LinkAria {
  /** Props for the link element. */
  linkProps: DOMAttributes;
  /** Whether the link is currently pressed. */
  isPressed: boolean;
}

/**
 * Provides the behavior and accessibility implementation for a link component.
 * A link allows a user to navigate to another page or resource within a web page
 * or application.
 */
export function createLink(
  props: AriaLinkOptions,
  ref: Accessor<FocusableElement | null>
): LinkAria {
  const _result0 = props;
  let linkProps: DOMAttributes = {};

  if ((_result0.elementType ?? "a") !== "a") {
    linkProps = {
      role: "link",
      tabindex: isTruthy(_result0.isDisabled) ? undefined : 0,
    };
  }

  const _result1 = createFocusable(props, ref);

  const _result2 = createPress({
    get isDisabled() {
      return _result0.isDisabled;
    },
    get onClick() {
      return _result0.onClick;
    },
    get onPress() {
      return _result0.onPress;
    },
    get onPressChange() {
      return _result0.onPressChange;
    },
    get onPressEnd() {
      return _result0.onPressEnd;
    },
    get onPressStart() {
      return _result0.onPressStart;
    },
    get ref() {
      return ref;
    },
  });

  const domProps = createMemo(() =>
    filterDOMProps(
      omit(
        _result0,
        "elementType",
        "onPress",
        "onPressStart",
        "onPressEnd",
        "onPressChange",
        "onClick",
        "isDisabled"
      ),
      { labelable: true }
    )
  );

  const interactionHandlers = createMemo(() =>
    mergeProps(_result1.focusableProps, _result2.pressProps)
  );

  const router = createRouter();
  const routerLinkProps = createLinkProps(props);

  return {
    get isPressed() {
      return _result2.isPressed;
    },
    get linkProps() {
      return mergeProps(domProps(), routerLinkProps, {
        ...interactionHandlers(),
        ...linkProps,
        "aria-current": ariaValue(props["aria-current"]),
        "aria-disabled": ariaValue(
          getTruthyValue(_result0.isDisabled) ?? undefined
        ),
        onClick: (e: NativeMouseEvent<HTMLAnchorElement>) => {
          _result2.pressProps.onClick?.(e);
          handleLinkClick(e, router, props.href, props.routerOptions);
        },
      });
    },
  };
}
