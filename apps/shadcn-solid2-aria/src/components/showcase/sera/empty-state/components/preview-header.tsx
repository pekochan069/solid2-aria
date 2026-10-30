/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/app/(app)/(styles)/sera/empty-state/components/preview-header.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive control state, and local Aria primitives.
 * Licensed under MIT. See ../../../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { ArrowLeftIcon, PlusIcon } from "@lucide/solid";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "../../../../../registry/ui/breadcrumb";
import { Button } from "../../../../../registry/ui/button";

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
                  Editorial Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 class="font-heading line-clamp-1 text-3xl tracking-wide uppercase md:text-3xl lg:text-4xl">
            Article Directory
          </h1>
        </div>
        <Button class="sm:ml-auto">
          <PlusIcon data-icon="inline-start" />
          New Article
        </Button>
      </div>
    </header>
  );
}
