import { createUniqueId, For, useContext } from "solid-js";

import { CodeBlock } from "./code-block";
import { PackageManagerContext, packageManagers } from "./package-manager";

interface NpmCommandProps {
  type: "install" | "local-execute" | "remote-execute" | "run";
  command: string;
}

const commands = {
  install: {
    bun: "bun add",
    npm: "npm install",
    pnpm: "pnpm add",
    yarn: "yarn add",
  },
  "local-execute": {
    bun: "bun run",
    npm: "npx",
    pnpm: "pnpm exec",
    yarn: "yarn",
  },
  "remote-execute": {
    bun: "bunx",
    npm: "npx",
    pnpm: "pnpm dlx",
    yarn: "yarn dlx",
  },
  run: {
    bun: "bun run",
    npm: "npm run",
    pnpm: "pnpm run",
    yarn: "yarn",
  },
};

export function NpmCommand(props: NpmCommandProps) {
  const id = createUniqueId();
  const { select, selected } = useContext(PackageManagerContext);
  const tabs: HTMLButtonElement[] = [];

  function handleKeyDown(
    event: KeyboardEvent & { currentTarget: HTMLButtonElement },
    index: number
  ) {
    const last = packageManagers.length - 1;

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
    const packageManager = packageManagers[next];

    if (packageManager) {
      select(packageManager);
      tabs[next]?.focus();
    }
  }

  return (
    <div class="code-group">
      <div
        aria-label="Package manager"
        class="border-border bg-muted flex overflow-x-auto border-b"
        role="tablist"
      >
        <For each={packageManagers}>
          {(packageManager) => (
            <button
              aria-controls={`${id}-panel-${packageManager}`}
              aria-selected={selected() === packageManager ? "true" : "false"}
              class="text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-ring aria-selected:border-primary aria-selected:bg-card aria-selected:text-card-foreground flex-none cursor-pointer border-b-2 border-transparent px-4 py-1.5 font-mono text-[0.8125rem] leading-normal focus-visible:outline-2 focus-visible:-outline-offset-3 aria-selected:font-bold forced-colors:focus-visible:outline-[Highlight] forced-colors:aria-selected:border-[Highlight]"
              id={`${id}-tab-${packageManager}`}
              onClick={() => {
                select(packageManager);
              }}
              onKeyDown={(event) => {
                handleKeyDown(event, packageManagers.indexOf(packageManager));
              }}
              ref={(element) => {
                tabs[packageManagers.indexOf(packageManager)] = element;
              }}
              role="tab"
              tabindex={selected() === packageManager ? 0 : -1}
              type="button"
            >
              {packageManager}
            </button>
          )}
        </For>
      </div>
      <For each={packageManagers}>
        {(packageManager) => (
          <div
            aria-labelledby={`${id}-tab-${packageManager}`}
            class="focus-visible:outline-ring focus-visible:outline-2 focus-visible:-outline-offset-3 forced-colors:focus-visible:outline-[Highlight]"
            hidden={selected() !== packageManager}
            id={`${id}-panel-${packageManager}`}
            role="tabpanel"
            tabindex={0}
          >
            <CodeBlock
              code={`${commands[props.type][packageManager]} ${props.command}`}
              language="sh"
            />
          </div>
        )}
      </For>
    </div>
  );
}
