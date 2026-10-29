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
 * Derived from Adobe React Spectrum: packages/react-aria-components/src/Group.tsx.
 * Modified for Solid Aria: adapted components, contexts, refs, and reactive properties for Solid 2; uses Solid class props.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { createFocusRing } from "@solid2-aria/core/focus/create-focus-ring";
import { createHover } from "@solid2-aria/core/interactions/create-hover";
import { filterDOMProps } from "@solid2-aria/core/utils/filter-dom-props";
import { mergeProps } from "@solid2-aria/core/utils/merge-props";
import { isTruthy } from "@solid2-aria/core/utils/truthy";
import type { HoverEvents } from "@solid2-aria/types-shared";
import type { JSX } from "@solidjs/web";
import { merge, untrack, createContext } from "solid-js";

import { dom, createContextProps, createRenderProps } from "./utils";
import type { Ref, ContextValue, SlotProps, RenderProps } from "./utils";

export interface GroupRenderProps {
  isHovered: boolean;
  isFocusWithin: boolean;
  isFocusVisible: boolean;
  isDisabled: boolean;
  isInvalid: boolean;
}

export interface GroupProps
  extends
    SlotProps,
    HoverEvents,
    RenderProps<GroupRenderProps>,
    Omit<
      JSX.HTMLAttributes<HTMLDivElement>,
      "class" | "style" | "children" | "ref" | "slot"
    > {
  isDisabled?: boolean;
  isInvalid?: boolean;
  isReadOnly?: boolean;
  ref?: Ref<HTMLDivElement>;
}

export const GroupContext =
  createContext<ContextValue<GroupProps, HTMLDivElement>>(null);

export function Group(input: GroupProps): JSX.Element {
  const [props, , setRef] = createContextProps(
    input,
    untrack(() => input.ref),
    GroupContext
  );

  const focus = createFocusRing({ within: true });

  const disabled = () =>
    props.isDisabled ??
    (isTruthy(props["aria-disabled"]) && props["aria-disabled"] !== "false");

  const invalid = () =>
    props.isInvalid ??
    (isTruthy(props["aria-invalid"]) && props["aria-invalid"] !== "false");

  const hover = createHover(
    mergeProps(props, {
      get isDisabled() {
        return disabled();
      },
    })
  );

  const values: GroupRenderProps = {
    get isDisabled() {
      return disabled();
    },
    get isFocusVisible() {
      return focus.isFocusVisible;
    },
    get isFocusWithin() {
      return focus.isFocused;
    },
    get isHovered() {
      return hover.isHovered;
    },
    get isInvalid() {
      return invalid();
    },
  };

  const render = createRenderProps(
    mergeProps(props, { defaultClass: "solid2-aria-Group", values })
  );

  return (
    <dom.div
      {...mergeProps(
        filterDOMProps(props, { global: true, labelable: true }),
        merge(() => focus.focusProps ?? {}),
        merge(() => hover.hoverProps ?? {}),
        render
      )}
      ref={(element: HTMLDivElement) => {
        setRef(element);
      }}
      role={props.role ?? "group"}
      slot={props.slot ?? undefined}
      data-focus-within={focus.isFocused || undefined}
      data-focus-visible={focus.isFocusVisible || undefined}
      data-hovered={hover.isHovered || undefined}
      data-disabled={disabled() || undefined}
      data-invalid={invalid() || undefined}
      data-readonly={props.isReadOnly ?? undefined}
    />
  );
}
