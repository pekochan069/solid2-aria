/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/sonner-types.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

// Mount <Toaster /> once at the application root.
import { Button } from "../registry/ui/button";
import { toast } from "../registry/ui/sonner";

export function SonnerTypes() {
  return (
    <div class="flex flex-wrap gap-2">
      <Button
        variant="outline"
        onClick={() => {
          toast("Event has been created");
        }}
      >
        Default
      </Button>
      <Button
        variant="outline"
        onClick={() => {
          toast.success("Event has been created");
        }}
      >
        Success
      </Button>
      <Button
        variant="outline"
        onClick={() => {
          toast.info("Be at the area 10 minutes before the event time");
        }}
      >
        Info
      </Button>
      <Button
        variant="outline"
        onClick={() => {
          toast.warning("Event start time cannot be earlier than 8am");
        }}
      >
        Warning
      </Button>
      <Button
        variant="outline"
        onClick={() => {
          toast.error("Event has not been created");
        }}
      >
        Error
      </Button>
      <Button
        variant="outline"
        onClick={() => {
          toast.promise<{ name: string }>(
            async () => {
              // oxlint-disable-next-line promise/avoid-new -- This browser timer exposes a promise for the toast example.
              await new Promise<void>((resolve) => {
                setTimeout(resolve, 2000);
              });

              return { name: "Event" };
            },
            {
              error: "Error",
              loading: "Loading...",
              success: (data) => `${data.name} has been created`,
            }
          );
        }}
      >
        Promise
      </Button>
    </div>
  );
}

export default SonnerTypes;
