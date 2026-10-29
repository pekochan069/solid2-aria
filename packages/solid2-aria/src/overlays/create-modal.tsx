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
 * Derived from Adobe React Spectrum: packages/react-aria/src/overlays/useModal.tsx.
 * Modified for Solid Aria: adapted components, imports, and reactive lifecycle for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { DOMAttributes } from "@solid2-aria/types-shared-web";
import { Portal } from "@solidjs/web";
import {
  createContext,
  createEffect,
  createMemo,
  createSignal,
  onSettled,
  omit,
  useContext,
  Show,
} from "solid-js";
import type { Element as SolidElement } from "solid-js";

import type { AriaAttributes } from "../types";
import { requireValue } from "../utils/require-value";
import { isTruthy } from "../utils/truthy";
import { createUNSAFE_PortalContext } from "./portal-provider";

export interface ModalProviderProps extends DOMAttributes {
  children?: SolidElement;
}

interface ModalContextValue {
  parent: ModalContextValue | null;
  modalCount: number;
  addModal: () => void;
  removeModal: () => void;
}

const Context = createContext<ModalContextValue | null>(null);

export function ModalProvider(props: ModalProviderProps): SolidElement {
  const parent = useContext(Context);
  const [modalCount, setModalCount] = createSignal(0);

  const context = {
    addModal() {
      setModalCount((count) => count + 1);
      parent?.addModal();
    },
    get modalCount() {
      return modalCount();
    },
    parent,
    removeModal() {
      setModalCount((count) => count - 1);
      parent?.removeModal();
    },
  };

  return <Context value={context}>{props.children}</Context>;
}

export interface ModalProviderAria {
  modalProviderProps: AriaAttributes;
}

export function createModalProvider(): ModalProviderAria {
  const context = useContext(Context);

  return {
    modalProviderProps: {
      get "aria-hidden"() {
        return context && context.modalCount > 0 ? "true" : undefined;
      },
    },
  };
}

function OverlayContainerDOM(props: ModalProviderProps): SolidElement {
  const aria = createModalProvider();

  return <div data-overlay-container {...props} {...aria.modalProviderProps} />;
}

export function OverlayProvider(props: ModalProviderProps): SolidElement {
  return (
    <ModalProvider>
      <OverlayContainerDOM {...props} />
    </ModalProvider>
  );
}

export interface OverlayContainerProps extends ModalProviderProps {
  portalContainer?: Element;
}

export function OverlayContainer(props: OverlayContainerProps): SolidElement {
  const [mounted, setMounted] = createSignal(false);
  onSettled(() => {
    setMounted(true);
  });
  const portal = createUNSAFE_PortalContext();

  const container = createMemo(
    () =>
      props.portalContainer ??
      portal.getContainer?.() ??
      (mounted() ? document.body : null)
  );

  createEffect(
    container,
    (element) => {
      if (element?.closest("[data-overlay-container]")) {
        throw new Error(
          "An OverlayContainer must not be inside another container. Please change the portalContainer prop."
        );
      }
    },
    { ssrSource: "client" }
  );

  return (
    <Show when={container()}>
      <Portal mount={requireValue(container(), "Expected container()")}>
        <OverlayProvider
          {
            // oxlint-disable solid/reactivity -- Keep prop filtering in the renderer's lazy evaluation.
            ...omit(props, "portalContainer")
            // oxlint-enable solid/reactivity
          }
        />
      </Portal>
    </Show>
  );
}

interface ModalAriaProps extends DOMAttributes {
  "data-ismodal": boolean;
}

export interface AriaModalOptions {
  isDisabled?: boolean;
}

export interface ModalAria {
  modalProps: ModalAriaProps;
}

export function createModal(options: AriaModalOptions = {}): ModalAria {
  const context = useContext(Context);

  if (!context) {
    throw new Error("Modal is not contained within a provider");
  }

  createEffect(
    () => options.isDisabled,
    (disabled): undefined | (() => void) => {
      if (isTruthy(disabled) || !context.parent) {
        return undefined;
      }

      context.parent.addModal();

      return () => context.parent?.removeModal();
    },
    { ssrSource: "client" }
  );

  return {
    modalProps: {
      get "data-ismodal"() {
        return !isTruthy(options.isDisabled);
      },
    },
  };
}
