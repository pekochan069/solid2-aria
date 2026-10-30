/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/blocks/preview/cards/ui-elements.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { ChevronUpIcon, SearchIcon } from "@lucide/solid";
import { createSignal } from "solid-js";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../../registry/ui/alert-dialog";
import { Badge } from "../../../registry/ui/badge";
import { Button } from "../../../registry/ui/button";
import { ButtonGroup } from "../../../registry/ui/button-group";
import { Card, CardContent } from "../../../registry/ui/card";
import { Checkbox } from "../../../registry/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../registry/ui/dropdown-menu";
import { Field, FieldGroup } from "../../../registry/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "../../../registry/ui/input-group";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "../../../registry/ui/item";
import { RadioGroup, RadioGroupItem } from "../../../registry/ui/radio-group";
import { Slider } from "../../../registry/ui/slider";
import { Switch } from "../../../registry/ui/switch";
import { Textarea } from "../../../registry/ui/textarea";

export function UIElements() {
  const [sliderValue, setSliderValue] = createSignal<number[]>([500]);

  const handleSliderValueChange = (value: number | readonly number[]) => {
    if (typeof value === "number") {
      setSliderValue([value]);
    } else {
      setSliderValue([...value]);
    }
  };

  return (
    <Card class="w-full">
      <CardContent class="flex flex-col gap-6">
        <div class="flex flex-col gap-4">
          <div class="flex flex-wrap gap-2">
            <Button>Button</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
          </div>
          <Item variant="outline">
            <ItemContent>
              <ItemTitle>Two-factor authentication</ItemTitle>
              <ItemDescription class="text-pretty xl:hidden 2xl:block">
                Verify via email or phone number.
              </ItemDescription>
            </ItemContent>
            <ItemActions class="hidden md:flex">
              <Button size="sm" variant="secondary">
                Enable
              </Button>
            </ItemActions>
          </Item>
        </div>
        <Slider
          value={sliderValue()}
          onChange={handleSliderValueChange}
          maxValue={1000}
          minValue={0}
          step={10}
          class="flex-1"
          aria-label="Slider"
        />
        <FieldGroup>
          <Field>
            <InputGroup>
              <InputGroupInput placeholder="Name" />
              <InputGroupAddon align="inline-end">
                <InputGroupText>
                  <SearchIcon />
                </InputGroupText>
              </InputGroupAddon>
            </InputGroup>
          </Field>
          <Field class="flex-1">
            <Textarea placeholder="Message" class="resize-none" />
          </Field>
        </FieldGroup>
        <div class="flex items-center gap-2">
          <div class="flex gap-2">
            <Badge>Badge</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
          </div>
          <RadioGroup defaultValue="apple" class="ml-auto flex w-fit gap-3">
            <RadioGroupItem value="apple" />
            <RadioGroupItem value="banana" />
          </RadioGroup>
          <div class="flex gap-3">
            <Checkbox defaultSelected />
            <Checkbox />
          </div>
        </div>
        <div class="flex items-center gap-4">
          <AlertDialogTrigger>
            <Button variant="outline">
              <span class="style-sera:md:hidden hidden md:flex">
                Alert Dialog
              </span>
              <span class="style-sera:md:flex flex md:hidden">Dialog</span>
            </Button>
            <AlertDialog size="sm">
              <AlertDialogHeader>
                <AlertDialogTitle>Allow accessory to connect?</AlertDialogTitle>
                <AlertDialogDescription>
                  Do you want to allow the USB accessory to connect to this
                  device and your data?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Don&apos;t allow</AlertDialogCancel>
                <AlertDialogAction>Allow</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialog>
          </AlertDialogTrigger>
          <ButtonGroup>
            <Button variant="outline">
              <span class="style-sera:hidden">Button Group</span>
              <span class="style-sera:block hidden">Group</span>
            </Button>

            <DropdownMenuTrigger>
              <Button variant="outline" size="icon">
                <ChevronUpIcon />
              </Button>
              <DropdownMenu placement="top end" class="w-fit">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                  <DropdownMenuItem>Mute Conversation</DropdownMenuItem>
                  <DropdownMenuItem>Mark as Read</DropdownMenuItem>
                  <DropdownMenuItem>Block User</DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Conversation</DropdownMenuLabel>
                  <DropdownMenuItem>Share Conversation</DropdownMenuItem>
                  <DropdownMenuItem>Copy Conversation</DropdownMenuItem>
                  <DropdownMenuItem>Report Conversation</DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem variant="destructive">
                    Delete Conversation
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenu>
            </DropdownMenuTrigger>
          </ButtonGroup>
          <Switch defaultSelected class="ml-auto" />
        </div>
      </CardContent>
    </Card>
  );
}

export default UIElements;
