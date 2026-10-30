/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/app/(app)/(root)/cards/index.tsx.
 * Modified for Solid Aria: Solid 2 card compositions, local Aria components, and responsive CSS gallery columns.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { AccountAccess } from "./account-access";
import { AnalyticsCard } from "./analytics-card";
import { ChatDemo } from "./chat-demo";
import { ClaimableBalance } from "./claimable-balance";
import { ContributionHistory } from "./contribution-history";
import { DividendIncome } from "./dividend-income";
import { EmptyDistributeTrack } from "./empty-distribute-track";
import { NewMilestone } from "./new-milestone";
import { NotificationSettings } from "./notification-settings";
import { Payments } from "./payments";
import { PayoutThreshold } from "./payout-threshold";
import { PowerUsage } from "./power-usage";
import { QrConnect } from "./qr-connect";
import { SavingsTargets } from "./savings-targets";
import { SidebarNav } from "./sidebar-nav";
import { CardsSkeletonRails } from "./skeleton-rails";
import { UIElements } from "./ui-elements";

export function CardsDemo() {
  return (
    <div class="cards-demo style-rhea" data-slot="demo">
      <CardsSkeletonRails />
      <div class="cards-grid">
        <div class="cards-column">
          <UIElements />
          <SidebarNav />
          <SavingsTargets />
        </div>
        <div class="cards-column contribution-column">
          <ContributionHistory />
          <ClaimableBalance />
          <DividendIncome />
        </div>
        <div class="cards-column milestone-column">
          <NewMilestone />
          <PayoutThreshold />
          <AccountAccess />
        </div>
        <div class="cards-column chat-column">
          <QrConnect />
          <ChatDemo />
          <Payments />
        </div>
        <div class="cards-column analytics-column">
          <EmptyDistributeTrack />
          <AnalyticsCard />
          <NotificationSettings />
          <PowerUsage />
        </div>
      </div>
    </div>
  );
}
