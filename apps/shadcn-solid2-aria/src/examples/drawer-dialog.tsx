/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/drawer-dialog.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import type { ComponentProps } from "@solidjs/web";
import { cn } from "cn";
import { createSignal, Show } from "solid-js";

import { Button } from "../registry/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../registry/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../registry/ui/drawer";
import { Input } from "../registry/ui/input";
import { Label } from "../registry/ui/label";
import { useMediaQuery } from "./_support";

export function DrawerDialogDemo() {
  const [open, setOpen] = createSignal(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <Show
      when={isDesktop()}
      fallback={
        <Drawer
          open={open()}
          onOpenChange={(value) => {
            setOpen(value);
          }}
        >
          <DrawerTrigger variant="outline">Edit Profile</DrawerTrigger>
          <DrawerContent>
            <DrawerHeader class="text-left">
              <DrawerTitle>Edit profile</DrawerTitle>
              <DrawerDescription>
                Make changes to your profile here. Click save when you&apos;re
                done.
              </DrawerDescription>
            </DrawerHeader>
            <ProfileForm class="px-4" />
            <DrawerFooter class="pt-2">
              <DrawerClose variant="outline">Cancel</DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      }
    >
      <DialogTrigger
        isOpen={open()}
        onOpenChange={(value) => {
          setOpen(value);
        }}
      >
        <Button variant="outline">Edit Profile</Button>
        <Dialog class="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you&apos;re
              done.
            </DialogDescription>
          </DialogHeader>
          <ProfileForm />
        </Dialog>
      </DialogTrigger>
    </Show>
  );
}

function ProfileForm(componentProps: ComponentProps<"form">) {
  return (
    <form class={cn("grid items-start gap-6", componentProps.class)}>
      <div class="grid gap-3">
        <Label for="email">Email</Label>
        <Input type="email" id="email" defaultValue="shadcn@example.com" />
      </div>
      <div class="grid gap-3">
        <Label for="username">Username</Label>
        <Input id="username" defaultValue="@shadcn" />
      </div>
      <Button type="submit">Save changes</Button>
    </form>
  );
}

export default DrawerDialogDemo;
