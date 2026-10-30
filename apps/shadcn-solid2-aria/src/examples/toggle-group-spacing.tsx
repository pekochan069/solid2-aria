/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/toggle-group-spacing.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { ToggleGroup, ToggleGroupItem } from "../registry/ui/toggle-group";

export function ToggleGroupSpacing() {
  return (
    <ToggleGroup
      size="sm"
      defaultSelectedKeys={["top"]}
      variant="outline"
      spacing={2}
    >
      <ToggleGroupItem id="top" aria-label="Toggle top">
        Top
      </ToggleGroupItem>
      <ToggleGroupItem id="bottom" aria-label="Toggle bottom">
        Bottom
      </ToggleGroupItem>
      <ToggleGroupItem id="left" aria-label="Toggle left">
        Left
      </ToggleGroupItem>
      <ToggleGroupItem id="right" aria-label="Toggle right">
        Right
      </ToggleGroupItem>
    </ToggleGroup>
  );
}

export default ToggleGroupSpacing;
