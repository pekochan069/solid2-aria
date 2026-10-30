/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/blocks/preview/cards/environment-variables.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { For } from "solid-js";

import { Button } from "../../../registry/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../registry/ui/card";

export function EnvironmentVariables() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Environment Variables</CardTitle>
        <CardDescription>Production · 8 variables</CardDescription>
      </CardHeader>
      <CardContent class="flex flex-col gap-2">
        {
          <For
            each={[
              { key: "DATABASE_URL", masked: true },
              { key: "NEXT_PUBLIC_API", masked: false },
              { key: "STRIPE_SECRET", masked: true },
            ]}
          >
            {(env) => (
              <div class="ring-border flex items-center gap-2 rounded-md px-2.5 py-2 font-mono text-xs ring">
                <span class="font-medium">{env.key}</span>
                <span class="text-muted-foreground ml-auto">
                  {env.masked ? "••••••••" : "https://api.example.com"}
                </span>
              </div>
            )}
          </For>
        }
      </CardContent>
      <CardFooter>
        <Button variant="outline">Edit</Button>
        <Button class="ml-auto">Deploy</Button>
      </CardFooter>
    </Card>
  );
}

export default EnvironmentVariables;
