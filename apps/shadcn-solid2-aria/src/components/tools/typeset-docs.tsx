/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/app/(app)/(typeset)/components/{docs-panel,get-code-drawer}.tsx.
 * Modified for Solid Aria: Solid 2 setup tabs, local stylesheet and font instructions, generated CSS, and a responsive Vaul code drawer.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { createSignal, Show } from "solid-js";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../../registry/ui/drawer";
import { Code } from "../docs/code";
import { CopyAction } from "./shared";

export function TypesetDocsContent(props: { css: string }) {
  const [docsTab, setDocsTab] = createSignal("docs");

  return (
    <>
      <div class="tool-panel tool-code-panel">
        <div
          class="typeset-docs-tabs"
          role="tablist"
          aria-label="Typeset setup"
        >
          <button
            type="button"
            role="tab"
            aria-selected={docsTab() === "docs" ? "true" : "false"}
            onClick={() => {
              setDocsTab("docs");
            }}
          >
            Docs
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={docsTab() === "prompt" ? "true" : "false"}
            onClick={() => {
              setDocsTab("prompt");
            }}
          >
            Prompt
          </button>
          <span>Solid 2</span>
        </div>
        <div class="typeset-docs-content" role="tabpanel">
          <Show
            when={docsTab() === "docs"}
            fallback={
              <>
                <p>Copy these settings into your Solid 2 project.</p>
                <Code code={props.css} language="css" />
                <CopyAction value={props.css}>Copy CSS</CopyAction>
              </>
            }
          >
            <section>
              <h2>1. Create typeset.css</h2>
              <p>
                Copy the stylesheet into a <code>typeset.css</code> file next to
                your main CSS file, then import it:
              </p>
              <a
                href="/typeset.css"
                download="typeset.css"
                class="typeset-download"
              >
                Copy typeset.css
              </a>
              <Code
                code={'@import "tailwindcss";\n@import "./typeset.css";'}
                language="css"
              />
            </section>
            <section>
              <h2>2. Add the fonts</h2>
              <p>
                Load your fonts in the main stylesheet and use their font family
                names in your preset.
              </p>
              <Code
                code={
                  '@font-face {\n  font-family: "Geist";\n  src: url("/fonts/geist-latin.woff2");\n  font-weight: 100 900;\n  font-display: swap;\n}'
                }
                language="css"
              />
            </section>
            <section>
              <h2>3. Create your custom typeset</h2>
              <Code code={props.css} language="css" />
              <CopyAction value={props.css}>Copy CSS</CopyAction>
            </section>
            <section>
              <h2>4. Wrap your content</h2>
              <Code
                code={
                  '<article class="typeset typeset-custom">\n  {content}\n</article>'
                }
                language="tsx"
              />
            </section>
          </Show>
        </div>
      </div>
      <a class="typeset-read-docs" href="/docs/typeset">
        Read the docs
      </a>
    </>
  );
}

export function TypesetCodeDrawer(props: { css: string; mobile: boolean }) {
  return (
    <Drawer direction={props.mobile ? "bottom" : "right"}>
      <DrawerTrigger variant="outline" class="typeset-get-code">
        Get Code
      </DrawerTrigger>
      <DrawerContent class="typeset-code-drawer">
        <DrawerHeader>
          <DrawerTitle>Get Code</DrawerTitle>
          <DrawerDescription>
            Install typeset with the values you picked.
          </DrawerDescription>
        </DrawerHeader>
        <div class="typeset-code-drawer-content">
          <TypesetDocsContent css={props.css} />
        </div>
        <DrawerFooter>
          <DrawerClose variant="outline">Done</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
