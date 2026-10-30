import { InfoIcon } from "@lucide/solid";
import type { JSX } from "@solidjs/web";
import { Link } from "@tanstack/solid-router";
import { For, Show } from "solid-js";
import type { Component } from "solid-js";

import { components } from "../../lib/docs";
import { absoluteUrl } from "../../lib/site";
import {
  Tabs,
  TabsContent as Panel,
  TabsList as List,
  TabsTrigger as Trigger,
} from "../../registry/ui/tabs";
import { Code } from "./code";
import { ComponentSource } from "./component-source";

export { ComponentPreview } from "./component-preview";

export { ComponentSource } from "./component-source";

export function RegistryCommand(props: { name: string }) {
  return (
    <Code
      code={`bunx --bun shadcn@latest add ${absoluteUrl(`/r/${props.name}.json`)}`}
      language="bash"
    />
  );
}

export function Installation(props: { component: string }) {
  const extraDependency = () => {
    switch (props.component) {
      case "chart": {
        return " @tanstack/charts @solid2-aria/tanstack-charts";
      }

      case "carousel": {
        return " embla-carousel";
      }

      case "drawer": {
        return " @solid2-aria/vaul";
      }

      case "sonner": {
        return " @solid2-aria/sonner";
      }

      case "calendar": {
        return " @internationalized/date";
      }

      default: {
        return "";
      }
    }
  };

  return (
    <div class="installation-tabs" data-not-typeset>
      <Tabs defaultSelectedKey="cli">
        <List aria-label="Installation method" variant="line">
          <Trigger id="cli">Command</Trigger>
          <Trigger id="manual">Manual</Trigger>
        </List>
        <Panel id="cli">
          <RegistryCommand name={props.component} />
          <p class="installation-note">
            Installs the component, sibling components, and npm dependencies.
            See the{" "}
            <Link to="/docs/$slug" params={{ slug: "installation" }}>
              installation guide
            </Link>{" "}
            for Solid 2 and Tailwind CSS setup.
          </p>
        </Panel>
        <Panel id="manual">
          <Steps>
            <Step>Install the dependencies in your application.</Step>
            <Code
              code={`bun add @solid2-aria/components cn class-variance-authority @lucide/solid${extraDependency()}`}
              language="bash"
            />
            <Step>Copy the component into your project.</Step>
            <ComponentSource name={props.component} />
            <Step>Update import paths and configure the theme.</Step>
            <p class="installation-note">
              Copy any sibling components imported by this file. Follow the{" "}
              <Link to="/docs/$slug" params={{ slug: "installation" }}>
                installation guide
              </Link>{" "}
              for Tailwind CSS and the theme tokens.
            </p>
          </Steps>
        </Panel>
      </Tabs>
    </div>
  );
}

export function Steps(props: { children?: JSX.Element; class?: string }) {
  return <div class={["steps", props.class]}>{props.children}</div>;
}

export function Step(props: { children?: JSX.Element; id?: string }) {
  return (
    <h3 class="step" id={props.id}>
      {props.children}
    </h3>
  );
}

export function Callout(props: {
  children?: JSX.Element;
  class?: string;
  title?: string;
  variant?: string;
  icon?: Component<{ size?: number }>;
}) {
  return (
    <aside class={["docs-callout", props.class]} data-variant={props.variant}>
      <InfoIcon size={16} />
      <div>
        <Show when={props.title}>
          <strong>{props.title}</strong>
        </Show>
        {props.children}
      </div>
    </aside>
  );
}

export function ComponentsList() {
  return (
    <div class="components-list">
      <For each={components}>
        {(component) => <Link to={component.href}>{component.title}</Link>}
      </For>
    </div>
  );
}

export function CodeTabs(props: { children?: JSX.Element }) {
  return (
    <Tabs defaultSelectedKey="cli" class="installation-tabs">
      {props.children}
    </Tabs>
  );
}

export function TabsList(props: { children?: JSX.Element }) {
  return (
    <List aria-label="Code options" variant="line">
      {props.children}
    </List>
  );
}

export function TabsTrigger(props: { value: string; children?: JSX.Element }) {
  return <Trigger id={props.value}>{props.children}</Trigger>;
}

export function TabsContent(props: { value: string; children?: JSX.Element }) {
  return <Panel id={props.value}>{props.children}</Panel>;
}
