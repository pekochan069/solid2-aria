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
 * Derived from Adobe React Spectrum: packages/react-aria-components/src/Button.tsx.
 * Modified for Solid Aria: adapted components, contexts, refs, and reactive properties for Solid 2; uses Solid class props.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { createButton } from "@solid2-aria/core/button/create-button";
import type { AriaButtonProps } from "@solid2-aria/core/button/create-button";
import { createIsHidden } from "@solid2-aria/core/collections/hidden";
import { createFocusRing } from "@solid2-aria/core/focus/create-focus-ring";
import { createHover } from "@solid2-aria/core/interactions/create-hover";
import { announce } from "@solid2-aria/core/live-announcer/live-announcer";
import { filterDOMProps } from "@solid2-aria/core/utils/filter-dom-props";
import { mergeProps } from "@solid2-aria/core/utils/merge-props";
import { readProperty } from "@solid2-aria/core/utils/read-property";
import { isTruthy } from "@solid2-aria/core/utils/truthy";
import type { HoverEvents } from "@solid2-aria/types-shared";
import type { JSX } from "@solidjs/web";
import {
  merge,
  untrack,
  createContext,
  createEffect,
  createUniqueId,
  omit,
} from "solid-js";

import { ProgressBarContext } from "./progress-bar";
import { dom, createContextProps, createRenderProps } from "./utils";
import type { Ref, ContextValue, SlotProps, RenderProps } from "./utils";

export interface ButtonRenderProps {
  isHovered: boolean;
  isPressed: boolean;
  isFocused: boolean;
  isFocusVisible: boolean;
  isDisabled: boolean;
  isPending: boolean;
}

export interface ButtonProps
  extends
    Omit<AriaButtonProps, "children" | "elementType">,
    HoverEvents,
    SlotProps,
    RenderProps<ButtonRenderProps, "button"> {
  isPending?: boolean;
  isPressed?: boolean;
  ref?: Ref<HTMLButtonElement>;
}

export const ButtonContext =
  createContext<ContextValue<ButtonProps, HTMLButtonElement>>(null);

export function Button(input: ButtonProps): JSX.Element {
  if (createIsHidden()) {
    // oxlint-disable-next-line solid/components-return-once -- Static collection traversal and context registration are fixed when the owner is created.
    return null;
  }

  const [props, ref, setRef] = createContextProps(
    input,
    untrack(() => input.ref),
    ButtonContext
  );

  const aria = createButton(props, ref);
  const focus = createFocusRing(props);

  const hover = createHover(
    mergeProps(props, {
      get isDisabled() {
        return props.isDisabled === true || props.isPending === true;
      },
    })
  );

  const values: ButtonRenderProps = {
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
    get isPending() {
      return props.isPending === true;
    },
    get isPressed() {
      return (
        (props.isPressed === true || aria.isPressed) &&
        !(props.isPending === true)
      );
    },
  };

  const render = createRenderProps(
    mergeProps(props, { defaultClass: "solid2-aria-Button", values })
  );

  const id = createUniqueId();
  const progressId = createUniqueId();

  const label = () => {
    const labelledBy = aria.buttonProps["aria-labelledby"];

    if (props.isPending !== true) {
      return labelledBy;
    }

    if (isTruthy(labelledBy)) {
      return `${labelledBy} ${progressId}`;
    }

    return isTruthy(aria.buttonProps["aria-label"])
      ? `${aria.buttonProps.id ?? id} ${progressId}`
      : undefined;
  };

  createEffect(
    () => ({
      focused: focus.isFocused,
      label: label(),
      pending: props.isPending,
    }),
    (next, prev) => {
      if (prev && next.pending !== prev.pending && next.focused) {
        const buttonId =
          typeof aria.buttonProps.id === "string" ? aria.buttonProps.id : id;

        const labelledBy =
          typeof next.label === "string" && next.label.length > 0
            ? next.label
            : buttonId;

        announce({ "aria-labelledby": labelledBy }, "assertive");
      }
    }
  );

  const interaction = new Proxy(
    {},
    {
      get(target, key): ReturnType<typeof readProperty> {
        if (
          props.isPending === true &&
          typeof key === "string" &&
          key.startsWith("on") &&
          !/Focus|Blur|Hover|Pointer(?:Enter|Leave|Over|Out)|Mouse(?:Enter|Leave|Over|Out)/u.test(
            key
          )
        ) {
          return undefined;
        }

        return readProperty(aria.buttonProps, key);
      },
      getOwnPropertyDescriptor() {
        return { configurable: true, enumerable: true };
      },
      has(_target, key) {
        return key in aria.buttonProps;
      },
      ownKeys() {
        return Reflect.ownKeys(aria.buttonProps);
      },
    }
  );

  return (
    <dom.button
      {...mergeProps(
        omit(filterDOMProps(props, { global: true }), "onClick"),
        interaction,
        merge(() => focus.focusProps ?? {}),
        merge(() => hover.hoverProps ?? {}),
        render
      )}
      id={aria.buttonProps.id ?? id}
      type={
        props.isPending === true && props.type === "submit"
          ? "button"
          : (props.type ?? "button")
      }
      ref={(element: HTMLButtonElement) => {
        setRef(element);
      }}
      aria-labelledby={label()}
      aria-disabled={
        props.isPending === true ? "true" : aria.buttonProps["aria-disabled"]
      }
      slot={props.slot ?? undefined}
      data-disabled={props.isDisabled ?? undefined}
      data-pending={props.isPending ?? undefined}
      data-pressed={values.isPressed || undefined}
      data-focused={focus.isFocused || undefined}
      data-hovered={hover.isHovered || undefined}
      data-focus-visible={focus.isFocusVisible || undefined}
    >
      <ProgressBarContext value={{ id: progressId }}>
        {render.children}
      </ProgressBarContext>
    </dom.button>
  );
}
