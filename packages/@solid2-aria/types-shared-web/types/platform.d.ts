import type { JSX, ValidComponent } from "@solidjs/web";

export type ElementType = ValidComponent;

export type CSSProperties = JSX.CSSProperties;

export type ClassValue = JSX.ClassValue;

export type AriaAttributes = JSX.AriaAttributes;

export type AriaRole = NonNullable<JSX.HTMLAttributes<Element>["role"]>;

export type Ref<T> = JSX.Ref<T>;

export interface RefAttributes<T> {
  ref?: Ref<T>;
}

export type EventHandler<T = Element, E extends Event = Event> = (
  event: E & { readonly currentTarget: T }
) => void;

export type AnimationEventHandler<T> = EventHandler<T, AnimationEvent>;

export type ClipboardEventHandler<T> = EventHandler<T, ClipboardEvent>;

export type CompositionEventHandler<T> = EventHandler<T, CompositionEvent>;

export type FormEventHandler<T> = EventHandler<T, InputEvent>;

export type MouseEventHandler<T> = EventHandler<T, globalThis.MouseEvent>;

export type PointerEventHandler<T> = EventHandler<T, PointerEvent>;

export type TouchEventHandler<T> = EventHandler<T, TouchEvent>;

export type TransitionEventHandler<T> = EventHandler<T, TransitionEvent>;

export type UIEventHandler<T> = EventHandler<T, UIEvent>;

export type WheelEventHandler<T> = EventHandler<T, WheelEvent>;

export type NativeDOMAttributes<T> = {
  [K in keyof JSX.EventHandlersElement<T>]: Extract<
    JSX.EventHandlersElement<T>[K],
    (...args: never[]) => void
  > extends (event: infer E) => infer R
    ? (
        event: Omit<E, "target" | "currentTarget"> & {
          readonly target: EventTarget | null;
          readonly currentTarget: T;
        }
      ) => R
    : never;
};

export type HTMLAttributes<T> = JSX.HTMLAttributes<T>;

export type ButtonHTMLAttributes<T> = JSX.ButtonHTMLAttributes<T>;

export type FormHTMLAttributes<T> = JSX.FormHTMLAttributes<T>;

export type LabelHTMLAttributes<T> = JSX.LabelHTMLAttributes<T>;
