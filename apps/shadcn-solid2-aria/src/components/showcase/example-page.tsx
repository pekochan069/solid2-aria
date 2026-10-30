import { Match, Switch } from "solid-js";

import { Authentication } from "./authentication";
import { Dashboard } from "./dashboard";
import { Playground } from "./playground";
import { Rtl } from "./rtl";
import { Tasks } from "./tasks";

import "../../styles/showcase.css";

export const examplePages = [
  {
    description: "A dashboard with sidebar, charts, and data tables.",
    name: "dashboard",
    title: "Dashboard",
  },
  {
    description:
      "A task and issue tracker with filtering, sorting, and selection.",
    name: "tasks",
    title: "Tasks",
  },
  {
    description: "A playground for composing model requests.",
    name: "playground",
    title: "Playground",
  },
  {
    description: "Authentication forms built using the components.",
    name: "authentication",
    title: "Authentication",
  },
  {
    description: "Right-to-left language support for Arabic and Hebrew.",
    name: "rtl",
    title: "RTL",
  },
];

export function ExamplePage(props: { name: string }) {
  return (
    <div class="showcase-example">
      <Switch fallback={<p>Example not found.</p>}>
        <Match when={props.name === "authentication"}>
          <Authentication />
        </Match>
        <Match when={props.name === "dashboard"}>
          <Dashboard />
        </Match>
        <Match when={props.name === "tasks"}>
          <Tasks />
        </Match>
        <Match when={props.name === "playground"}>
          <Playground />
        </Match>
        <Match when={props.name === "rtl"}>
          <Rtl />
        </Match>
      </Switch>
    </div>
  );
}
