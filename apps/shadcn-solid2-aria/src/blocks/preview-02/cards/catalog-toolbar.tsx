/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/blocks/preview-02/cards/catalog-toolbar.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { PlusIcon, SearchIcon } from "@lucide/solid";

import { Button } from "../../../registry/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../../../registry/ui/input-group";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "../../../registry/ui/toggle-group";

export function CatalogToolbar() {
  return (
    <div class="flex items-center gap-3">
      <InputGroup class="flex-1">
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
        <InputGroupInput placeholder="Search releases or catalog..." />
      </InputGroup>
      <Button>
        <PlusIcon />
        Upload New Release
      </Button>
      <ToggleGroup defaultSelectedKeys={["releases"]} variant="outline">
        <ToggleGroupItem id="all-tracks">All Tracks</ToggleGroupItem>
        <ToggleGroupItem id="releases">Releases</ToggleGroupItem>
        <ToggleGroupItem id="top-earners">Top Earners</ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}

export default CatalogToolbar;
