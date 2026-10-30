/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/blocks/sidebar-13/components/settings-dialog.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import {
  SettingsIcon,
  LockIcon,
  LinkIcon,
  VideoIcon,
  CheckIcon,
  KeyboardIcon,
  GlobeIcon,
  MessageCircleIcon,
  PaintbrushIcon,
  HomeIcon,
  MenuIcon,
  BellIcon,
} from "@lucide/solid";
import { createSignal, For } from "solid-js";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
} from "../../../registry/ui/breadcrumb";
import { Button } from "../../../registry/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "../../../registry/ui/dialog";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "../../../registry/ui/sidebar";

export function SettingsDialog() {
  const data = {
    nav: [
      {
        icon: <BellIcon />,
        name: "Notifications",
      },
      {
        icon: <MenuIcon />,
        name: "Navigation",
      },
      {
        icon: <HomeIcon />,
        name: "Home",
      },
      {
        icon: <PaintbrushIcon />,
        name: "Appearance",
      },
      {
        icon: <MessageCircleIcon />,
        name: "Messages & media",
      },
      {
        icon: <GlobeIcon />,
        name: "Language & region",
      },
      {
        icon: <KeyboardIcon />,
        name: "Accessibility",
      },
      {
        icon: <CheckIcon />,
        name: "Mark as read",
      },
      {
        icon: <VideoIcon />,
        name: "Audio & video",
      },
      {
        icon: <LinkIcon />,
        name: "Connected accounts",
      },
      {
        icon: <LockIcon />,
        name: "Privacy & visibility",
      },
      {
        icon: <SettingsIcon />,
        name: "Advanced",
      },
    ],
  };

  const [open, setOpen] = createSignal(true);

  return (
    <DialogTrigger
      isOpen={open()}
      onOpenChange={(value) => {
        setOpen(value);
      }}
    >
      <Button size="sm">Open Dialog</Button>
      <Dialog class="overflow-hidden p-0 md:max-h-[500px] md:max-w-[700px] lg:max-w-[800px]">
        <DialogTitle class="sr-only">Settings</DialogTitle>
        <DialogDescription class="sr-only">
          Customize your settings here.
        </DialogDescription>
        <SidebarProvider class="items-start">
          <Sidebar collapsible="none" class="hidden md:flex">
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {
                      <For each={data.nav}>
                        {(item) => (
                          <SidebarMenuItem>
                            <SidebarMenuButton
                              isActive={item.name === "Messages & media"}
                              href="#"
                            >
                              {item.icon}
                              <span>{item.name}</span>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        )}
                      </For>
                    }
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
          <main class="flex h-[480px] flex-1 flex-col overflow-hidden">
            <header class="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
              <div class="flex items-center gap-2 px-4">
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem class="hidden md:inline-flex">
                      <BreadcrumbLink href="#">Settings</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbItem>
                      <BreadcrumbPage>Messages & media</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </header>
            <div class="flex flex-1 flex-col gap-4 overflow-y-auto p-4 pt-0">
              {
                <For
                  each={Array.from({
                    length: 10,
                  })}
                >
                  {() => (
                    <div class="bg-muted/50 aspect-video max-w-3xl rounded-xl" />
                  )}
                </For>
              }
            </div>
          </main>
        </SidebarProvider>
      </Dialog>
    </DialogTrigger>
  );
}

export default SettingsDialog;
