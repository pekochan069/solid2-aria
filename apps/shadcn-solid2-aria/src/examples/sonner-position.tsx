/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/sonner-position.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

// Mount <Toaster /> once at the application root.
import { Button } from "../registry/ui/button";
import { toast } from "../registry/ui/sonner";

export function SonnerPosition() {
  return (
    <div class="flex flex-wrap justify-center gap-2">
      <Button
        variant="outline"
        onClick={() => {
          toast("Event has been created", { position: "top-left" });
        }}
      >
        Top Left
      </Button>
      <Button
        variant="outline"
        onClick={() => {
          toast("Event has been created", { position: "top-center" });
        }}
      >
        Top Center
      </Button>
      <Button
        variant="outline"
        onClick={() => {
          toast("Event has been created", { position: "top-right" });
        }}
      >
        Top Right
      </Button>
      <Button
        variant="outline"
        onClick={() => {
          toast("Event has been created", { position: "bottom-left" });
        }}
      >
        Bottom Left
      </Button>
      <Button
        variant="outline"
        onClick={() => {
          toast("Event has been created", { position: "bottom-center" });
        }}
      >
        Bottom Center
      </Button>
      <Button
        variant="outline"
        onClick={() => {
          toast("Event has been created", { position: "bottom-right" });
        }}
      >
        Bottom Right
      </Button>
    </div>
  );
}

export default SonnerPosition;
