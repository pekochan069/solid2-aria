/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/blocks/preview/cards/activate-agent-dialog.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { For } from "solid-js";

import { Alert, AlertDescription } from "../../../registry/ui/alert";
import { Badge } from "../../../registry/ui/badge";
import { Button } from "../../../registry/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../registry/ui/card";
import {
  Item,
  ItemContent,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "../../../registry/ui/item";
import { IconPlaceholder } from "../../_icons";

// Agent feature descriptions.

export function ActivateAgentDialog() {
  const agentFeatures = [
    {
      content: (
        <>
          <strong>Code reviews</strong> with full codebase context to catch{" "}
          <strong>hard-to-find</strong> bugs.
        </>
      ),
      id: "code-reviews",
    },
    {
      content: (
        <>
          <strong>Code suggestions</strong> validated in sandboxes before you
          merge.
        </>
      ),
      id: "code-suggestions",
    },
    {
      content: (
        <>
          <strong>Root-cause analysis</strong> for production issues with
          deployment context.{" "}
          <Badge variant="secondary" class="bg-chart-1 text-chart-5">
            Requires Observability Plus
          </Badge>
        </>
      ),
      id: "root-cause",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ship faster & safer with Vercel Agent</CardTitle>
        <CardDescription>
          Your use is subject to Vercel&apos;s{" "}
          <a href="#">Public Beta Agreement</a> and{" "}
          <a href="#">AI Product Terms</a>.
        </CardDescription>
      </CardHeader>
      <CardContent class="flex flex-col gap-4">
        <ItemGroup class="gap-0">
          {
            <For each={agentFeatures}>
              {(feature) => (
                <Item size="xs" class="px-0">
                  <ItemMedia variant="icon" class="self-start">
                    <IconPlaceholder
                      lucide="CheckCircle2Icon"
                      tabler="IconCircleCheckFilled"
                      hugeicons="CheckmarkCircle02Icon"
                      phosphor="CheckCircleIcon"
                      remixicon="RiCheckboxCircleLine"
                      class="fill-primary text-primary-foreground size-5"
                    />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle class="text-muted-foreground *:[strong]:text-foreground inline leading-relaxed font-normal *:[strong]:font-medium">
                      {feature.content}
                    </ItemTitle>
                  </ItemContent>
                </Item>
              )}
            </For>
          }
        </ItemGroup>
        <Alert>
          <AlertDescription>
            Pro teams get $100 in Vercel Agent trial credit for 2 weeks after
            activation.
          </AlertDescription>
        </Alert>
      </CardContent>
      <CardFooter class="justify-end gap-2">
        <Button variant="outline" class="style-sera:hidden">
          Cancel
        </Button>
        <Button class="style-sera:w-full">Enable with $100 credits</Button>
      </CardFooter>
    </Card>
  );
}

export default ActivateAgentDialog;
