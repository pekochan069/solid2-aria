import type { NativeDOMAttributes } from "@solid2-aria/types-shared-web";
import type { JSX as WebJSX, ValidComponent } from "@solidjs/web";
import type { Component } from "solid-js";

export type { Context } from "solid-js";

export type {
  AriaAttributes,
  CSSProperties,
  ElementType,
  RefAttributes,
} from "@solid2-aria/types-shared-web";

export type { JSX } from "@solidjs/web";

export type RefCallback<T> = WebJSX.RefCallback<T>;

export type Ref<T> = WebJSX.Ref<T>;

export type ComponentProps<T extends ValidComponent> =
  T extends keyof WebJSX.IntrinsicElements
    ? WebJSX.IntrinsicElements[T]
    : T extends Component<infer P>
      ? P
      : never;

type Attributes<T, A> = Omit<A, keyof WebJSX.EventHandlersElement<T>> &
  NativeDOMAttributes<T>;

export type HTMLAttributes<T = HTMLElement> = Attributes<
  T,
  WebJSX.HTMLAttributes<T>
>;

export type AnchorHTMLAttributes<T = HTMLAnchorElement> = Attributes<
  T,
  WebJSX.AnchorHTMLAttributes<T>
>;

export type ButtonHTMLAttributes<T = HTMLButtonElement> = Attributes<
  T,
  WebJSX.ButtonHTMLAttributes<T>
>;

export type InputHTMLAttributes<T = HTMLInputElement> = Attributes<
  T,
  WebJSX.InputHTMLAttributes<T>
>;

export type LabelHTMLAttributes<T = HTMLLabelElement> = Attributes<
  T,
  WebJSX.LabelHTMLAttributes<T>
>;

export type OutputHTMLAttributes<T = HTMLOutputElement> = Attributes<
  T,
  WebJSX.OutputHTMLAttributes<T>
>;

export type FormHTMLAttributes<T = HTMLFormElement> = Attributes<
  T,
  WebJSX.FormHTMLAttributes<T>
>;

export type DOMAttributes<T = Element> = NativeDOMAttributes<T>;

type TargetedEvent<T, E extends Event> = E & { readonly currentTarget: T };

export type FocusEvent<T = Element> = TargetedEvent<T, globalThis.FocusEvent>;

export type MouseEvent<T = Element> = TargetedEvent<T, globalThis.MouseEvent>;

export type PointerEvent<T = Element> = TargetedEvent<
  T,
  globalThis.PointerEvent
>;

export type KeyboardEvent<T = Element> = TargetedEvent<
  T,
  globalThis.KeyboardEvent
>;

export type TouchEvent<T = Element> = TargetedEvent<T, globalThis.TouchEvent>;

export type DragEvent<T = Element> = TargetedEvent<T, globalThis.DragEvent>;

export type UIEvent<T = Element> = TargetedEvent<T, globalThis.UIEvent>;

export type ClipboardEvent<T = Element> = TargetedEvent<
  T,
  globalThis.ClipboardEvent
>;

export type ChangeEvent<T = Element> = TargetedEvent<T, Event>;

export type EventHandler<T = Element, E extends Event = Event> = (
  event: TargetedEvent<T, E>
) => void;

export type FocusEventHandler<T = Element> = EventHandler<
  T,
  globalThis.FocusEvent
>;

export type MouseEventHandler<T = Element> = EventHandler<
  T,
  globalThis.MouseEvent
>;

export type PointerEventHandler<T = Element> = EventHandler<
  T,
  globalThis.PointerEvent
>;

export type KeyboardEventHandler<T = Element> = EventHandler<
  T,
  globalThis.KeyboardEvent
>;

export type ClipboardEventHandler<T = Element> = EventHandler<
  T,
  globalThis.ClipboardEvent
>;

export type InputEventHandler<T = Element> = EventHandler<T, InputEvent>;

export type ChangeEventHandler<T = Element> = EventHandler<T>;
