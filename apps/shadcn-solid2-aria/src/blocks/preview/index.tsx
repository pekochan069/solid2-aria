/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/blocks/preview/index.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { ActivateAgentDialog } from "./cards/activate-agent-dialog";
import { AnalyticsCard } from "./cards/analytics-card";
import { AnomalyAlert } from "./cards/anomaly-alert";
import { BarChartCard } from "./cards/bar-chart-card";
import { BookAppointment } from "./cards/book-appointment";
import { CodespacesCard } from "./cards/codespaces-card";
import { ContributionsActivity } from "./cards/contributions-activity";
import { Contributors } from "./cards/contributors";
import { EnvironmentVariables } from "./cards/environment-variables";
import { FeedbackForm } from "./cards/feedback-form";
import { FileUpload } from "./cards/file-upload";
import { GithubProfile } from "./cards/github-profile";
import { IconPreviewGrid } from "./cards/icon-preview-grid";
import { InviteTeam } from "./cards/invite-team";
import { Invoice } from "./cards/invoice";
import { LiveWaveformCard } from "./cards/live-waveform";
import { NoTeamMembers } from "./cards/no-team-members";
import { NotFound } from "./cards/not-found";
import { ObservabilityCard } from "./cards/observability-card";
import { PieChartCard } from "./cards/pie-chart-card";
import { ReportBug } from "./cards/report-bug";
import { ShippingAddress } from "./cards/shipping-address";
import { Shortcuts } from "./cards/shortcuts";
import { SkeletonLoading } from "./cards/skeleton-loading";
import { SleepReport } from "./cards/sleep-report";
import { StyleOverview } from "./cards/style-overview";
import { TypographySpecimen } from "./cards/typography-specimen";
import { UIElements } from "./cards/ui-elements";
import { UsageCard } from "./cards/usage-card";
import { Visitors } from "./cards/visitors";
import { WeeklyFitnessSummary } from "./cards/weekly-fitness-summary";

export default function PreviewExample() {
  return (
    <div class="bg-muted 3xl:[--gap:--spacing(12)] dark:bg-background style-lyra:md:[--gap:--spacing(6)] style-mira:md:[--gap:--spacing(6)] overflow-x-auto overflow-y-hidden contain-[paint] [--gap:--spacing(4)] md:[--gap:--spacing(10)]">
      <div class="flex w-full min-w-max justify-center">
        <div
          class="bg-muted dark:bg-background style-lyra:md:w-[2600px] style-mira:md:w-[2600px] grid w-[2400px] grid-cols-7 items-start gap-(--gap) p-(--gap) md:w-[3000px] *:[div]:gap-(--gap)"
          data-slot="capture-target"
        >
          <div class="flex flex-col p-px [contain-intrinsic-size:380px_1200px] [content-visibility:auto]">
            <StyleOverview />
            <TypographySpecimen />
            <div class="md:hidden">
              <UIElements />
            </div>
            <CodespacesCard />
            <Invoice />
          </div>
          <div class="flex flex-col p-px [contain-intrinsic-size:380px_1200px] [content-visibility:auto]">
            <IconPreviewGrid />
            <div class="hidden w-full md:flex">
              <UIElements />
            </div>
            <ObservabilityCard />
            <ShippingAddress />
          </div>
          <div class="flex flex-col p-px [contain-intrinsic-size:380px_1200px] [content-visibility:auto]">
            <EnvironmentVariables />
            <BarChartCard />
            <InviteTeam />
            <ActivateAgentDialog />
          </div>
          <div class="flex flex-col p-px [contain-intrinsic-size:380px_1200px] [content-visibility:auto]">
            <SkeletonLoading />
            <PieChartCard />
            <NoTeamMembers />
            <ReportBug />
            <Contributors />
          </div>
          <div class="flex flex-col p-px [contain-intrinsic-size:380px_1200px] [content-visibility:auto]">
            <FeedbackForm />
            <BookAppointment />
            <SleepReport />
            <GithubProfile />
          </div>
          <div class="flex flex-col p-px [contain-intrinsic-size:380px_1200px] [content-visibility:auto]">
            <WeeklyFitnessSummary />
            <FileUpload />
            <AnalyticsCard />
            <UsageCard />
            <Shortcuts />
          </div>
          <div class="flex flex-col p-px [contain-intrinsic-size:380px_1200px] [content-visibility:auto]">
            <AnomalyAlert />
            <LiveWaveformCard />
            <Visitors />
            <ContributionsActivity />
            <NotFound />
          </div>
        </div>
      </div>
    </div>
  );
}
