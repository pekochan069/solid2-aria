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
 * Derived from Adobe React Spectrum: packages/react-aria-components/src/Modal.tsx.
 * Modified for Solid Aria: adapted components, contexts, refs, and reactive properties for Solid 2; release detached modal refs so each opening animates its mounted content; uses Solid class props.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { createModalOverlay } from "@solid2-aria/core/overlays/create-modal-overlay";
import type { AriaModalOverlayProps } from "@solid2-aria/core/overlays/create-modal-overlay";
import { DismissButton } from "@solid2-aria/core/overlays/dismiss-button";
import { Overlay } from "@solid2-aria/core/overlays/overlay";
import {
  createEnterAnimation,
  createExitAnimation,
} from "@solid2-aria/core/utils/animation";
import { filterDOMProps } from "@solid2-aria/core/utils/filter-dom-props";
import { mergeProps } from "@solid2-aria/core/utils/merge-props";
import { requireValue } from "@solid2-aria/core/utils/require-value";
import { createOverlayTriggerState } from "@solid2-aria/stately/overlays/create-overlay-trigger-state";
import type {
  OverlayTriggerProps,
  OverlayTriggerState,
} from "@solid2-aria/stately/overlays/create-overlay-trigger-state";
import type { JSX } from "@solidjs/web";
import {
  merge,
  createSignal,
  createContext,
  Show,
  useContext,
  untrack,
  omit,
  onSettled,
} from "solid-js";
import type { Accessor } from "solid-js";

import { OverlayTriggerStateContext } from "./dialog";
import { assignRef, dom, createContextProps, createRenderProps } from "./utils";
import type { ContextValue, Ref, RenderProps, SlotProps } from "./utils";

export interface ModalRenderProps {
  isEntering: boolean;
  isExiting: boolean;
  state: OverlayTriggerState;
}

export interface ModalOverlayProps
  extends
    AriaModalOverlayProps,
    OverlayTriggerProps,
    RenderProps<ModalRenderProps>,
    SlotProps {
  ref?: Ref<HTMLDivElement>;
  isEntering?: boolean;
  isExiting?: boolean;
  onEnter?: (element: HTMLElement) => void | Promise<void>;
  onExit?: (element: HTMLElement) => void | Promise<void>;
  UNSTABLE_portalContainer?: Element;
  UNSTABLE_deferUntilEntered?: boolean;
}

export const ModalContext =
  createContext<ContextValue<ModalOverlayProps, HTMLDivElement>>(null);

interface InternalModalContextValue {
  modalProps: JSX.HTMLAttributes<HTMLElement>;
  modalRef: Accessor<HTMLDivElement | null>;
  setModalRef: (element: HTMLDivElement | null) => void;
  values: ModalRenderProps;
  isDismissable?: boolean;
}

export const InternalModalContext =
  createContext<InternalModalContextValue | null>(null);

export function Modal(input: ModalOverlayProps): JSX.Element {
  const context = useContext(InternalModalContext);

  if (context) {
    // oxlint-disable-next-line solid/components-return-once -- Static collection traversal and context registration are fixed when the owner is created.
    return <ModalContent {...input} />;
  }

  return (
    <ModalOverlay
      {
        // oxlint-disable solid/reactivity -- Keep prop filtering in the renderer's lazy evaluation.
        ...omit(input, "children", "ref", "class", "style", "render")
        // oxlint-enable solid/reactivity
      }
    >
      <ModalContent {...input} />
    </ModalOverlay>
  );
}

function ModalContent(props: ModalOverlayProps): JSX.Element {
  const context = useContext(InternalModalContext);

  if (!context) {
    throw new Error("Modal requires ModalOverlay");
  }

  const render = createRenderProps(
    mergeProps(props, {
      defaultClass: "solid2-aria-Modal",
      get values() {
        return context.values;
      },
    })
  );

  return (
    <dom.div
      {...mergeProps(
        filterDOMProps(props, { global: true }),
        merge(() => context.modalProps ?? {}),
        render
      )}
      ref={[
        (element: HTMLDivElement) => {
          context.setModalRef(element);
        },
        (element: HTMLDivElement) => {
          assignRef(
            untrack(() => props.ref),
            element
          );
        },
      ]}
      data-entering={context.values.isEntering || undefined}
      data-exiting={context.values.isExiting || undefined}
    >
      {context.isDismissable === true && (
        <DismissButton onDismiss={context.values.state.close} />
      )}
      {render.children}
      <DismissButton onDismiss={context.values.state.close} />
    </dom.div>
  );
}

export function ModalOverlay(input: ModalOverlayProps): JSX.Element {
  const [props, overlayRef, setOverlayRef] = createContextProps(
    input,
    untrack(() => input.ref),
    ModalContext
  );

  const context = useContext(OverlayTriggerStateContext);
  const local = createOverlayTriggerState(props);

  const state = untrack(
    () =>
      props.isOpen !== undefined || props.defaultOpen !== undefined || !context
  )
    ? local
    : requireValue(context, "Expected context");

  const [modalRef, setModalRef] = createSignal<HTMLDivElement | null>(null, {
    ownedWrite: true,
  });

  const exiting = createExitAnimation(
    modalRef,
    () => state.isOpen,
    (element): void | Promise<void> => untrack(() => props.onExit)?.(element)
  );

  return (
    <Show when={state.isOpen || exiting() || props.isExiting}>
      <Overlay
        portalContainer={props.UNSTABLE_portalContainer}
        isExiting={exiting() || props.isExiting}
        shouldContainFocus
      >
        <ModalOverlayInner
          props={props}
          overlayRef={overlayRef}
          setOverlayRef={(element: HTMLDivElement) => {
            setOverlayRef(element);
          }}
          modalRef={modalRef}
          setModalRef={(element: HTMLDivElement | null) => {
            setModalRef(element);
          }}
          state={state}
          exiting={exiting}
        />
      </Overlay>
    </Show>
  );
}

function ModalOverlayInner(args: {
  props: ModalOverlayProps;
  overlayRef: Accessor<HTMLDivElement | null>;
  setOverlayRef: (element: HTMLDivElement) => void;
  modalRef: Accessor<HTMLDivElement | null>;
  setModalRef: (element: HTMLDivElement | null) => void;
  state: OverlayTriggerState;
  exiting: () => boolean;
}): JSX.Element {
  onSettled(() => () => {
    args.setModalRef(null);
  });

  const entering = createEnterAnimation(
    untrack(() => args.modalRef),
    true,
    (element): void | Promise<void> =>
      untrack(() => args.props.onEnter)?.(element)
  );

  const values: ModalRenderProps = {
    get isEntering() {
      return args.props.isEntering === true || entering();
    },
    get isExiting() {
      return args.props.isExiting === true || args.exiting();
    },
    get state() {
      return args.state;
    },
  };

  const aria = createModalOverlay(
    mergeProps(
      merge(() => args.props ?? {}),
      {
        get isEntering() {
          return values.isEntering;
        },
      }
    ),
    untrack(() => args.state),
    untrack(() => args.modalRef)
  );

  const render = createRenderProps(
    mergeProps(
      merge(() => args.props ?? {}),
      {
        defaultClass: "solid2-aria-ModalOverlay",
        values,
      }
    )
  );

  const internal = {
    get isDismissable() {
      return args.props.isDismissable;
    },
    get modalProps() {
      return aria.modalProps;
    },
    get modalRef() {
      return args.modalRef;
    },
    get setModalRef() {
      return args.setModalRef;
    },
    values,
  };

  return (
    <dom.div
      {...mergeProps(
        filterDOMProps(args.props, { global: true }),
        merge(() => aria.underlayProps ?? {}),
        render
      )}
      ref={(element: HTMLDivElement) => {
        args.setOverlayRef(element);
      }}
      data-entering={values.isEntering || undefined}
      data-exiting={values.isExiting || undefined}
    >
      <OverlayTriggerStateContext value={args.state}>
        <InternalModalContext value={internal}>
          {render.children}
        </InternalModalContext>
      </OverlayTriggerStateContext>
    </dom.div>
  );
}
