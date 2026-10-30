/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/blocks/preview/cards/codespaces-card.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import {
  DownloadIcon,
  MonitorIcon,
  CopyIcon,
  InfoIcon,
  TerminalIcon,
  ServerIcon,
  ShareIcon,
  ZapIcon,
  ContainerIcon,
  PlusIcon,
  MoreHorizontalIcon,
} from "@lucide/solid";
import { createSignal } from "solid-js";

import { Button } from "../../../registry/ui/button";
import { Card, CardContent } from "../../../registry/ui/card";
import {
  DropdownMenu,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../registry/ui/dropdown-menu";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "../../../registry/ui/empty";
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "../../../registry/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "../../../registry/ui/input-group";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "../../../registry/ui/item";
import { Separator } from "../../../registry/ui/separator";
import { Spinner } from "../../../registry/ui/spinner";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../registry/ui/tabs";
import { Tooltip, TooltipTrigger } from "../../../registry/ui/tooltip";

export function CodespacesCard() {
  const [isCreatingCodespace, setIsCreatingCodespace] = createSignal(false);

  return (
    <Card>
      <CardContent>
        <Tabs defaultSelectedKey="codespaces">
          <TabsList class="w-full">
            <TabsTrigger id="codespaces">Codespaces</TabsTrigger>
            <TabsTrigger id="local">Local</TabsTrigger>
          </TabsList>
          <TabsContent id="codespaces">
            <Item size="sm" class="px-1 pt-2">
              <ItemContent>
                <ItemTitle>Codespaces</ItemTitle>
                <ItemDescription>Your workspaces in the cloud</ItemDescription>
              </ItemContent>
              <ItemActions>
                <TooltipTrigger>
                  <Button variant="ghost" size="icon-sm">
                    <PlusIcon />
                  </Button>
                  <Tooltip placement="bottom">
                    Create a codespace on main
                  </Tooltip>
                </TooltipTrigger>
                <DropdownMenuTrigger>
                  <Button variant="ghost" size="icon-sm">
                    <MoreHorizontalIcon />
                  </Button>
                  <DropdownMenu placement="bottom end" class="w-56">
                    <DropdownMenuGroup>
                      <DropdownMenuItem>
                        <PlusIcon />
                        New with options...
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <ContainerIcon />
                        Configure container
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <ZapIcon />
                        Set up prebuilds
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem>
                        <ServerIcon />
                        Manage codespaces
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <ShareIcon />
                        Share deep link
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <InfoIcon />
                        What are codespaces?
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenu>
                </DropdownMenuTrigger>
              </ItemActions>
            </Item>
            <Separator class="-mx-2 my-2 w-auto!" />
            <Empty class="p-4">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ServerIcon />
                </EmptyMedia>
                <EmptyTitle>No codespaces</EmptyTitle>
                <EmptyDescription>
                  You don&apos;t have any codespaces with this repository
                  checked out
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button
                  size="sm"
                  onClick={() => {
                    setIsCreatingCodespace(true);
                    setTimeout(() => {
                      setIsCreatingCodespace(false);
                    }, 2000);
                  }}
                  isDisabled={isCreatingCodespace()}
                >
                  {isCreatingCodespace() ? (
                    <Spinner data-icon="inline-start" />
                  ) : (
                    ""
                  )}
                  Create Codespace
                </Button>
                <a
                  href="#learn-more"
                  class="text-muted-foreground text-xs underline underline-offset-4"
                >
                  Learn more about codespaces
                </a>
              </EmptyContent>
            </Empty>
            <Separator class="-mx-2 my-2 w-auto!" />
            <div class="text-muted-foreground p-1.5 text-xs">
              Codespace usage for this repository is paid for by{" "}
              <span class="font-medium">shadcn</span>.
            </div>
          </TabsContent>
          <TabsContent id="local">
            <Item size="sm" class="hidden p-0">
              <ItemContent>
                <ItemTitle class="gap-2">
                  <TerminalIcon class="size-4" />
                  Clone
                </ItemTitle>
              </ItemContent>
              <ItemActions>
                <TooltipTrigger>
                  <Button variant="ghost" size="icon">
                    <InfoIcon />
                  </Button>
                  <Tooltip placement="left">
                    Which remote URL should I use?
                  </Tooltip>
                </TooltipTrigger>
              </ItemActions>
            </Item>
            <Tabs defaultSelectedKey="https">
              <TabsList
                variant="line"
                class="w-full justify-start border-b *:[button]:flex-0"
              >
                <TabsTrigger id="https">HTTPS</TabsTrigger>
                <TabsTrigger id="ssh">SSH</TabsTrigger>
                <TabsTrigger id="cli">GitHub CLI</TabsTrigger>
              </TabsList>
              <div class="bg-muted/30 rounded-md border p-2">
                <TabsContent id="https">
                  <Field class="gap-2">
                    <FieldLabel for="https-url" class="sr-only">
                      HTTPS URL
                    </FieldLabel>
                    <InputGroup>
                      <InputGroupAddon align="inline-end">
                        <InputGroupButton variant="ghost" size="icon-xs">
                          <CopyIcon />
                        </InputGroupButton>
                      </InputGroupAddon>
                      <InputGroupInput
                        id="https-url"
                        defaultValue="https://github.com/shadcn-ui/ui.git"
                        readonly
                      />
                    </InputGroup>
                    <FieldDescription>
                      Clone using the web URL.
                    </FieldDescription>
                  </Field>
                </TabsContent>
                <TabsContent id="ssh">
                  <Field class="gap-2">
                    <FieldLabel for="ssh-url" class="sr-only">
                      SSH URL
                    </FieldLabel>
                    <InputGroup>
                      <InputGroupAddon align="inline-end">
                        <InputGroupButton variant="ghost" size="icon-xs">
                          <CopyIcon />
                        </InputGroupButton>
                      </InputGroupAddon>
                      <InputGroupInput
                        id="ssh-url"
                        defaultValue="git@github.com:shadcn-ui/ui.git"
                        readonly
                      />
                    </InputGroup>
                    <FieldDescription>
                      Use a password-protected SSH key.
                    </FieldDescription>
                  </Field>
                </TabsContent>
                <TabsContent id="cli">
                  <Field class="gap-2">
                    <FieldLabel for="cli-command" class="sr-only">
                      CLI Command
                    </FieldLabel>
                    <InputGroup>
                      <InputGroupAddon align="inline-end">
                        <InputGroupButton variant="ghost" size="icon-xs">
                          <CopyIcon />
                        </InputGroupButton>
                      </InputGroupAddon>
                      <InputGroupInput
                        id="cli-command"
                        defaultValue="gh repo clone shadcn-ui/ui"
                        readonly
                      />
                    </InputGroup>
                    <FieldDescription>
                      Work fast with our official CLI.{" "}
                      <a href="#learn-more">Learn more</a>
                    </FieldDescription>
                  </Field>
                </TabsContent>
              </div>
            </Tabs>
            <Separator class="-mx-2 my-2 w-auto!" />
            <div class="flex flex-col">
              <Button variant="ghost" size="sm" class="justify-start gap-1.5">
                <MonitorIcon data-icon="inline-start" />
                Open with GitHub Desktop
              </Button>
              <Button variant="ghost" size="sm" class="justify-start gap-1.5">
                <DownloadIcon data-icon="inline-start" />
                Download ZIP
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default CodespacesCard;
