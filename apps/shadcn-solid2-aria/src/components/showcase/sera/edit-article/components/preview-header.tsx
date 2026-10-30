/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/app/(app)/(styles)/sera/edit-article/components/preview-header.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive control state, and local Aria primitives.
 * Licensed under MIT. See ../../../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { ArrowLeftIcon, ExternalLinkIcon } from "@lucide/solid";

import { Badge } from "../../../../../registry/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "../../../../../registry/ui/breadcrumb";
import { Button } from "../../../../../registry/ui/button";
import { ButtonGroup } from "../../../../../registry/ui/button-group";

export function PreviewHeader() {
  return (
    <header>
      <div class="container flex flex-col items-center justify-center gap-(--gap) py-(--gap) sm:flex-row sm:justify-between">
        <div class="flex flex-col gap-2 text-center sm:text-left">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="#" class="flex items-center gap-1.5">
                  <ArrowLeftIcon class="size-3.5" />
                  Back to articles
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 class="font-heading line-clamp-1 text-3xl tracking-wide uppercase md:text-3xl lg:text-4xl">
            EDIT ARTICLE
          </h1>
        </div>
        <ButtonGroup class="gap-2 md:gap-4">
          <Badge title="2 minutes ago">Autosaved</Badge>
          <ButtonGroup class="gap-2 md:gap-4">
            <Button variant="link">
              Preview
              <ExternalLinkIcon data-icon="inline-end" />
            </Button>
            <Button>Submit Draft</Button>
          </ButtonGroup>
        </ButtonGroup>
      </div>
    </header>
  );
}
