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
 * Derived from Adobe React Spectrum: packages/react-aria/src/utils/filterDOMProps.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { AriaLabelingProps, DOMProps } from "@solid2-aria/types-shared";
import type { GlobalDOMAttributes } from "@solid2-aria/types-shared-web";

import { readProperty } from "./read-property";
import { isTruthy } from "./truthy";

const DOMPropNames = new Set(["id"]);

const labelablePropNames = new Set([
  "aria-label",
  "aria-labelledby",
  "aria-describedby",
  "aria-details",
]);

// See LinkDOMProps in dom.d.ts.
const linkPropNames = new Set([
  "href",
  "hrefLang",
  "target",
  "rel",
  "download",
  "ping",
  "referrerPolicy",
]);

const globalAttrs = new Set([
  "dir",
  "lang",
  "hidden",
  "inert",
  "translate",
  "suppressHydrationWarning",
]);

const globalEvents = new Set([
  "onClick",
  "onAuxClick",
  "onContextMenu",
  "onDblClick",
  "onMouseDown",
  "onMouseEnter",
  "onMouseLeave",
  "onMouseMove",
  "onMouseOut",
  "onMouseOver",
  "onMouseUp",
  "onTouchCancel",
  "onTouchEnd",
  "onTouchMove",
  "onTouchStart",
  "onPointerDown",
  "onPointerMove",
  "onPointerUp",
  "onPointerCancel",
  "onPointerEnter",
  "onPointerLeave",
  "onPointerOver",
  "onPointerOut",
  "onGotPointerCapture",
  "onLostPointerCapture",
  "onScroll",
  "onWheel",
  "onAnimationStart",
  "onAnimationEnd",
  "onAnimationIteration",
  "onTransitionCancel",
  "onTransitionEnd",
  "onTransitionRun",
  "onTransitionStart",
]);

interface Options {
  /**
   * If labelling associated aria properties should be included in the filter.
   */
  labelable?: boolean;
  /** Whether the element is a link and should include DOM props for <a> elements. */
  isLink?: boolean;
  /** Whether to include global DOM attributes. */
  global?: boolean;
  /** Whether to include DOM events. */
  events?: boolean;
  /**
   * A Set of other property names that should be included in the filter.
   */
  propNames?: Set<string>;
}

const propRe = /^data-.*$/u;

/**
 * Filters out all props that aren't valid DOM props or defined via override prop obj.
 *
 * @param props - The component props to be filtered.
 * @param opts - Props to override.
 */
export function filterDOMProps(
  // oxlint-disable-next-line anti-slop/no-object-parameters -- This boundary filters arbitrary component props into the declared DOM prop contract.
  props: object,
  opts: Options = {}
): DOMProps & AriaLabelingProps & GlobalDOMAttributes {
  function included(prop: string): boolean {
    return (
      DOMPropNames.has(prop) ||
      (isTruthy(opts.labelable) && labelablePropNames.has(prop)) ||
      (isTruthy(opts.isLink) && linkPropNames.has(prop)) ||
      (isTruthy(opts.global) && globalAttrs.has(prop)) ||
      (isTruthy(opts.events ?? opts.global) &&
        (globalEvents.has(prop) ||
          (prop.endsWith("Capture") && globalEvents.has(prop.slice(0, -7))))) ||
      isTruthy(opts.propNames?.has(prop)) ||
      propRe.test(prop)
    );
  }

  const keys = () => Object.keys(props).filter(included);

  return new Proxy(
    {},
    {
      get: (_, key): ReturnType<typeof readProperty> => {
        if (typeof key !== "string" || !included(key)) {
          return undefined;
        }

        const value = readProperty(props, key);

        if (
          key === "dir" &&
          value !== "ltr" &&
          value !== "rtl" &&
          value !== "auto"
        ) {
          return undefined;
        }

        return value;
      },
      getOwnPropertyDescriptor: (_, key) =>
        typeof key === "string" && included(key) && Object.hasOwn(props, key)
          ? {
              configurable: true,
              enumerable: true,
              get: () => readProperty(props, key),
            }
          : undefined,
      has: (_, key) => typeof key === "string" && included(key) && key in props,
      ownKeys: keys,
    }
  );
}
