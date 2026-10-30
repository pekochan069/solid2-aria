/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/components/{component-source,code-collapsible-wrapper}.tsx.
 * Modified for Solid Aria: Solid 2 source loading, native accessible expansion controls, local syntax highlighting, and installable registry code.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { FileCodeIcon } from "@lucide/solid";
import {
  createMemo,
  createSignal,
  createUniqueId,
  Loading,
  Show,
} from "solid-js";

import { loadComponentSource } from "../../lib/docs";
import { splitSourceNotice } from "../../lib/source-notice";
import { Code } from "./code";

export function ComponentSource(props: {
  name: string;
  title?: string;
  styleName?: string;
  class?: string;
}) {
  const [expanded, setExpanded] = createSignal(false);
  const contentId = createUniqueId();

  const source = createMemo(async () => {
    const { name } = props;
    const text = await loadComponentSource(name);

    if (text === undefined) {
      throw new Error(`No component source for ${name}`);
    }

    return splitSourceNotice(text).code;
  });

  function toggle() {
    setExpanded((value) => !value);
  }

  return (
    <div
      class={["component-source", props.class]}
      data-expanded={expanded() ? "true" : "false"}
      data-not-typeset
    >
      <Loading fallback={<p>Loading component source...</p>}>
        <div class="source-toolbar">
          <button
            type="button"
            aria-controls={contentId}
            aria-expanded={expanded() ? "true" : "false"}
            onClick={toggle}
          >
            {expanded() ? "Collapse" : "Expand"}
          </button>
          <span aria-hidden="true" />
        </div>
        <div class="source-content" id={contentId}>
          <Code
            code={source()}
            title={props.title ?? `components/ui/${props.name}.tsx`}
            titleIcon={<FileCodeIcon size={16} />}
            showLineNumbers
          />
        </div>
        <Show when={!expanded()}>
          <button
            type="button"
            class="source-expand"
            aria-controls={contentId}
            aria-expanded="false"
            onClick={toggle}
          >
            Expand
          </button>
        </Show>
      </Loading>
    </div>
  );
}
