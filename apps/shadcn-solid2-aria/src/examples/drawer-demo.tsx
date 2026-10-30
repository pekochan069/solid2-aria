/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/drawer-demo.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { createSignal, For } from "solid-js";

import { Badge } from "../registry/ui/badge";
import { Button } from "../registry/ui/button";
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
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "../registry/ui/field";
import { RadioGroup, RadioGroupItem } from "../registry/ui/radio-group";
import { toast } from "../registry/ui/sonner";
// Mount <Toaster /> once at the application root.
import { useIsMobile } from "./_support";

const deliveryTimes = [
  {
    badge: "Fastest",
    description: "25–35 min · Driver assigned now",
    id: "delivery-asap",
    label: "Standard delivery",
    value: "asap",
  },
  {
    description: "Prep starts at 4:45 PM",
    id: "delivery-5-00",
    label: "5:00 PM – 5:15 PM",
    value: "5-00",
  },
  {
    description: "Good if you're heading home",
    id: "delivery-5-30",
    label: "5:30 PM – 5:45 PM",
    value: "5-30",
  },
  {
    description: "Most popular · High demand",
    id: "delivery-6-00",
    label: "6:00 PM – 6:15 PM",
    value: "6-00",
  },
  {
    description: "Last slot before kitchen closes",
    id: "delivery-6-30",
    label: "6:30 PM – 6:45 PM",
    value: "6-30",
  },
];

export function DrawerDemo() {
  const [open, setOpen] = createSignal(false);
  const [deliveryTime, setDeliveryTime] = createSignal("asap");
  const isMobile = useIsMobile();

  function handleConfirm() {
    const selected = deliveryTimes.find(
      (time) => time.value === deliveryTime()
    );

    if (!selected) {
      return;
    }

    setOpen(false);
    toast("Delivery time confirmed", {
      description: selected.label,
    });
  }

  return (
    <Drawer
      open={open()}
      onOpenChange={(value) => {
        setOpen(value);
      }}
      showSwipeHandle={isMobile()}
      direction={isMobile() ? "bottom" : "right"}
    >
      <DrawerTrigger variant="secondary">Open Drawer</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Pick a delivery time</DrawerTitle>
          <DrawerDescription>
            We&apos;ll prepare your order as soon as possible.
          </DrawerDescription>
        </DrawerHeader>
        <div class="scroll-fade flex-1 overflow-y-auto p-4">
          <RadioGroup
            aria-label="Delivery time"
            value={deliveryTime()}
            onChange={(value) => {
              setDeliveryTime(value);
            }}
            class="gap-2"
          >
            {
              <For each={deliveryTimes}>
                {(time) => (
                  <FieldLabel for={time.id}>
                    <Field orientation="horizontal">
                      <FieldContent>
                        <FieldTitle class="flex items-center gap-2">
                          {time.label}
                          {time.badge === undefined ? null : (
                            <Badge variant="secondary">{time.badge}</Badge>
                          )}
                        </FieldTitle>
                        <FieldDescription>{time.description}</FieldDescription>
                      </FieldContent>
                      <RadioGroupItem value={time.value} id={time.id} />
                    </Field>
                  </FieldLabel>
                )}
              </For>
            }
          </RadioGroup>
        </div>
        <DrawerFooter>
          <Button onClick={handleConfirm} class="h-8.5">
            Confirm Delivery Time
          </Button>
          <DrawerClose variant="outline">Cancel</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

export default DrawerDemo;
