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
 * Derived from Adobe React Spectrum: packages/react-aria/src/interactions/Pressable.tsx.
 * Modified for Solid Aria: adapted components, imports, and reactive lifecycle for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { FocusableElement } from "@solid2-aria/types-shared";
import type { DOMAttributes } from "@solid2-aria/types-shared-web";
import { untrack, omit, onSettled, createSignal } from "solid-js";
import type { Element as SolidElement } from "solid-js";

import { ElementProps } from "../utils/element-props";
import type { ElementPropsChild } from "../utils/element-props";
import { isFocusable } from "../utils/is-focusable";
import { mergeProps } from "../utils/merge-props";
import { isTruthy } from "../utils/truthy";
import { createFocusable } from "./create-focusable";
import { createPress } from "./create-press";
import type { PressProps } from "./create-press";

export interface PressableProps extends PressProps {
  children: ElementPropsChild<DOMAttributes>;
  ref?: (element: FocusableElement) => void;
}

export function Pressable(props: PressableProps): SolidElement {
  const [ref, setRef] = createSignal<FocusableElement | null>(null, {
    ownedWrite: true,
  });

  const press = createPress(
    mergeProps(omit(props, "children", "ref"), { ref })
  );

  const focus = createFocusable(props, ref);

  const value = mergeProps(
    untrack(() => press.pressProps),
    focus.focusableProps,
    {
      ref: (element: FocusableElement) => {
        setRef(element);
        props.ref?.(element);
      },
    }
  );

  onSettled(() => {
    const refElement = ref();

    if (
      process.env.NODE_ENV !== "production" &&
      refElement &&
      !isTruthy(props.isDisabled) &&
      !isFocusable(refElement, { skipVisibilityCheck: true })
    ) {
      console.warn(
        "<Pressable> child must be focusable. Ensure the tabindex prop is passed through."
      );
    }
  });

  return (
    <ElementProps
      value={value}
      ref={(element) => {
        setRef(element);
      }}
    >
      {props.children}
    </ElementProps>
  );
}
