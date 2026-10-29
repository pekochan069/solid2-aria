import { applyRef, assign } from "@solidjs/web";
import type { Element as SolidElement } from "solid-js";
import {
  children,
  createEffect,
  createMemo,
  createSignal,
  onSettled,
  untrack,
} from "solid-js";

import { isCallable } from "./is-callable";
import { isTruthy } from "./truthy";

export type ElementPropsChild<P> = SolidElement | ((props: P) => SolidElement);

/** Adds behavior to a Solid DOM child without introducing a wrapper element. */
export function ElementProps<P extends object>(props: {
  children: ElementPropsChild<P>;
  value: P;
  ref?: (element: HTMLElement) => void;
}): SolidElement {
  const child = createMemo(() => props.children);
  const initialChild = untrack(child);

  if (typeof initialChild === "function") {
    // oxlint-disable-next-line solid/components-return-once -- Static collection traversal and context registration are fixed when the owner is created.
    return initialChild(untrack(() => props.value));
  }

  const content = children(() => {
    const value = child();

    return typeof value === "function" ? value(props.value) : value;
  });

  const [targetElement, setTargetElement] = createSignal<HTMLElement>();
  const listeners = new Map<string, EventListener>();
  onSettled((): undefined | (() => void) => {
    const nodes = content.toArray();
    const target = nodes.find((node) => node instanceof HTMLElement);

    if (!(target instanceof HTMLElement)) {
      return undefined;
    }

    untrack(() => {
      apply(target, Object.entries(props.value));
    });
    setTargetElement(target);
    props.ref?.(target);

    return () => {
      for (const [name, listener] of listeners) {
        target.removeEventListener(name, listener);
      }
    };
  });

  function apply(element: HTMLElement, entries: [string, unknown][]) {
    for (const [name, value] of entries) {
      if (/^on[A-Z]/u.test(name)) {
        const type = name.slice(2).toLowerCase();
        const previous = listeners.get(type);

        if (previous) {
          element.removeEventListener(type, previous);
        }

        if (isCallable(value)) {
          const listener: EventListener = (event) => {
            value(event);
          };

          listeners.set(type, listener);
          element.addEventListener(type, listener);
        }
      } else if (name === "class" && typeof value === "object" && value) {
        for (const [token, enabled] of Object.entries(value)) {
          if (token) {
            element.classList.toggle(token, isTruthy(enabled));
          }
        }
      } else if (name === "ref") {
        const callbacks = (
          Array.isArray(value) ? value.flat(Infinity) : [value]
        ).filter(isCallable);

        applyRef(callbacks, element);
      } else {
        assign(element, { [name]: value }, true);
      }
    }
  }

  createEffect(
    () => [targetElement(), Object.entries(props.value)] as const,
    ([element, entries]) => {
      if (element) {
        apply(element, entries);
      }
    }
  );

  return <>{content()}</>;
}
