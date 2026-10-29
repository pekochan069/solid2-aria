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
 * Derived from Adobe React Spectrum: packages/react-aria/src/overlays/Overlay.tsx.
 * Modified for Solid Aria: adapted components, imports, and reactive lifecycle for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { Portal } from "@solidjs/web";
import {
  createContext,
  createMemo,
  createSignal,
  onSettled,
  Show,
  useContext,
} from "solid-js";
import type { Element as SolidElement, Setter } from "solid-js";

import { FocusScope } from "../focus/focus-scope";
import { FocusableContext } from "../interactions/create-focusable";
import { ClearPressResponder } from "../interactions/press-responder";
import { getTruthyValue, isTruthy, whenTruthy } from "../utils/truthy";
import { createUNSAFE_PortalContext } from "./portal-provider";

export interface OverlayProps {
  portalContainer?: Element;
  children?: SolidElement;
  disableFocusManagement?: boolean;
  shouldContainFocus?: boolean;
  isExiting?: boolean;
}

export const OverlayContext = createContext<{
  contain: boolean;
  setContain: Setter<boolean>;
} | null>(null);

export function Overlay(props: OverlayProps): SolidElement {
  const [mounted, setMounted] = createSignal(false);
  onSettled(() => {
    setMounted(true);
  });
  const portal = createUNSAFE_PortalContext();
  const [contain, setContain] = createSignal(false);

  const value = {
    get contain() {
      return contain();
    },
    setContain,
  };

  const container = createMemo(
    () =>
      props.portalContainer ??
      portal.getContainer?.() ??
      (mounted() ? document.body : null)
  );

  return (
    <Show when={container()}>
      {(mount) => (
        <Portal mount={mount()}>
          <OverlayContext value={value}>
            <ClearPressResponder>
              <FocusableContext value={null}>
                {isTruthy(props.disableFocusManagement) ? (
                  props.children
                ) : (
                  <FocusScope
                    restoreFocus
                    contain={whenTruthy(
                      getTruthyValue(props.shouldContainFocus) ?? contain(),
                      () => !isTruthy(props.isExiting)
                    )}
                  >
                    {props.children}
                  </FocusScope>
                )}
              </FocusableContext>
            </ClearPressResponder>
          </OverlayContext>
        </Portal>
      )}
    </Show>
  );
}

export function createOverlayFocusContain(): void {
  const context = useContext(OverlayContext);
  onSettled(() => {
    context?.setContain(true);
  });
}
