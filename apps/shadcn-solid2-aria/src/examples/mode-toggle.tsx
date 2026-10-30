/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/new-york-v4/examples/mode-toggle.tsx.
 * Modified for Solid Aria: Solid 2 local controls and native validation replace the upstream framework integration.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { Button } from "../registry/ui/button";

export default function ModeToggle() {
  return (
    <Button
      variant="outline"
      onPress={() => {
        const dark = document.documentElement.classList.toggle("dark");

        try {
          localStorage.setItem("shadcn-solid2-theme", dark ? "dark" : "light");
        } catch {
          // The DOM theme still changes when storage is unavailable.
        }
      }}
    >
      Toggle theme
    </Button>
  );
}
