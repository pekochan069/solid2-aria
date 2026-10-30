/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/app/(app)/(root)/cards/ui-elements.tsx.
 * Modified for Solid Aria: Solid 2 JSX and local Solid2 Aria dialog, menu, and form controls.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import ArrowRight02Icon from "@hugeicons/core-free-icons/ArrowRight02Icon";
import ArrowUp01Icon from "@hugeicons/core-free-icons/ArrowUp01Icon";
import Search01Icon from "@hugeicons/core-free-icons/Search01Icon";
import { createSignal } from "solid-js";

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "../../registry/ui/alert-dialog";
import { Badge } from "../../registry/ui/badge";
import { Button } from "../../registry/ui/button";
import { ButtonGroup } from "../../registry/ui/button-group";
import { Card, CardContent } from "../../registry/ui/card";
import { Checkbox } from "../../registry/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "../../registry/ui/dropdown-menu";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupText,
} from "../../registry/ui/input-group";
import { RadioGroup, RadioGroupItem } from "../../registry/ui/radio-group";
import { Switch } from "../../registry/ui/switch";
import { Textarea } from "../../registry/ui/textarea";
import { HugeIcon } from "../huge-icon";

export function UIElements() {
  const [message, setMessage] = createSignal("");

  return (
    <Card class="w-full">
      <CardContent class="flex flex-col gap-6">
        <div class="flex gap-2">
          <Button
            onPress={() => {
              setMessage("Primary button clicked");
            }}
          >
            Button{" "}
            <HugeIcon
              icon={ArrowRight02Icon}
              size={16}
              data-icon="inline-end"
            />
          </Button>
          <Button
            variant="secondary"
            onPress={() => {
              setMessage("Secondary button clicked");
            }}
          >
            Secondary
          </Button>
          <Button
            variant="outline"
            onPress={() => {
              setMessage("Outline button clicked");
            }}
          >
            Outline
          </Button>
        </div>
        <div class="flex flex-col gap-6">
          <InputGroup>
            <InputGroupInput placeholder="Name" aria-label="Name" />
            <InputGroupAddon align="inline-end">
              <InputGroupText>
                <HugeIcon icon={Search01Icon} size={16} />
              </InputGroupText>
            </InputGroupAddon>
          </InputGroup>
          <Textarea
            placeholder="Message"
            aria-label="Message"
            class="resize-none"
          />
        </div>
        <div class="flex items-center gap-2">
          <div class="flex gap-2">
            <Badge>Badge</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline" class="4xl:flex hidden">
              Outline
            </Badge>
          </div>
          <RadioGroup
            defaultValue="apple"
            class="ml-auto flex w-fit gap-3"
            aria-label="Fruit preference"
          >
            <RadioGroupItem value="apple" aria-label="Apple" />
            <RadioGroupItem value="banana" aria-label="Banana" />
          </RadioGroup>
          <div class="flex gap-3">
            <Checkbox defaultSelected aria-label="Enable email alerts" />
            <Checkbox class="4xl:flex hidden" aria-label="Enable push alerts" />
          </div>
          <Switch
            defaultSelected
            class="4xl:hidden flex"
            aria-label="Enable compact notifications"
          />
        </div>
        <div class="flex items-center gap-4">
          <AlertDialogTrigger>
            <Button variant="outline">Alert Dialog</Button>
            <AlertDialog size="sm">
              <AlertDialogHeader>
                <AlertDialogTitle>Allow accessory to connect?</AlertDialogTitle>
                <AlertDialogDescription>
                  Do you want to allow the USB accessory to connect to this
                  device and your data?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Don’t allow</AlertDialogCancel>
                <AlertDialogAction>Allow</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialog>
          </AlertDialogTrigger>
          <ButtonGroup class="ml-auto">
            <Button
              variant="outline"
              onPress={() => {
                setMessage("Button group clicked");
              }}
            >
              Button Group
            </Button>
            <DropdownMenuTrigger>
              <Button
                variant="outline"
                size="icon"
                aria-label="Open quick actions"
              >
                <HugeIcon icon={ArrowUp01Icon} size={16} />
              </Button>
              <DropdownMenu
                placement="top end"
                class="w-48"
                onAction={(key) => {
                  setMessage(String(key));
                }}
              >
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                  <DropdownMenuItem id="Conversation muted">
                    Mute Conversation
                  </DropdownMenuItem>
                  <DropdownMenuItem id="Marked as read">
                    Mark as Read
                  </DropdownMenuItem>
                  <DropdownMenuItem id="User blocked">
                    Block User
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  id="Conversation deleted"
                  variant="destructive"
                >
                  Delete Conversation
                </DropdownMenuItem>
              </DropdownMenu>
            </DropdownMenuTrigger>
          </ButtonGroup>
          <Switch
            defaultSelected
            class="4xl:flex hidden"
            aria-label="Enable advanced setting"
          />
        </div>
        <span role="status" class="sr-only">
          {message()}
        </span>
      </CardContent>
    </Card>
  );
}
