/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/app/(app)/(root)/cards/analytics-card.tsx.
 * Modified for Solid Aria: Solid 2 JSX, local Solid2 Aria components, native attributes, and Lucide icons.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { Badge } from "../../registry/ui/badge";
import { Button } from "../../registry/ui/button";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../registry/ui/card";

const areaPath = "M0 52L18 40L36 46L54 70L72 50L100 49V86H0Z";
const strokePath = "M0 52L18 40L36 46L54 70L72 50L100 49";

export function AnalyticsCard() {
  return (
    <Card class="mx-auto w-full max-w-sm data-[size=sm]:pb-0" size="sm">
      <CardHeader>
        <CardTitle>Analytics</CardTitle>
        <CardDescription>
          418.2K Visitors <Badge>+10%</Badge>
        </CardDescription>
        <CardAction>
          <Button variant="outline" size="sm">
            View Analytics
          </Button>
        </CardAction>
      </CardHeader>
      <svg
        viewBox="0 0 100 86"
        preserveAspectRatio="none"
        class="text-chart-1 aspect-[1/0.35] w-full"
        role="img"
        aria-label="Visitor trend"
      >
        <path d={areaPath} fill="currentColor" opacity="0.28" />
        <path
          d={strokePath}
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          vector-effect="non-scaling-stroke"
        />
      </svg>
    </Card>
  );
}
