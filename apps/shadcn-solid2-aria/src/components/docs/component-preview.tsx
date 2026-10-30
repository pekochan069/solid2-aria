/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/components/{component-preview,component-preview-tabs}.tsx.
 * Modified for Solid Aria: lazy Solid 2 examples, per-preview styles, contained block iframes, matching preview alignment, local source expansion, and client mounting.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { dynamic, useHead } from "@solidjs/web";
import { ClientOnly } from "@tanstack/solid-router";
import { createMemo, createSignal, For, Loading, Show } from "solid-js";

import { examples, loadExampleFiles } from "../../lib/examples";
import { getThemeStylesheet } from "../../lib/theme-stylesheets";
import { Code } from "./code";

export interface ComponentPreviewProps {
  name: string;
  type?: "block" | "component" | "example";
  code?: string;
  styleName?: string;
  align?: "center" | "start" | "end";
  class?: string;
  previewClassName?: string;
  direction?: "ltr" | "rtl";
  hideCode?: boolean;
  chromeLessOnMobile?: boolean;
  title?: string;
  description?: string;
}

function PreviewExample(props: { name: string }) {
  const Demo = dynamic(() => {
    const component = examples.get(props.name);

    if (!component) {
      throw new Error(`Missing live example ${props.name}`);
    }

    return component;
  });

  return <Demo />;
}

export function ComponentPreview(props: ComponentPreviewProps) {
  const [expanded, setExpanded] = createSignal(false);

  useHead(() =>
    props.styleName === undefined
      ? []
      : {
          props: {
            href: getThemeStylesheet(props.styleName.replace("aria-", "")),
            rel: "stylesheet",
          },
          tag: "link",
        }
  );

  const files = createMemo(async () => {
    const { code, name } = props;

    return code === undefined
      ? await loadExampleFiles(props.name)
      : [{ code, name: `${name}.tsx` }];
  });

  const source = () => files()[0]?.code ?? "";

  return (
    <div
      class={[
        "component-preview",
        props.class,
        props.styleName?.replace("aria-", "style-"),
      ]}
      data-slot="component-preview"
      data-example={props.name}
      data-not-typeset
    >
      <Show when={props.title}>
        <div class="preview-title">
          {props.title}
          <p>{props.description}</p>
        </div>
      </Show>
      <div
        class={["preview-canvas", props.previewClassName]}
        data-align={props.align ?? "center"}
        data-chromeless={props.chromeLessOnMobile === true ? "true" : "false"}
        data-preview-type={props.type ?? "component"}
        dir={props.direction ?? "ltr"}
      >
        <Show
          when={props.type === "block"}
          fallback={
            <ClientOnly
              fallback={<p class="muted">Loading interactive example...</p>}
            >
              <Loading fallback={<p class="muted">Loading example...</p>}>
                <PreviewExample name={props.name} />
              </Loading>
            </ClientOnly>
          }
        >
          <iframe
            title={props.title ?? props.name.replaceAll("-", " ")}
            src={`/examples/aria/${encodeURIComponent(props.name)}`}
            loading="lazy"
          />
        </Show>
      </div>
      <Show when={props.hideCode !== true}>
        <div
          class="preview-source"
          data-expanded={expanded() ? "true" : "false"}
        >
          <Loading fallback={<p class="muted">Loading source...</p>}>
            <Code
              code={
                expanded()
                  ? source()
                  : source()
                      .replace(/^\/\*[\s\S]*?\*\/\s*/u, "")
                      .split("\n")
                      .slice(0, 3)
                      .join("\n")
              }
              showLineNumbers
              title={expanded() ? `${props.name}.tsx` : undefined}
            />
          </Loading>
          <Show when={expanded()}>
            <Loading fallback={<p>Loading example dependencies...</p>}>
              <Show when={files().length > 1}>
                <div class="example-dependencies">
                  <p>
                    This example also uses these files in the same directory.
                  </p>
                  <For each={files().slice(1)}>
                    {(file) => (
                      <details>
                        <summary>{file.name}</summary>
                        <Code
                          code={file.code}
                          title={file.name}
                          showLineNumbers
                        />
                      </details>
                    )}
                  </For>
                </div>
              </Show>
            </Loading>
          </Show>
          <div class="preview-code-action">
            <button
              type="button"
              aria-expanded={expanded() ? "true" : "false"}
              onClick={() => {
                setExpanded((value) => !value);
              }}
            >
              {expanded() ? "Hide Code" : "View Code"}
            </button>
          </div>
        </div>
      </Show>
    </div>
  );
}
