export type TargetedEvent<T = Element, E extends Event = Event> = E & {
  readonly currentTarget: T;
};

export type FocusEvent<T = Element> = TargetedEvent<T, globalThis.FocusEvent>;

export type MouseEvent<T = Element> = TargetedEvent<T, globalThis.MouseEvent>;

export type NativeKeyboardEvent<T = Element> = TargetedEvent<
  T,
  globalThis.KeyboardEvent
>;

export type SubmitEvent<T = Element> = TargetedEvent<T>;

export type HTMLAttributeAnchorTarget = HTMLAnchorElement["target"] | false;

export type HTMLAttributeReferrerPolicy = Exclude<ReferrerPolicy, ""> | false;
