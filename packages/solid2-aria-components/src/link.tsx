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
 * Derived from Adobe React Spectrum: packages/react-aria-components/src/Link.tsx.
 * Modified for Solid Aria: adapted components, contexts, refs, and reactive properties for Solid 2; uses Solid class props.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { createFocusRing } from "@solid2-aria/core/focus/create-focus-ring";
import { createHover } from "@solid2-aria/core/interactions/create-hover";
import { createLink } from "@solid2-aria/core/link/create-link";
import type { AriaLinkOptions } from "@solid2-aria/core/link/create-link";
import { filterDOMProps } from "@solid2-aria/core/utils/filter-dom-props";
import { mergeProps } from "@solid2-aria/core/utils/merge-props";
import { isTruthy } from "@solid2-aria/core/utils/truthy";
import type { HoverEvents } from "@solid2-aria/types-shared";
import { dynamic } from "@solidjs/web";
import type { JSX } from "@solidjs/web";
import { merge, untrack, createContext, omit } from "solid-js";

import { dom, createContextProps, createRenderProps } from "./utils";
import type { Ref, ContextValue, SlotProps, RenderProps } from "./utils";

export interface LinkRenderProps {
  isCurrent: boolean;
  isHovered: boolean;
  isPressed: boolean;
  isFocused: boolean;
  isFocusVisible: boolean;
  isDisabled: boolean;
}

export interface LinkProps
  extends
    Omit<AriaLinkOptions, "children" | "elementType">,
    SlotProps,
    HoverEvents,
    RenderProps<LinkRenderProps, "a" | "span"> {
  ref?: Ref<HTMLAnchorElement>;
}

export const LinkContext =
  createContext<ContextValue<LinkProps, HTMLAnchorElement>>(null);

export function Link(input: LinkProps): JSX.Element {
  const [props, ref, setRef] = createContextProps(
    input,
    untrack(() => input.ref),
    LinkContext
  );

  const tag = () =>
    Boolean(props.href) && !(props.isDisabled === true) ? "a" : "span";

  const aria = createLink(
    mergeProps(props, {
      get elementType() {
        return tag();
      },
    }),
    ref
  );

  const focus = createFocusRing();
  const hover = createHover(props);

  const values: LinkRenderProps = {
    get isCurrent() {
      return isTruthy(props["aria-current"]);
    },
    get isDisabled() {
      return props.isDisabled === true;
    },
    get isFocusVisible() {
      return focus.isFocusVisible;
    },
    get isFocused() {
      return focus.isFocused;
    },
    get isHovered() {
      return hover.isHovered;
    },
    get isPressed() {
      return aria.isPressed;
    },
  };

  const render = createRenderProps(
    mergeProps(props, { defaultClass: "solid2-aria-Link", values })
  );

  const Element = dynamic(() => (tag() === "a" ? dom.a : dom.span));

  return (
    <Element
      {...mergeProps(
        omit(filterDOMProps(props, { global: true }), "onClick"),
        merge(() => aria.linkProps ?? {}),
        merge(() => focus.focusProps ?? {}),
        merge(() => hover.hoverProps ?? {}),
        render
      )}
      ref={(element: HTMLAnchorElement) => {
        setRef(element);
      }}
      slot={props.slot ?? undefined}
      data-current={values.isCurrent || undefined}
      data-disabled={props.isDisabled ?? undefined}
      data-pressed={aria.isPressed || undefined}
      data-hovered={hover.isHovered || undefined}
      data-focused={focus.isFocused || undefined}
      data-focus-visible={focus.isFocusVisible || undefined}
    />
  );
}
