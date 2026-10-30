/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/tabs-disabled.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { Tabs, TabsList, TabsTrigger } from "../registry/ui/tabs";

export function TabsDisabled() {
  return (
    <Tabs defaultSelectedKey="home">
      <TabsList>
        <TabsTrigger id="home">Home</TabsTrigger>
        <TabsTrigger id="settings" isDisabled>
          Disabled
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

export default TabsDisabled;
