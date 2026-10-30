import type { JSX } from "@solidjs/web";
import type { Component, ParentComponent } from "solid-js";

export type MarkdownComponents = {
  [Tag in keyof JSX.IntrinsicElements]?: Component<JSX.IntrinsicElements[Tag]>;
} & { wrapper?: ParentComponent };

export interface MarkdownContentProps {
  components?: MarkdownComponents;
}

export interface MarkdownDocument {
  Content: Component<MarkdownContentProps>;
  components: MarkdownComponents;
}
