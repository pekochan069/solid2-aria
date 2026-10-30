/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/blocks/preview-02/index.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { AccountAccess } from "./cards/account-access";
import { CardOverview } from "./cards/card-overview";
import { ClaimableBalance } from "./cards/claimable-balance";
import { ContributionHistory } from "./cards/contribution-history";
import { CoverArt } from "./cards/cover-art";
import { DividendIncome } from "./cards/dividend-income";
import { EmptyConnectBank } from "./cards/empty-connect-bank";
import { EmptyDistributeTrack } from "./cards/empty-distribute-track";
import { EmptyExploreCatalog } from "./cards/empty-explore-catalog";
import { Faq } from "./cards/faq";
import { FrontDoor } from "./cards/front-door";
import { IndexInvesting } from "./cards/index-investing";
import { KitchenIsland } from "./cards/kitchen-island";
import { LoadingCard } from "./cards/loading-card";
import { NewMilestone } from "./cards/new-milestone";
import { NotificationSettings } from "./cards/notification-settings";
import { Payments } from "./cards/payments";
import { PayoutThreshold } from "./cards/payout-threshold";
import { PowerUsage } from "./cards/power-usage";
import { Preferences } from "./cards/preferences";
import { QrConnect } from "./cards/qr-connect";
import { ReceivingMethod } from "./cards/receiving-method";
import { RecentTransactions } from "./cards/recent-transactions";
import { ReleaseCatalog } from "./cards/release-catalog";
import { RollerShades } from "./cards/roller-shades";
import { SavingsProgress } from "./cards/savings-progress";
import { SavingsTargets } from "./cards/savings-targets";
import { SidebarNav } from "./cards/sidebar-nav";
import { SocialLinks } from "./cards/social-links";
import { StockPerformance } from "./cards/stock-performance";
import { SyncingState } from "./cards/syncing-state";
import { TransferFunds } from "./cards/transfer-funds";
import { UpcomingPayments } from "./cards/upcoming-payments";

export default function Preview02Example() {
  return (
    <div class="bg-muted 3xl:[--gap:--spacing(12)] dark:bg-background style-lyra:md:[--gap:--spacing(6)] style-mira:md:[--gap:--spacing(6)] overflow-x-auto overflow-y-hidden contain-[paint] [--gap:--spacing(4)] md:[--gap:--spacing(10)]">
      <div class="flex w-full min-w-max justify-center">
        <div
          class="bg-muted dark:bg-background style-lyra:md:w-[2600px] style-mira:md:w-[2600px] grid w-[2400px] grid-cols-7 items-start gap-(--gap) p-(--gap) md:w-[3000px] *:[div]:gap-(--gap)"
          data-slot="capture-target"
        >
          <div class="flex flex-col p-1 [contain-intrinsic-size:380px_1200px] [content-visibility:auto]">
            <ContributionHistory />
            <EmptyDistributeTrack />
            <QrConnect />
            <DividendIncome />
            <IndexInvesting />
            <SyncingState />
          </div>
          <div class="flex flex-col p-1 [contain-intrinsic-size:380px_1200px] [content-visibility:auto]">
            <PayoutThreshold />
            <ClaimableBalance />
            <Preferences />
            <SavingsProgress />
            <KitchenIsland />
          </div>
          <div class="col-span-2 flex flex-col p-1 [contain-intrinsic-size:760px_1200px] [content-visibility:auto]">
            <SavingsTargets />
            <RecentTransactions />
            <div class="grid grid-cols-2 items-start gap-(--gap)">
              <div class="flex flex-col gap-(--gap)">
                <SidebarNav />
                <Faq />
              </div>
              <div class="flex flex-col gap-(--gap)">
                <Payments />
                <FrontDoor />
              </div>
            </div>
            <ReleaseCatalog />
          </div>
          <div class="flex flex-col p-1 [contain-intrinsic-size:380px_1200px] [content-visibility:auto]">
            <AccountAccess />
            <CardOverview />
            <TransferFunds />
            <CoverArt />
            <LoadingCard />
          </div>
          <div class="flex flex-col p-1 [contain-intrinsic-size:380px_1200px] [content-visibility:auto]">
            <ReceivingMethod />
            <PowerUsage />
            <EmptyConnectBank />
            <UpcomingPayments />
            <RollerShades />
          </div>
          <div class="flex flex-col p-1 [contain-intrinsic-size:380px_1200px] [content-visibility:auto]">
            <StockPerformance />
            <EmptyExploreCatalog />
            <NewMilestone />
            <SocialLinks />
            <NotificationSettings />
          </div>
        </div>
      </div>
    </div>
  );
}
