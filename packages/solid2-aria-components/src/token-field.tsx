/*
 * Copyright 2026 Adobe. All rights reserved.
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
 * Derived from Adobe React Spectrum: packages/react-aria-components/src/TokenField.tsx.
 * Modified for Solid Aria: adapted collection ownership, contexts, accessibility primitives, and reactive properties for Solid 2; uses Solid class props.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { createIsHidden } from "@solid2-aria/core/collections/hidden";
import { createFocusRing } from "@solid2-aria/core/focus/create-focus-ring";
import { createHover } from "@solid2-aria/core/interactions/create-hover";
import type { HoverProps } from "@solid2-aria/core/interactions/create-hover";
import { createToken } from "@solid2-aria/core/tokenfield/create-token";
import { createTokenField } from "@solid2-aria/core/tokenfield/create-token-field";
import type {
  AriaTokenFieldProps,
  TokenFieldAria,
} from "@solid2-aria/core/tokenfield/create-token-field";
import { filterDOMProps } from "@solid2-aria/core/utils/filter-dom-props";
import { mergeProps } from "@solid2-aria/core/utils/merge-props";
import { readProperty } from "@solid2-aria/core/utils/read-property";
import { isTruthy } from "@solid2-aria/core/utils/truthy";
import { createTokenFieldState } from "@solid2-aria/stately/tokenfield/create-token-field-state";
import type { TokenFieldState } from "@solid2-aria/stately/tokenfield/create-token-field-state";
import type {
  TokenFieldValue,
  TokenSegment,
} from "@solid2-aria/stately/tokenfield/token-field-value";
import type { GlobalDOMAttributes } from "@solid2-aria/types-shared-web";
import type { JSX } from "@solidjs/web";
import {
  untrack,
  createSignal,
  createContext,
  createMemo,
  useContext,
  omit,
  merge,
  onSettled,
  For,
} from "solid-js";
import type { Accessor } from "solid-js";

import { FieldInputContext } from "./autocomplete";
import { LabelContext } from "./label";
import { TextContext } from "./text";
import {
  dom,
  createContextProps,
  createRenderProps,
  createSlot,
  createSlottedContext,
  assignRef,
} from "./utils";
import type {
  Ref,
  ClassOrFunction,
  RenderProps,
  SlotProps,
  StyleRenderProps,
  ContextValue,
} from "./utils";

export const TokenFieldContext =
  createContext<ContextValue<TokenFieldProps, HTMLDivElement>>(null);

const TokenInputContext = createContext<TokenInputContextValue | null>(null);

export interface TokenFieldRenderProps {
  /**
   * Whether the token field is disabled.
   *
   * @selector [data-disabled]
   */
  isDisabled: boolean;
  /**
   * Whether the token field is read only.
   *
   * @selector [data-readonly]
   */
  isReadOnly: boolean;
}

export type TokenFieldProps<T extends TokenFieldValue = TokenFieldValue> =
  AriaTokenFieldProps<T> &
    RenderProps<TokenFieldRenderProps> &
    SlotProps &
    GlobalDOMAttributes<HTMLDivElement> & {
      /**
       * The CSS [class](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/class) for the
       * element. A function may be provided to compute the class based on component state.
       *
       * @default 'react-aria-TokenField'
       */
      class?: ClassOrFunction<TokenFieldRenderProps>;
    };

export interface TokenInputRenderProps {
  /**
   * Whether the token input is currently hovered with a mouse.
   *
   * @selector [data-hovered]
   */
  isHovered: boolean;
  /**
   * Whether the token input is focused, either via a mouse or keyboard.
   *
   * @selector [data-focused]
   */
  isFocused: boolean;
  /**
   * Whether the token input is keyboard focused.
   *
   * @selector [data-focus-visible]
   */
  isFocusVisible: boolean;
  /**
   * Whether the token input is disabled.
   *
   * @selector [data-disabled]
   */
  isDisabled: boolean;
  /**
   * Whether the token input is read only.
   *
   * @selector [data-readonly]
   */
  isReadOnly: boolean;
}

export interface TokenInputProps<T extends TokenFieldValue = TokenFieldValue>
  extends
    HoverProps,
    StyleRenderProps<TokenInputRenderProps>,
    SlotProps,
    GlobalDOMAttributes<HTMLDivElement> {
  /**
   * A function that renders a token for each segment in the token field.
   */
  children: (
    segment: TokenSegment<T extends TokenFieldValue<infer V> ? V : never>
  ) => JSX.Element;
  /**
   * The CSS [class](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/class) for the
   * element. A function may be provided to compute the class based on component state.
   *
   * @default 'react-aria-TokenInput'
   */
  class?: ClassOrFunction<TokenInputRenderProps>;
}

export interface TokenRenderProps {
  /**
   * Whether the token is selected.
   *
   * @selector [data-selected]
   */
  isSelected: boolean;
  /**
   * Whether the token is disabled.
   *
   * @selector [data-disabled]
   */
  isDisabled: boolean;
}

export interface TokenProps
  extends
    RenderProps<TokenRenderProps, "span">,
    GlobalDOMAttributes<HTMLSpanElement> {
  /**
   * The CSS [class](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/class) for the
   * element. A function may be provided to compute the class based on component state.
   *
   * @default 'react-aria-Token'
   */
  class?: ClassOrFunction<TokenRenderProps>;
}

interface TokenInputContextValue {
  state: TokenFieldState;
  aria: TokenFieldAria;
  isDisabled: boolean;
  isReadOnly: boolean;
  inputRef: Accessor<HTMLDivElement | null>;
  setInputRef: (element: HTMLDivElement) => void;
}

export function TokenField<T extends TokenFieldValue = TokenFieldValue>(
  input: TokenFieldProps<T> & { ref?: Ref<HTMLDivElement> }
): JSX.Element {
  if (createIsHidden()) {
    // oxlint-disable-next-line solid/components-return-once -- Static collection traversal and context registration are fixed when the owner is created.
    return null;
  }

  const [props, , setRef] = createContextProps(
    input,
    untrack(() => input.ref),
    TokenFieldContext
  );

  const field = createSlottedContext(FieldInputContext, props.slot);

  const [inputRef, setInputRef] = createSignal<HTMLDivElement | null>(null, {
    ownedWrite: true,
  });

  const [registerLabel, label] = createSlot(
    () => !isTruthy(props["aria-label"]) && !isTruthy(props["aria-labelledby"])
  );

  const stateProps = new Proxy(props, {
    get(target, key) {
      if (key === "onChange") {
        return (value: T) => {
          props.onChange?.(value);
          field?.onChange?.(value.toString());
        };
      }

      return readProperty(target, key);
    },
  });

  const state = createTokenFieldState<T>(stateProps);
  // Context and the accessibility adapter erase T, while all updates use the value object's subtype-preserving methods.
  // SAFETY: TokenFieldValue edits preserve the concrete value subtype, and this context belongs to the same owner.
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion, anti-slop/no-chained-type-assertions -- The accessibility adapter uses the base TokenFieldValue contract.
  const baseState = state as unknown as TokenFieldState;

  const ariaProps = new Proxy(props, {
    get(target, key) {
      if (key === "label") {
        return label();
      }

      if (key === "role") {
        return props.role ?? "textbox";
      }

      return readProperty(target, key);
    },
  });

  const aria = createTokenField<T>(ariaProps, baseState, inputRef);

  const values: TokenFieldRenderProps = {
    get isDisabled() {
      return props.isDisabled === true;
    },
    get isReadOnly() {
      return props.isReadOnly === true;
    },
  };

  const render = createRenderProps<TokenFieldRenderProps>(
    merge(props, { defaultClass: "solid2-aria-TokenField", values })
  );

  return (
    <dom.div
      {...filterDOMProps(props, { global: true })}
      {...render}
      ref={(element: HTMLDivElement) => {
        setRef(element);
      }}
      slot={props.slot ?? undefined}
      data-disabled={values.isDisabled || undefined}
      data-readonly={values.isReadOnly || undefined}
    >
      <LabelContext
        value={mergeProps(
          merge(() => aria.labelProps ?? {}),
          {
            get elementType(): "span" {
              return "span";
            },
            registerSlot: registerLabel,
          }
        )}
      >
        <TextContext
          value={{
            slots: {
              get description() {
                return aria.descriptionProps;
              },
            },
          }}
        >
          <TokenInputContext
            value={{
              aria,
              inputRef,
              get isDisabled() {
                return values.isDisabled;
              },
              get isReadOnly() {
                return values.isReadOnly;
              },
              setInputRef: (element: HTMLDivElement) => {
                setInputRef(element);
              },
              state: baseState,
            }}
          >
            {render.children}
          </TokenInputContext>
        </TextContext>
      </LabelContext>
    </dom.div>
  );
}

export function TokenInput<T extends TokenFieldValue = TokenFieldValue>(
  props: TokenInputProps<T> & { ref?: Ref<HTMLDivElement> }
): JSX.Element {
  const context = useContext(TokenInputContext);

  if (!context) {
    throw new Error("TokenInput must be rendered in a TokenField.");
  }

  const hover = createHover(
    mergeProps(props, {
      get isDisabled() {
        return context.isDisabled;
      },
    })
  );

  const focus = createFocusRing({ isTextInput: true });

  const field = createSlottedContext(
    FieldInputContext,
    untrack(() => props.slot)
  );

  const values: TokenInputRenderProps = {
    get isDisabled() {
      return context.isDisabled;
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
    get isReadOnly() {
      return context.isReadOnly;
    },
  };

  const render = createRenderProps(
    mergeProps(omit(props, "children"), {
      defaultClass: "solid2-aria-TokenInput",
      values,
    })
  );

  let previousSegments = untrack(() => context.state.value.segments);

  const segments = createMemo(() => {
    if (!context.state.isComposing) {
      previousSegments = context.state.value.segments;
    }

    return previousSegments;
  });

  onSettled(() => insertSelectionStyle(context.inputRef()));

  return (
    <dom.div
      {...mergeProps(
        filterDOMProps(props, { global: true }),
        render,
        merge(() => focus.focusProps ?? {}),
        merge(() => hover.hoverProps ?? {}),
        merge(() => context.aria.tokenFieldProps ?? {}),
        field
          ? // oxlint-disable solid/reactivity -- Keep prop filtering in the renderer's lazy evaluation.
            omit(field, "ref", "value", "onChange")
          : // oxlint-enable solid/reactivity
            undefined
      )}
      ref={(el: HTMLDivElement) => {
        context.setInputRef(el);

        assignRef(
          untrack(() => props.ref),
          el
        );
        assignRef(
          untrack(() => field?.ref),
          el
        );
      }}
      slot={props.slot ?? undefined}
      data-focused={focus.isFocused || undefined}
      data-focus-visible={focus.isFocusVisible || undefined}
      data-hovered={hover.isHovered || undefined}
      data-disabled={values.isDisabled || undefined}
      data-readonly={values.isReadOnly || undefined}
    >
      <For each={segments()}>
        {(segment) =>
          segment.type === "text" ? (
            segment.text
          ) : (
            <span data-react-aria-token>
              {"\u200B"}
              {props.children(
                // SAFETY: The token segments come from this TokenFieldValue<T> owner's value.
                // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The shared context erases the concrete token value type.
                segment as TokenSegment<
                  T extends TokenFieldValue<infer V> ? V : never
                >
              )}
              {"\u200B"}
            </span>
          )
        }
      </For>
      {segments().at(-1)?.text.endsWith("\n") === true ? <br /> : null}
    </dom.div>
  );
}

export function Token(
  props: TokenProps & { ref?: Ref<HTMLSpanElement> }
): JSX.Element {
  const context = useContext(TokenInputContext);

  if (!context) {
    throw new Error("Token must be rendered in a TokenInput.");
  }

  const [ref, setRef] = createSignal<HTMLSpanElement | null>(null, {
    ownedWrite: true,
  });

  const aria = createToken({}, context.state, ref);

  const values: TokenRenderProps = {
    get isDisabled() {
      return context.isDisabled;
    },
    get isSelected() {
      return aria.isSelected;
    },
  };

  const render = createRenderProps(
    mergeProps(props, { defaultClass: "solid2-aria-Token", values })
  );

  return (
    <dom.span
      {...mergeProps(
        filterDOMProps(props, { global: true }),
        render,
        merge(() => aria.tokenProps ?? {})
      )}
      ref={[
        (element: HTMLSpanElement) => {
          setRef(element);
        },
        (element: HTMLSpanElement) => {
          assignRef(
            untrack(() => props.ref),
            element
          );
        },
      ]}
      contenteditable="false"
      data-selected={aria.isSelected || undefined}
      data-disabled={context.isDisabled || undefined}
      style={mergeProps(
        typeof render.style === "object" ? render.style : {},
        typeof aria.tokenProps.style === "object" ? aria.tokenProps.style : {}
      )}
    >
      {render.children}
    </dom.span>
  );
}

const tokenSelectionStyles = new WeakMap<
  Document | ShadowRoot,
  { sheet: CSSStyleSheet; users: number }
>();

function insertSelectionStyle(
  element: HTMLDivElement | null
): (() => void) | undefined {
  if (!element || typeof CSSStyleSheet !== "function") {
    return undefined;
  }

  const root = element.getRootNode();

  if (
    (!(root instanceof Document) && !(root instanceof ShadowRoot)) ||
    !isTruthy(root.adoptedStyleSheets)
  ) {
    return undefined;
  }

  let entry = tokenSelectionStyles.get(root);

  if (!entry) {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(
      "[data-react-aria-token]::selection,[data-react-aria-token]>*::selection{background:#ffffff01}"
    );
    entry = { sheet, users: 0 };
    tokenSelectionStyles.set(root, entry);
    root.adoptedStyleSheets = [...root.adoptedStyleSheets, sheet];
  }

  entry.users += 1;

  return () => {
    entry.users -= 1;

    if (entry.users === 0) {
      root.adoptedStyleSheets = root.adoptedStyleSheets.filter(
        (sheet) => sheet !== entry.sheet
      );
      tokenSelectionStyles.delete(root);
    }
  };
}
