import type { JSX } from "@solidjs/web";
import {
  children,
  createMemo,
  createSignal,
  createUniqueId,
  For,
} from "solid-js";

interface CodeGroupProps {
  children: JSX.Element;
  labels: readonly [string, ...string[]];
  label?: string;
}

export function CodeGroup(props: CodeGroupProps) {
  const id = createUniqueId();
  const [selected, setSelected] = createSignal(0);
  const content = children(() => props.children);
  const tabs: HTMLButtonElement[] = [];

  const files = createMemo(() => {
    const blocks = content
      .toArray()
      .filter((child) => typeof child !== "string" || child.trim() !== "");

    if (blocks.length !== props.labels.length) {
      throw new Error("CodeGroup requires one label for each code block.");
    }

    return props.labels.map((name, index) => ({
      content: blocks[index],
      index,
      name,
    }));
  });

  function handleKeyDown(
    event: KeyboardEvent & { currentTarget: HTMLButtonElement },
    index: number
  ) {
    const last = files().length - 1;

    const direction =
      getComputedStyle(event.currentTarget).direction === "rtl" ? -1 : 1;

    let next: number;

    switch (event.key) {
      case "ArrowRight": {
        next = (index + direction + last + 1) % (last + 1);
        break;
      }

      case "ArrowLeft": {
        next = (index - direction + last + 1) % (last + 1);
        break;
      }

      case "Home": {
        next = 0;
        break;
      }

      case "End": {
        next = last;
        break;
      }

      default: {
        return;
      }
    }

    event.preventDefault();
    setSelected(next);
    tabs[next]?.focus();
  }

  return (
    <div class="code-group">
      <div
        aria-label={props.label ?? "Example files"}
        class="border-border bg-muted flex overflow-x-auto border-b"
        role="tablist"
      >
        <For each={files()}>
          {(file) => (
            <button
              aria-controls={`${id}-panel-${file.index}`}
              aria-selected={selected() === file.index ? "true" : "false"}
              class="text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-ring aria-selected:border-primary aria-selected:bg-card aria-selected:text-card-foreground flex-none cursor-pointer border-b-2 border-transparent px-4 py-1.5 font-mono text-[0.8125rem] leading-normal focus-visible:outline-2 focus-visible:-outline-offset-3 aria-selected:font-bold forced-colors:focus-visible:outline-[Highlight] forced-colors:aria-selected:border-[Highlight]"
              id={`${id}-tab-${file.index}`}
              onClick={() => {
                setSelected(file.index);
              }}
              onKeyDown={(event) => {
                handleKeyDown(event, file.index);
              }}
              ref={(element) => {
                tabs[file.index] = element;
              }}
              role="tab"
              tabindex={selected() === file.index ? 0 : -1}
              type="button"
            >
              {file.name}
            </button>
          )}
        </For>
      </div>
      <For each={files()}>
        {(file) => (
          <div
            aria-labelledby={`${id}-tab-${file.index}`}
            class="focus-visible:outline-ring focus-visible:outline-2 focus-visible:-outline-offset-3 forced-colors:focus-visible:outline-[Highlight]"
            hidden={selected() !== file.index}
            id={`${id}-panel-${file.index}`}
            role="tabpanel"
            tabindex={0}
          >
            {file.content}
          </div>
        )}
      </For>
    </div>
  );
}
