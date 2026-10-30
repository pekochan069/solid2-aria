import type { JSX } from "@solidjs/web";
import type { Component, ParentComponent } from "solid-js";
import { dynamicComponent, merge } from "solid-js";

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

interface MarkdownProps {
  components?: MarkdownComponents;
  document: MarkdownDocument;
}

export function Markdown(props: MarkdownProps) {
  const Content = dynamicComponent(() => props.document.Content);

  return (
    <div class="prose">
      <Content
        components={
          // oxlint-disable solid/reactivity -- Keep prop filtering in the renderer's lazy evaluation.
          merge(
            () => props.document.components,
            () => props.components ?? {}
          )
          // oxlint-enable solid/reactivity
        }
      />
    </div>
  );
}
