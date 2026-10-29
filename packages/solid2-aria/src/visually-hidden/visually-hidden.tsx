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
 * Derived from Adobe React Spectrum: packages/react-aria/src/visually-hidden/VisuallyHidden.tsx.
 * Modified for Solid Aria: adapted components, imports, and reactive lifecycle for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { DOMAttributes } from "@solid2-aria/types-shared-web";
import { dynamic } from "@solidjs/web";
import type { ValidComponent } from "@solidjs/web";
import { createSignal, omit } from "solid-js";
import type { Element as SolidElement } from "solid-js";

import { createFocusWithin } from "../interactions/create-focus-within";
import type { CSSProperties } from "../types";
import { mergeProps } from "../utils/merge-props";
import { isTruthy } from "../utils/truthy";

export interface VisuallyHiddenProps extends DOMAttributes {
  style?: CSSProperties;
  children?: SolidElement;
  elementType?: ValidComponent;
  isFocusable?: boolean;
}

const styles: CSSProperties = {
  border: 0,
  // oxlint-disable-next-line typescript/no-deprecated -- Keep the legacy clipping fallback for browser and assistive technology combinations that require it.
  clip: "rect(0 0 0 0)",
  "clip-path": "inset(50%)",
  height: "1px",
  margin: "-1px",
  overflow: "hidden",
  padding: 0,
  position: "absolute",
  "white-space": "nowrap",
  width: "1px",
};

export interface VisuallyHiddenAria {
  visuallyHiddenProps: DOMAttributes & { style?: CSSProperties };
}

export function createVisuallyHidden(
  props: VisuallyHiddenProps = {}
): VisuallyHiddenAria {
  const [isFocused, setFocused] = createSignal(false);

  const focus = createFocusWithin({
    get isDisabled() {
      return !isTruthy(props.isFocusable);
    },
    onFocusWithinChange: (value) => {
      setFocused(value);
    },
  });

  return {
    visuallyHiddenProps: mergeProps(focus.focusWithinProps, {
      get style() {
        return isFocused() ? props.style : { ...styles, ...props.style };
      },
    }),
  };
}

export function VisuallyHidden(props: VisuallyHiddenProps): SolidElement {
  const aria = createVisuallyHidden(props);
  const HiddenElement = dynamic(() => props.elementType ?? "div");

  return (
    <HiddenElement
      {...mergeProps(
        omit(props, "children", "elementType", "isFocusable", "style"),
        aria.visuallyHiddenProps
      )}
    >
      {props.children}
    </HiddenElement>
  );
}
