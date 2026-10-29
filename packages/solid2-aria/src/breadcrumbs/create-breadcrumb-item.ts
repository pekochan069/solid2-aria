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
 * Derived from Adobe React Spectrum: packages/react-aria/src/breadcrumbs/useBreadcrumbItem.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type {
  DOMProps,
  FocusableElement,
  LinkDOMProps,
} from "@solid2-aria/types-shared";
import type { DOMAttributes } from "@solid2-aria/types-shared-web";
import { untrack, omit, merge, createMemo } from "solid-js";
import type { Accessor, Element as SolidElement } from "solid-js";

import { createLink } from "../link/create-link";
import type { AriaLinkProps } from "../link/create-link";
import { ariaValue } from "../utils/aria-value";
import { getTruthyValue, isTruthy } from "../utils/truthy";

export interface BreadcrumbItemProps extends AriaLinkProps, LinkDOMProps {
  /** Whether the breadcrumb item represents the current page. */
  isCurrent?: boolean;
  /**
   * The type of current location the breadcrumb item represents, if `isCurrent` is true.
   *
   * @default 'page'
   */
  "aria-current"?:
    | "page"
    | "step"
    | "location"
    | "date"
    | "time"
    | boolean
    | "true"
    | "false";
  /** Whether the breadcrumb item is disabled. */
  isDisabled?: boolean;
  /** The contents of the breadcrumb item. */
  children: SolidElement;
}

export interface AriaBreadcrumbItemProps extends BreadcrumbItemProps, DOMProps {
  /**
   * The HTML element used to render the breadcrumb link, e.g. 'a', or 'span'.
   *
   * @default 'a'
   */
  elementType?: string;
}

export interface BreadcrumbItemAria {
  /** Props for the breadcrumb item link element. */
  itemProps: DOMAttributes;
}

/**
 * Provides the behavior and accessibility implementation for an in a breadcrumbs component.
 * See `useBreadcrumbs` for details about breadcrumbs.
 */
export function createBreadcrumbItem(
  props: AriaBreadcrumbItemProps,
  ref: Accessor<FocusableElement | null>
): BreadcrumbItemAria {
  const _result0 = props;

  const _result1 = createLink(
    merge(
      {
        get elementType() {
          return _result0.elementType ?? "a";
        },
        get isDisabled() {
          return getTruthyValue(_result0.isDisabled) ?? _result0.isCurrent;
        },
      },
      omit(_result0, "isCurrent", "isDisabled", "aria-current", "elementType")
    ),
    ref
  );

  const isHeading = createMemo(() =>
    /^h[1-6]$/u.test(_result0.elementType ?? "a")
  );

  let itemProps: DOMAttributes = {};

  if (!untrack(() => isHeading())) {
    itemProps = untrack(() => _result1.linkProps);
  }

  if (isTruthy(_result0.isCurrent)) {
    itemProps["aria-current"] = ariaValue(
      getTruthyValue(_result0["aria-current"]) ?? "page"
    );
    // isCurrent sets isDisabled === true for the current item,
    // so we have to restore the tabIndex in order to support autoFocus.

    itemProps.tabindex = isTruthy(props.autoFocus) ? -1 : undefined;
  }

  return {
    get itemProps() {
      return merge(
        {
          get "aria-disabled"() {
            return ariaValue(ariaValue(_result0.isDisabled));
          },
        },
        itemProps
      );
    },
  };
}
