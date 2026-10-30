/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/trace-commit.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import {
  ChevronRightIcon,
  FilePenIcon,
  FilePlusIcon,
  GitCommitHorizontalIcon,
} from "@lucide/solid";
import { Button as ButtonPrimitive } from "@solid2-aria/components";
import { For } from "solid-js";

import {
  CodeBlock,
  CodeBlockContent,
  CodeBlockLine,
} from "../registry/ui/code-block";
import {
  Sheet,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../registry/ui/sheet";
import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceDescription,
  TraceIcon,
  TraceLine,
  TraceTitle,
} from "../registry/ui/trace";

const files = [
  {
    added: false,
    additions: 2,
    deletions: 2,
    diff: `@@ -14,7 +14,7 @@ export default async function LoginPage({
   searchParams,
 }) {
   const { next } = await searchParams
-  const redirectTo =
-    next && next.startsWith("/") ? next : "/"
+  const redirectTo = safeRedirect(next)
+
   return <LoginForm redirectTo={redirectTo} />
 }`,
    path: "app/login/page.tsx",
  },
  {
    added: true,
    additions: 7,
    deletions: 0,
    diff: `@@ -0,0 +1,7 @@
+export function safeRedirect(next: string | undefined) {
+  if (!next || !next.startsWith("/") || next.startsWith("//")) {
+    return "/"
+  }
+
+  return next
+}`,
    path: "lib/auth/redirect.ts",
  },
];

function DiffLines(componentProps: { diff: string }) {
  return (
    <For each={componentProps.diff.split("\n")}>
      {(line, _index) => {
        if (line.startsWith("@@")) {
          return (
            <CodeBlockLine class="text-muted-foreground">{line}</CodeBlockLine>
          );
        }

        return (
          <CodeBlockLine
            variant={(() => {
              if (line.startsWith("+")) {
                return "added";
              }

              if (line.startsWith("-")) {
                return "removed";
              }

              return "default";
            })()}
          >
            {line.slice(1)}
          </CodeBlockLine>
        );
      }}
    </For>
  );
}

export function TraceCommit() {
  return (
    <Trace class="max-w-sm">
      <TraceCollapsible defaultExpanded>
        <TraceCollapsibleTrigger>
          <TraceLine>
            <TraceIcon>
              <GitCommitHorizontalIcon />
            </TraceIcon>
            <TraceTitle>Committed a1b2c3: Fix the login redirect</TraceTitle>
          </TraceLine>
        </TraceCollapsibleTrigger>
        <TraceCollapsibleContent>
          <Trace>
            {
              <For each={files}>
                {(file) => (
                  <SheetTrigger>
                    <ButtonPrimitive>
                      <TraceLine>
                        <TraceIcon>
                          {file.added ? <FilePlusIcon /> : <FilePenIcon />}
                        </TraceIcon>
                        <TraceTitle>
                          {file.added ? "Added" : "Edited"} {file.path}
                        </TraceTitle>
                        <TraceDescription class="font-mono">
                          +{file.additions} −{file.deletions}
                        </TraceDescription>
                        <TraceIcon>
                          <ChevronRightIcon />
                        </TraceIcon>
                      </TraceLine>
                    </ButtonPrimitive>
                    <Sheet>
                      <SheetHeader>
                        <SheetTitle class="font-mono">{file.path}</SheetTitle>
                        <SheetDescription>
                          {file.additions} additions, {file.deletions} deletions
                        </SheetDescription>
                      </SheetHeader>
                      <CodeBlock class="mx-6 mb-6 w-auto">
                        <CodeBlockContent>
                          <DiffLines diff={file.diff} />
                        </CodeBlockContent>
                      </CodeBlock>
                    </Sheet>
                  </SheetTrigger>
                )}
              </For>
            }
          </Trace>
        </TraceCollapsibleContent>
      </TraceCollapsible>
    </Trace>
  );
}

export default TraceCommit;
