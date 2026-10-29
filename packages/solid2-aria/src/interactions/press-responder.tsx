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
 * Derived from Adobe React Spectrum: packages/react-aria/src/interactions/PressResponder.tsx.
 * Modified for Solid Aria: adapted components, imports, and reactive lifecycle for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { FocusableElement } from "@solid2-aria/types-shared";
import { omit, onSettled, useContext } from "solid-js";
import type { Element as SolidElement } from "solid-js";

import { mergeProps } from "../utils/merge-props";
import { PressResponderContext } from "./context";
import type { PressProps } from "./create-press";

interface PressResponderProps extends PressProps {
  children?: SolidElement;
  ref?: (element: FocusableElement) => void;
}

export function PressResponder(props: PressResponderProps): SolidElement {
  let registered = false;
  const parent = useContext(PressResponderContext);

  const ref = (element: FocusableElement) => {
    props.ref?.(element);
    parent.ref?.(element);
  };

  const context = mergeProps(
    omit(parent, "ref", "register"),
    omit(props, "children", "ref"),
    {
      ref,
      register() {
        registered = true;
        parent?.register();
      },
    }
  );

  onSettled(() => {
    if (!registered && process.env.NODE_ENV !== "production") {
      console.warn(
        "A PressResponder was rendered without a pressable child. Call createPress, or wrap your DOM node with <Pressable>."
      );
    }
  });

  return (
    <PressResponderContext value={context}>
      {props.children}
    </PressResponderContext>
  );
}

export function ClearPressResponder(props: {
  children?: SolidElement;
}): SolidElement {
  return (
    <PressResponderContext
      value={{
        register() {
          /* empty */
        },
      }}
    >
      {props.children}
    </PressResponderContext>
  );
}
