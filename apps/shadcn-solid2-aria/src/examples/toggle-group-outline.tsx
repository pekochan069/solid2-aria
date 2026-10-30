/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/toggle-group-outline.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { ToggleGroup, ToggleGroupItem } from "../registry/ui/toggle-group";

export function ToggleGroupOutline() {
  return (
    <ToggleGroup variant="outline" defaultSelectedKeys={["all"]}>
      <ToggleGroupItem id="all" aria-label="Toggle all">
        All
      </ToggleGroupItem>
      <ToggleGroupItem id="missed" aria-label="Toggle missed">
        Missed
      </ToggleGroupItem>
    </ToggleGroup>
  );
}

export default ToggleGroupOutline;
