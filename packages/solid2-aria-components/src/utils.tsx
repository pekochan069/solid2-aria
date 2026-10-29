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
 * Derived from Adobe React Spectrum: packages/react-aria-components/src/utils.tsx.
 * Modified for Solid Aria: adapted components, contexts, refs, and reactive properties for Solid 2; uses Solid class props.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { CSSProperties } from "@solid2-aria/core/types";
import { mergeProps } from "@solid2-aria/core/utils/merge-props";
import { requireValue } from "@solid2-aria/core/utils/require-value";
import { dynamic } from "@solidjs/web";
import type { JSX } from "@solidjs/web";
import {
  merge,
  createSignal,
  createMemo,
  omit,
  onSettled,
  onCleanup,
  useContext,
  untrack,
} from "solid-js";
import type { Context, Accessor } from "solid-js";

export type Ref<T extends Element> = JSX.Ref<T>;

export function assignRef<T extends Element>(
  ref: Ref<T>,
  element: NoInfer<T> | null
): void {
  if (element === null) {
    return;
  }

  if (Array.isArray(ref)) {
    for (const callback of ref) {
      assignRef(callback, element);
    }
  } else if (typeof ref === "function") {
    ref(element);
  }
}

export const DEFAULT_SLOT = Symbol("default");

export type WithRef<T, E extends Element> = T & {
  ref?: Ref<E>;
  registerSlot?: () => JSX.RefCallback<Element>;
};

export interface SlotProps {
  slot?: string | null | false;
}

export type SlottedContextValue<T> =
  | T
  | { slots?: Record<string | symbol, T> }
  | null
  | undefined;

export type ContextValue<T, E extends Element> = SlottedContextValue<
  WithRef<T, E>
>;

export type ClassOrFunction<T> =
  | JSX.ClassValue
  | ((values: T & { defaultClass: string | undefined }) => JSX.ClassValue);

export type StyleOrFunction<T> =
  | CSSProperties
  | string
  | false
  | ((
      values: T & { defaultStyle: CSSProperties }
    ) => CSSProperties | undefined);

export type ChildrenOrFunction<T> =
  | JSX.Element
  | ((values: T & { defaultChildren: JSX.Element | undefined }) => JSX.Element);

export type DOMRenderFunction<E extends keyof JSX.IntrinsicElements, T> = (
  props: JSX.IntrinsicElements[E],
  values: T
) => JSX.Element;

export interface DOMRenderProps<E extends keyof JSX.IntrinsicElements, T> {
  render?: DOMRenderFunction<E, T>;
}

export interface PossibleLinkDOMRenderProps<
  E extends keyof JSX.IntrinsicElements,
  T,
> {
  render?: (
    props: JSX.IntrinsicElements[E] | JSX.IntrinsicElements["a"],
    values: T
  ) => JSX.Element;
}

export interface StyleProps {
  class?: JSX.ClassValue;
  style?: CSSProperties;
}

export interface DOMProps extends StyleProps {
  id?: string;
  children?: JSX.Element;
  ref?: Ref<HTMLElement>;
}

export interface StyleRenderProps<
  T,
  E extends keyof JSX.IntrinsicElements = "div",
> extends DOMRenderProps<E, T> {
  class?: ClassOrFunction<T>;
  style?: StyleOrFunction<T>;
}

export interface RenderProps<
  T,
  E extends keyof JSX.IntrinsicElements = "div",
> extends StyleRenderProps<T, E> {
  children?: ChildrenOrFunction<T>;
}

export interface RACValidation {
  validationBehavior?: "native" | "aria";
}

export function createSlottedContext<T>(
  context: Context<SlottedContextValue<T>>,
  slot?: string | null | false
): T | null | undefined {
  const value = useContext(context);

  if (slot === null) {
    return null;
  }

  const slots = untrack(() =>
    value !== null &&
    value !== undefined &&
    typeof value === "object" &&
    "slots" in value
      ? value.slots
      : undefined
  );

  if (slots) {
    const key =
      typeof slot === "string" && slot.length > 0 ? slot : DEFAULT_SLOT;

    if (!(key in slots)) {
      throw new Error(
        `${typeof slot === "string" && slot.length > 0 ? `Invalid slot "${slot}".` : "A slot prop is required."} Valid slot names are ${Object.keys(slots).join(", ")}.`
      );
    }

    const current = untrack(() => slots[key]);

    if (
      current !== null &&
      current !== undefined &&
      typeof current === "object"
    ) {
      const read = (): object => {
        const next = slots[key];

        return next !== null && next !== undefined && typeof next === "object"
          ? next
          : {};
      };

      // SAFETY: Every value at this stable slot key has the context's T shape.
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Native merge preserves the slot object properties through lazy reads.
      return merge(read) as T;
    }

    return current;
  }

  // SAFETY: Slotted values were resolved above; the remaining value is the context's T fallback.
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Optional slots are structurally indistinguishable from a plain T value.
  return value as T | null | undefined;
}

export function createContextProps<
  T extends object,
  U extends object,
  C extends Element,
  E extends C = C,
>(
  props: T,
  ref: Ref<E>,
  context: Context<ContextValue<U, C>>
): [T, Accessor<E | null>, (element: E | null) => void] {
  const slot = untrack(() =>
    "slot" in props &&
    (typeof props.slot === "string" ||
      props.slot === null ||
      props.slot === false)
      ? props.slot
      : undefined
  );

  const ctx = createSlottedContext(context, slot);

  const merged = mergeProps(
    ctx
      ? // oxlint-disable solid/reactivity -- Keep prop filtering in the renderer's lazy evaluation.
        omit(ctx, "ref", "registerSlot")
      : // oxlint-enable solid/reactivity
        {},
    props
  );

  const registerSlot = untrack(() => ctx?.registerSlot);
  const slotRef = registerSlot?.();
  const contextRef = untrack(() => ctx?.ref);

  const [element, setElement] = createSignal<E | null>(null, {
    ownedWrite: true,
  });

  const attach = (node: E | null) => {
    setElement(() => node);
    assignRef(ref, node);
    assignRef(contextRef, node);
    assignRef(slotRef, node);
  };

  // SAFETY: Local props provide T's required fields and override contextual defaults.
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- mergeProps preserves all required local prop keys.
  return [merged as T, element, attach];
}

export interface ResolvedRenderProps<
  E extends keyof JSX.IntrinsicElements = "div",
> {
  children: JSX.Element;
  class: JSX.ClassValue;
  "data-rac": string;
  render: ((props: JSX.IntrinsicElements[E]) => JSX.Element) | undefined;
  style: CSSProperties | string | false | undefined;
}

export function createRenderProps<
  T,
  E extends keyof JSX.IntrinsicElements = "div",
>(
  props: RenderProps<T, E> & {
    values: T;
    defaultChildren?: JSX.Element;
    defaultClass?: string;
    defaultStyle?: CSSProperties;
  }
): ResolvedRenderProps<E> {
  const classValue = createMemo(() => {
    const value = props.class;

    return (
      (typeof value === "function"
        ? value({ ...props.values, defaultClass: props.defaultClass })
        : value) ?? props.defaultClass
    );
  });

  const style = createMemo(() => {
    const value =
      typeof props.style === "function"
        ? props.style({
            ...props.values,
            defaultStyle: props.defaultStyle ?? {},
          })
        : props.style;

    if (typeof value === "string" || value === false) {
      return value;
    }

    return value !== undefined || props.defaultStyle !== undefined
      ? { ...props.defaultStyle, ...value }
      : undefined;
  });

  const readContent = (): JSX.Element => {
    const child = props.children;

    if (typeof child === "function") {
      if (child.length === 0) {
        return untrack(() =>
          child({ ...props.values, defaultChildren: props.defaultChildren })
        );
      }

      // SAFETY: Render state is the owner's T value; mergeProps adds only the lazy defaultChildren property.
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Generic state and its lazy default are combined at the render callback boundary.
      const values = mergeProps(
        typeof props.values === "object" && props.values !== null
          ? props.values
          : {},
        {
          get defaultChildren() {
            return props.defaultChildren;
          },
        }
      ) as T & { defaultChildren: JSX.Element | undefined };

      return child(values);
    }

    return child ?? props.defaultChildren;
  };

  return {
    get children() {
      return readContent();
    },
    get class() {
      return classValue();
    },
    "data-rac": "",
    get render() {
      return props.render
        ? // oxlint-disable-next-line solid/reactivity -- The returned callback runs in its consumer's scope.
          (domProps: JSX.IntrinsicElements[E]) =>
            requireValue(props.render, "Expected props.render")(
              domProps,
              props.values
            )
        : undefined;
    },
    get style() {
      return style();
    },
  };
}

export function composeRenderProps<T, U, V extends T>(
  value: T | ((values: U) => V),
  wrap: (previous: T, values: U) => V
): (values: U) => V {
  return (values) => {
    if (typeof value !== "function") {
      return wrap(value, values);
    }

    // SAFETY: Function values are render callbacks by this API's contract.
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- T may itself be callable, so typeof cannot eliminate the generic branch.
    const render = value as (values: U) => V;

    return wrap(render(values), values);
  };
}

export function createSlot(
  initial: boolean | (() => boolean) = true
): [() => JSX.RefCallback<Element>, Accessor<boolean>] {
  const [present, setPresent] = createSignal(
    untrack(() => (typeof initial === "function" ? initial() : initial)),
    { ownedWrite: true }
  );

  const elements = new Set<Element>();

  const register = () => {
    let current: Element | undefined;

    // Registration runs in the slotted child's owner; DOM ref callbacks are unowned.
    onCleanup(() => {
      if (current) {
        elements.delete(current);
      }

      setPresent(elements.size > 0);
    });

    return (element: Element) => {
      if (current) {
        elements.delete(current);
      }

      current = element;
      elements.add(element);
      setPresent(true);
    };
  };

  onSettled(() => {
    if (elements.size === 0) {
      setPresent(false);
    }
  });

  return [register, present];
}

export function removeDataAttributes<T extends object>(props: T): T {
  // SAFETY: Only optional data attributes are omitted; the component's required props remain.
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The predicate filters extension attributes outside the declared component contract.
  return omit(
    props,
    (key) => typeof key === "string" && key.startsWith("data-")
  ) as T;
}

type DOMComponents = {
  [E in keyof JSX.IntrinsicElements]: (
    props: Omit<JSX.IntrinsicElements[E], "ref"> & {
      ref?: Ref<
        E extends keyof HTMLElementTagNameMap
          ? HTMLElementTagNameMap[E]
          : Element
      >;
      render?: (props: JSX.IntrinsicElements[E], values: never) => JSX.Element;
    }
  ) => JSX.Element;
};

interface NativeProps {
  children?: JSX.Element;
  render?: (props: NativeProps) => JSX.Element;
  ref?: Ref<Element>;
  class?: JSX.ClassValue;
}

type NativeComponent = (props: NativeProps) => JSX.Element;

const cache = new Map<string, NativeComponent>();

// SAFETY: Each proxy key creates a native component that forwards the matching tag's attributes and ref.
// oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The mapped intrinsic tag signatures are implemented by the native component factory.
export const dom = new Proxy(
  {},
  {
    get(_target, key): NativeComponent | undefined {
      if (typeof key !== "string") {
        return undefined;
      }

      let component = cache.get(key);

      if (!component) {
        // SAFETY: Consumers index dom with keyof JSX.IntrinsicElements, including renderer-supported custom tags.
        // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Proxy handler keys lose the public mapped type's intrinsic tag constraint.
        const tag = key as keyof JSX.IntrinsicElements;

        const NativeElement = dynamic(() => tag, { static: true });

        component = (props: NativeProps) => {
          const ref = untrack(() => props.ref);

          const forwarded = mergeProps(omit(props, "render", "ref"), {
            ref(element: Element) {
              assignRef(ref, element);
            },
          });

          const render = untrack(() => props.render);

          // oxlint-disable-next-line solid/components-return-once -- The render callback is selected once for this DOM owner.
          return render ? (
            <>{render(forwarded)}</>
          ) : (
            <NativeElement
              {
                // oxlint-disable solid/reactivity -- Keep prop filtering in the renderer's lazy evaluation.
                ...omit(forwarded, "children")
                // oxlint-enable solid/reactivity
              }
            >
              {forwarded.children}
            </NativeElement>
          );
        };

        cache.set(key, component);
      }

      return component;
    },
  }
) as DOMComponents;

export function domElement(
  tag: keyof JSX.IntrinsicElements
): DOMComponents["div"] {
  // SAFETY: Polymorphic components use shared HTML attributes; the chosen tag owns its native behavior.
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Dynamic intrinsic unions do not expose a common callable signature.
  return dom[tag] as DOMComponents["div"];
}
