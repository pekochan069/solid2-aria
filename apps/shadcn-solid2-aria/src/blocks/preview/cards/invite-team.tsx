/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/blocks/preview/cards/invite-team.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { CopyIcon, PlusIcon } from "@lucide/solid";
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
import { Field, FieldLabel } from "../../../registry/ui/field";
import { Input } from "../../../registry/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "../../../registry/ui/input-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../registry/ui/select";
import { Separator } from "../../../registry/ui/separator";

export function InviteTeam() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Invite Team</CardTitle>
        <CardDescription>Add members to your workspace</CardDescription>
      </CardHeader>
      <CardContent class="flex flex-col gap-4">
        <div class="flex flex-col gap-3">
          {
            <For
              each={[
                { email: "alex@example.com", role: "Editor" },
                { email: "sam@example.com", role: "Viewer" },
              ]}
            >
              {(invite) => (
                <div class="flex items-center gap-2">
                  <Input defaultValue={invite.email} class="flex-1" />
                  <Select defaultValue={invite.role.toLowerCase()}>
                    <SelectTrigger class="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent placement="bottom end">
                      <SelectGroup>
                        <SelectItem id="admin">Admin</SelectItem>
                        <SelectItem id="editor">Editor</SelectItem>
                        <SelectItem id="viewer">Viewer</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </For>
          }
        </div>
        <Button variant="outline">
          <PlusIcon data-icon="inline-start" />
          Add another
        </Button>
        <Separator />
        <Field>
          <FieldLabel for="invite-link">Or share invite link</FieldLabel>
          <InputGroup>
            <InputGroupInput
              id="invite-link"
              defaultValue="https://app.co/invite/x8f2k"
              readonly
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton size="icon-xs" aria-label="Copy link">
                <CopyIcon />
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </Field>
      </CardContent>
      <CardFooter>
        <Button class="w-full">Send Invites</Button>
      </CardFooter>
    </Card>
  );
}

export default InviteTeam;
