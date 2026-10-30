/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/sonner-demo.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

// Mount <Toaster /> once at the application root.
import { Button } from "../registry/ui/button";
import { toast } from "../registry/ui/sonner";

export function SonnerDemo() {
  return (
    <Button
      variant="outline"
      onClick={() => {
        toast("Event has been created", {
          action: {
            label: "Undo",
            onClick: () => {
              console.log("Undo");
            },
          },
          description: "Sunday, December 03, 2023 at 9:00 AM",
        });
      }}
    >
      Show Toast
    </Button>
  );
}

export default SonnerDemo;
