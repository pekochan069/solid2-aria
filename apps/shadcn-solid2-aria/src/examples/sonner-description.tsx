/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/sonner-description.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

// Mount <Toaster /> once at the application root.
import { Button } from "../registry/ui/button";
import { toast } from "../registry/ui/sonner";

export function SonnerDescription() {
  return (
    <Button
      onClick={() => {
        toast("Event has been created", {
          description: "Monday, January 3rd at 6:00pm",
        });
      }}
      variant="outline"
      class="w-fit"
    >
      Show Toast
    </Button>
  );
}

export default SonnerDescription;
