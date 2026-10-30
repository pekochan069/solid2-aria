/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/marker-link-button.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

// Mount <Toaster /> once at the application root.
import { GitBranchIcon, RotateCcwIcon } from "@lucide/solid";

import { Marker, MarkerContent, MarkerIcon } from "../registry/ui/marker";
import { toast } from "../registry/ui/sonner";

export function MarkerLinkButtonDemo() {
  return (
    <div class="flex w-full max-w-sm flex-col gap-8 py-12">
      <Marker
        render={(props) => <a href="#links-and-buttons" class={props.class} />}
      >
        <MarkerIcon>
          <GitBranchIcon />
        </MarkerIcon>
        <MarkerContent>View the pull request</MarkerContent>
      </Marker>
      <Marker
        class="hover:text-foreground transition-colors"
        render={(props) => (
          <button
            class={props.class}
            type="button"
            onClick={() => {
              toast("You clicked the revert button");
            }}
          />
        )}
      >
        <MarkerIcon>
          <RotateCcwIcon />
        </MarkerIcon>
        <MarkerContent>Revert this change</MarkerContent>
      </Marker>
    </div>
  );
}

export default MarkerLinkButtonDemo;
