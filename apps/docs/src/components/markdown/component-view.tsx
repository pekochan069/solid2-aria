import type { JSX } from "@solidjs/web";

interface ComponentViewProps {
  children: JSX.Element;
}

export function ComponentView(props: ComponentViewProps) {
  return <div class="component-view not-prose">{props.children}</div>;
}
