/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/dropdown-menu-radio-icons.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, Lucide icons, and exclusive radio selection that cannot be cleared.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { Building2Icon, CreditCardIcon, WalletIcon } from "@lucide/solid";
import { createSignal } from "solid-js";

import { Button } from "../registry/ui/button";
import {
  DropdownMenu,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../registry/ui/dropdown-menu";

export function DropdownMenuRadioIcons() {
  const [paymentMethod, setPaymentMethod] = createSignal("card");

  return (
    <DropdownMenuTrigger>
      <Button variant="outline">Payment Method</Button>
      <DropdownMenu class="min-w-56">
        <DropdownMenuGroup
          selectionMode="single"
          disallowEmptySelection
          selectedKeys={[paymentMethod()]}
          onSelectionChange={(keys) => {
            if (keys !== "all") {
              const [key] = keys;

              if (typeof key === "string") {
                setPaymentMethod(key);
              }
            }
          }}
        >
          <DropdownMenuLabel>Select Payment Method</DropdownMenuLabel>
          <DropdownMenuItem id="card">
            <CreditCardIcon />
            Credit Card
          </DropdownMenuItem>
          <DropdownMenuItem id="paypal">
            <WalletIcon />
            PayPal
          </DropdownMenuItem>
          <DropdownMenuItem id="bank">
            <Building2Icon />
            Bank Transfer
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenu>
    </DropdownMenuTrigger>
  );
}

export default DropdownMenuRadioIcons;
