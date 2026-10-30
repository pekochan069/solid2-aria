/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/components/{page-header,page-nav,announcement}.tsx.
 * Modified for Solid Aria: Solid 2 JSX, local navigation, and shared page layouts.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { ArrowRightIcon } from "@lucide/solid";
import type { JSX } from "@solidjs/web";
import { Show } from "solid-js";

export function Announcement() {
  return (
    <a href="/docs/components" class="announcement">
      Accessible components for Solid 2 <ArrowRightIcon size={12} />
    </a>
  );
}

export function PageHeader(props: {
  title: string;
  description: string;
  children?: JSX.Element;
  announcement?: boolean;
  class?: string;
  headingClass?: string;
}) {
  return (
    <section class={["page-header", props.class]}>
      <div class="container-wrapper">
        <div class="page-header-content container">
          <Show when={props.announcement !== false}>
            <Announcement />
          </Show>
          <h1 class={props.headingClass}>{props.title}</h1>
          <p>{props.description}</p>
          <Show when={props.children}>
            {(content) => <div class="page-actions">{content()}</div>}
          </Show>
        </div>
      </div>
    </section>
  );
}

export function PageNav(props: {
  id?: string;
  label: string;
  children: JSX.Element;
  actions?: JSX.Element;
}) {
  return (
    <div id={props.id} class="page-nav container-wrapper">
      <div class="page-nav-content container">
        <nav aria-label={props.label}>{props.children}</nav>
        {props.actions}
      </div>
    </div>
  );
}
