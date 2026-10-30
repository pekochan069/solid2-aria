/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/app/(app)/(root)/cards/index.tsx.
 * Modified for Solid Aria: Solid 2 JSX, local registry imports, and native attributes.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { AccountAccess as SkeletonAccountAccess } from "./skeleton/account-access";
import { AnalyticsCard as SkeletonAnalyticsCard } from "./skeleton/analytics-card";
import { ClaimableBalance as SkeletonClaimableBalance } from "./skeleton/claimable-balance";
import { ContributionHistory as SkeletonContributionHistory } from "./skeleton/contribution-history";
import { DividendIncome as SkeletonDividendIncome } from "./skeleton/dividend-income";
import { EmptyDistributeTrack as SkeletonEmptyDistributeTrack } from "./skeleton/empty-distribute-track";
import { NewMilestone as SkeletonNewMilestone } from "./skeleton/new-milestone";
import { NotificationSettings as SkeletonNotificationSettings } from "./skeleton/notification-settings";
import { Payments as SkeletonPayments } from "./skeleton/payments";
import { PayoutThreshold as SkeletonPayoutThreshold } from "./skeleton/payout-threshold";
import { PowerUsage as SkeletonPowerUsage } from "./skeleton/power-usage";
import { QrConnect as SkeletonQrConnect } from "./skeleton/qr-connect";
import { SavingsTargets as SkeletonSavingsTargets } from "./skeleton/savings-targets";
import { TransferFunds as SkeletonTransferFunds } from "./skeleton/transfer-funds";
import { UIElements as SkeletonUIElements } from "./skeleton/ui-elements";

export function CardsSkeletonRails() {
  return (
    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-x-0 top-12 z-10 hidden min-[2200px]:block [&_[data-slot=skeleton]:nth-child(even)]:hidden"
    >
      <div class="absolute top-0 left-[calc(50%-950px-var(--rail-width)-var(--gap))] grid w-(--rail-width) grid-cols-[repeat(2,var(--rail-column))] gap-(--gap) opacity-50 [--rail-column:20rem] [--rail-width:calc(var(--rail-column)*2+var(--gap))]">
        <div class="flex flex-col gap-(--gap)">
          <SkeletonContributionHistory />
          <SkeletonClaimableBalance />
          <SkeletonDividendIncome />
          <SkeletonPayoutThreshold />
        </div>
        <div class="flex flex-col gap-(--gap)">
          <SkeletonUIElements />
          <SkeletonSavingsTargets />
          <SkeletonNewMilestone />
          <SkeletonPayoutThreshold />
          <SkeletonAccountAccess />
        </div>
      </div>
      <div class="absolute top-0 right-[calc(50%-950px-var(--rail-width)-var(--gap))] grid w-(--rail-width) grid-cols-[repeat(2,var(--rail-column))] gap-(--gap) opacity-50 [--rail-column:20rem] [--rail-width:calc(var(--rail-column)*2+var(--gap))]">
        <div class="flex flex-col gap-(--gap)">
          <SkeletonNewMilestone />
          <SkeletonPayoutThreshold />
          <SkeletonAccountAccess />
          <SkeletonQrConnect />
          <SkeletonTransferFunds />
          <SkeletonPayments />
          <SkeletonEmptyDistributeTrack />
        </div>
        <div class="flex flex-col gap-(--gap)">
          <SkeletonQrConnect />
          <SkeletonTransferFunds />
          <SkeletonPayments />
          <SkeletonEmptyDistributeTrack />
          <SkeletonAnalyticsCard />
          <SkeletonNotificationSettings />
          <SkeletonPowerUsage />
        </div>
      </div>
    </div>
  );
}
