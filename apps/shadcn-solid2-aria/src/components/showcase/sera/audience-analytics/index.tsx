/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/app/(app)/(styles)/sera/audience-analytics/index.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive control state, and local Aria primitives.
 * Licensed under MIT. See ../../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { Separator } from "../../../../registry/ui/separator";
import { Demographics } from "./components/demographics";
import { MetricsGrid } from "./components/metrics-grid";
import { PreviewHeader } from "./components/preview-header";
import { TopEditorial } from "./components/top-editorial";
import { TrafficOverviewDeferred } from "./components/traffic-overview-deferred";

export function AudienceAnalytics() {
  return (
    <div
      data-preview="audience-analytics"
      class="preview theme-taupe bg-muted ring-foreground/5 @container/preview w-full flex-1 pt-4 font-sans ring-1 [--gap:--spacing(4)] sm:pt-0 md:[--gap:--spacing(6)] xl:[--gap:--spacing(8)] 2xl:py-8 **:[.container]:px-(--gap)"
    >
      <PreviewHeader />
      <Separator class="hidden sm:block" />
      <div class="container grid grid-cols-12 gap-(--gap) py-(--gap)">
        <MetricsGrid />
        <TrafficOverviewDeferred class="col-span-full md:col-span-6 lg:col-span-8" />
        <Demographics class="col-span-full md:col-span-6 lg:col-span-4" />
        <TopEditorial class="col-span-full" />
      </div>
    </div>
  );
}
