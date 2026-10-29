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
 * Derived from Adobe React Spectrum: packages/react-aria/src/interactions/useFocusable.tsx.
 * Modified for Solid Aria: adapted components, imports, and reactive lifecycle for Solid 2; narrowed focus options to consumed DOM fields.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type {
  FocusableElement,
  FocusableProps,
  FocusableDOMProps,
} from "@solid2-aria/types-shared";
import type { DOMAttributes } from "@solid2-aria/types-shared-web";
import {
  createEffect,
  merge,
  createContext,
  onSettled,
  omit,
  useContext,
  createSignal,
} from "solid-js";
import type { Accessor, Element as SolidElement } from "solid-js";

import { ElementProps } from "../utils/element-props";
import type { ElementPropsChild } from "../utils/element-props";
import { mergeProps } from "../utils/merge-props";
import { isTruthy } from "../utils/truthy";
import { createFocus } from "./create-focus";
import { createKeyboard } from "./create-keyboard";
import { focusSafely } from "./focus-safely";

export interface FocusableOptions<T = FocusableElement>
  extends
    FocusableProps<T>,
    Pick<FocusableDOMProps, "id" | "excludeFromTabOrder"> {
  isDisabled?: boolean;
}

export interface FocusableProviderProps extends DOMAttributes {
  children?: SolidElement;
  ref?: (element: FocusableElement) => void;
}

interface FocusableContextValue extends DOMAttributes {
  ref?: (element: FocusableElement) => void;
}

export const FocusableContext = createContext<FocusableContextValue | null>(
  null
);

export function FocusableProvider(props: FocusableProviderProps): SolidElement {
  return (
    <FocusableContext
      value={
        // oxlint-disable solid/reactivity -- Keep prop filtering in the renderer's lazy evaluation.
        omit(props, "children")
        // oxlint-enable solid/reactivity
      }
    >
      {props.children}
    </FocusableContext>
  );
}

export interface FocusableAria {
  focusableProps: DOMAttributes;
}

export function createFocusable<T extends FocusableElement = FocusableElement>(
  props: FocusableOptions<T>,
  ref: Accessor<FocusableElement | null>
): FocusableAria {
  const focus = createFocus(props);
  const keyboard = createKeyboard(props);
  const context = useContext(FocusableContext);
  createEffect(
    () => ({ element: ref(), setRef: context?.ref }),
    ({ element, setRef }) => {
      if (element) {
        setRef?.(element);
      }
    },
    { ssrSource: "client" }
  );
  onSettled(() => {
    const refElement = ref();

    if (isTruthy(props.autoFocus) && refElement) {
      focusSafely(refElement);
    }
  });

  const inherited = merge(
    () =>
      isTruthy(props.isDisabled)
        ? {}
        : // oxlint-disable solid/reactivity -- Keep prop filtering in the renderer's lazy evaluation.
          omit(context ?? {}, "ref")
    // oxlint-enable solid/reactivity
  );

  return {
    focusableProps: mergeProps(
      focus.focusProps,
      merge(() => keyboard.keyboardProps),
      {
        get tabindex(): number | undefined {
          if (isTruthy(props.isDisabled)) {
            return undefined;
          }

          if (isTruthy(props.excludeFromTabOrder)) {
            return -1;
          }

          return 0;
        },
      },
      inherited
    ),
  };
}

export interface FocusableComponentProps extends FocusableOptions {
  children: ElementPropsChild<DOMAttributes>;
  ref?: (element: FocusableElement) => void;
}

export function Focusable(props: FocusableComponentProps): SolidElement {
  const [ref, setRef] = createSignal<FocusableElement | null>(null, {
    ownedWrite: true,
  });

  const aria = createFocusable(props, ref);

  return (
    <ElementProps
      value={mergeProps(aria.focusableProps, {
        ref: (element: FocusableElement) => {
          setRef(element);
          props.ref?.(element);
        },
      })}
      ref={(element) => {
        setRef(element);
      }}
    >
      {props.children}
    </ElementProps>
  );
}
