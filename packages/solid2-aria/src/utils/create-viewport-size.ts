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
 * Derived from Adobe React Spectrum: packages/react-aria/src/utils/useViewportSize.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { createSignal, onSettled } from "solid-js";

import { requireElement } from "./dom-value";
import { willOpenKeyboard } from "./keyboard";
import { isIOS, isWebKit } from "./platform";
import { runAfterKeyboard } from "./run-after-keyboard";
import { getEventTarget } from "./shadowdom/dom-functions";
import { isTruthy } from "./truthy";

interface ViewportSize {
  width: number;
  height: number;
}

const visualViewport = typeof document !== "undefined" && window.visualViewport;

export function createViewportSize(): ViewportSize {
  let unmountRef: (() => void) | null = null;

  const [size, setSize] = createSignal(
    { height: 0, width: 0 },
    { ownedWrite: true }
  );

  const updateSize = (newSize: ViewportSize) => {
    setSize((sizeValue) => {
      if (
        newSize.width === sizeValue.width &&
        newSize.height === sizeValue.height
      ) {
        return sizeValue;
      }

      return newSize;
    });
  };

  onSettled(() => {
    // Use visualViewport api to track available height even on iOS virtual keyboard opening
    const onResize = () => {
      // Ignore updates when zoomed.
      if (isTruthy(visualViewport) && visualViewport.scale > 1) {
        return;
      }

      updateSize(getViewportSize());
    };

    // When closing the keyboard, WebKit on iOS does not fire the visual viewport resize event until the animation is complete.
    // We can anticipate this and resize early by handling the blur event and using the layout size.
    const onBlur = (e: FocusEvent) => {
      if (isTruthy(visualViewport) && visualViewport.scale > 1) {
        return;
      }

      if (!willOpenKeyboard(requireElement(getEventTarget(e)))) {
        return;
      }

      unmountRef = runAfterKeyboard((isOpen) => {
        if (isOpen) {
          return;
        }

        updateSize({
          height: document.documentElement.clientHeight,
          width: document.documentElement.clientWidth,
        });
      });
    };

    updateSize(getViewportSize());

    if (isIOS() && isWebKit()) {
      window.addEventListener("blur", onBlur, true);
    }

    if (isTruthy(visualViewport)) {
      visualViewport.addEventListener("resize", onResize);
    } else {
      window.addEventListener("resize", onResize);
    }

    return () => {
      unmountRef?.();

      if (isIOS() && isWebKit()) {
        window.removeEventListener("blur", onBlur, true);
      }

      if (isTruthy(visualViewport)) {
        visualViewport.removeEventListener("resize", onResize);
      } else {
        window.removeEventListener("resize", onResize);
      }
    };
  });

  return {
    get height() {
      return size().height;
    },
    get width() {
      return size().width;
    },
  };
}

/**
 * Get the viewport size without the scrollbar.
 */
function getViewportSize(): ViewportSize {
  // The visual viewport width may include the scrollbar gutter. We should use the minimum width between
  // the visual viewport and the document element to ensure that the scrollbar width is always excluded.
  // Multiply by the visualViewport scale to get the "natural" size, unaffected by pinch zooming.
  // See: https://github.com/w3c/csswg-drafts/issues/8099
  return {
    height: isTruthy(visualViewport)
      ? visualViewport.height * visualViewport.scale
      : document.documentElement.clientHeight,
    width: isTruthy(visualViewport)
      ? Math.min(
          visualViewport.width * visualViewport.scale,
          document.documentElement.clientWidth
        )
      : document.documentElement.clientWidth,
  };
}
