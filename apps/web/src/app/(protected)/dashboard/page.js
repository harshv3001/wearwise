"use client";

import { useMemo, useState } from "react";
import { Button } from "../../components/ui/actions";
import ReportOutfitModal from "../../../features/outfits/components/ReportOutfitModal/ReportOutfitModal";
import CreateClosetItem from "../../../features/closet/component/CreateClosetItem/CreateClosetItem.jsx";
import { useCurrentUser } from "../../../features/auth/hooks/useCurrentUser";
import { useWeather } from "../../../features/weather/hooks/useWeather";
import { useDashboardSummaryQuery } from "../../../features/dashboard/hooks/useDashboardSummaryQuery";
import {
  getDisplayName,
  getGreetingLabel,
  getSummaryLine,
} from "../../../features/dashboard/dashboardHelper";
import DashboardCategoryCard from "../../../features/dashboard/components/DashboardCategoryCard/DashboardCategoryCard";
import DashboardUsageCard from "../../../features/dashboard/components/DashboardUsageCard/DashboardUsageCard";
import DashboardAiSuggestionCard from "../../../features/dashboard/components/DashboardAiSuggestionCard/DashboardAiSuggestionCard";
import DashboardTodayOutfitCard from "../../../features/dashboard/components/DashboardTodayOutfitCard/DashboardTodayOutfitCard";
import DashboardClosetHealthCard from "../../../features/dashboard/components/DashboardClosetHealthCard/DashboardClosetHealthCard";
import DashboardRecentActivityCard from "../../../features/dashboard/components/DashboardRecentActivityCard/DashboardRecentActivityCard";
import DashboardSummaryChip from "../../../features/dashboard/components/DashboardSummaryChip/DashboardSummaryChip";
import DashboardSummaryChipSkeleton from "../../../features/dashboard/components/DashboardSummaryChipSkeleton/DashboardSummaryChipSkeleton";

export default function DashboardPage() {
  const { data: user, isLoading: isUserLoading } = useCurrentUser();
  const dashboardSummaryQuery = useDashboardSummaryQuery();
  const weatherQuery = useWeather(user?.latitude, user?.longitude);

  const [openReportModal, setOpenReportModal] = useState(false);
  const [openItemModal, setOpenItemModal] = useState(false);

  const displayName = useMemo(() => getDisplayName(user), [user]);
  const greetingLabel = useMemo(() => getGreetingLabel(), []);
  const summaryStats = dashboardSummaryQuery.data?.stats;
  const hasCoordinates =
    typeof user?.latitude === "number" &&
    Number.isFinite(user.latitude) &&
    typeof user?.longitude === "number" &&
    Number.isFinite(user.longitude);

  return (
    <main className="p-4 md:p-6">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <div className="rounded-[28px] border border-[rgba(56,53,59,0.12)] bg-[linear-gradient(135deg,rgba(255,151,140,0.20)_0%,rgba(255,255,255,0.92)_38%,rgba(252,219,144,0.16)_100%)] px-5 py-6 shadow-[0_16px_38px_rgba(67,45,41,0.08)] md:px-7 md:py-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <div className="mb-2 text-[0.82rem] font-semibold uppercase tracking-[0.16em] text-[var(--ww-text-secondary)]">
                Dashboard
              </div>

              {isUserLoading ? (
                <div className="space-y-3">
                  <div className="h-[52px] w-[320px] animate-pulse rounded-2xl bg-[rgba(255,255,255,0.75)]" />
                  <div className="h-6 w-[78%] animate-pulse rounded-2xl bg-[rgba(255,255,255,0.65)]" />
                </div>
              ) : (
                <>
                  <h1 className="m-0 text-[2rem] font-extrabold leading-tight text-[var(--ww-text-primary)] md:text-[2.6rem]">
                    {greetingLabel}, {displayName}
                  </h1>
                  <p className="mt-2 max-w-3xl text-[1rem] leading-7 text-[var(--ww-text-secondary)]">
                    {getSummaryLine(
                      summaryStats,
                      dashboardSummaryQuery.isError && !summaryStats
                    )}
                  </p>
                </>
              )}

              <div className="mt-4 flex flex-wrap gap-3">
                {dashboardSummaryQuery.isLoading ? (
                  <>
                    <DashboardSummaryChipSkeleton />
                    <DashboardSummaryChipSkeleton />
                    <DashboardSummaryChipSkeleton />
                  </>
                ) : dashboardSummaryQuery.isError && !summaryStats ? (
                  <div className="rounded-full border border-[rgba(56,53,59,0.08)] bg-white px-4 py-2 text-sm text-[var(--ww-text-secondary)] shadow-sm">
                    Summary insights unavailable right now
                  </div>
                ) : (
                  <>
                    <DashboardSummaryChip
                      label="Logged today"
                      value={summaryStats?.logged_today_count ?? 0}
                      tone="accent"
                    />
                    <DashboardSummaryChip
                      label="Saved outfits"
                      value={summaryStats?.saved_outfits_count ?? 0}
                      tone="highlight"
                    />
                    <DashboardSummaryChip
                      label="Closet items"
                      value={summaryStats?.total_closet_items ?? 0}
                    />
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
              <Button
                variant="primary"
                size="lg"
                className="font-bold"
                onClick={() => setOpenReportModal(true)}
              >
                Report outfit
              </Button>
              <Button
                variant="tertiary"
                size="lg"
                onClick={() => setOpenItemModal(true)}
              >
                Add clothing item
              </Button>
            </div>
          </div>
        </div>

        <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.05fr_0.9fr_1.35fr]">
          <DashboardCategoryCard
            categoryCounts={dashboardSummaryQuery.data?.category_counts}
            isLoading={dashboardSummaryQuery.isLoading}
            isError={dashboardSummaryQuery.isError}
          />

          <DashboardUsageCard
            mostUsedItems={dashboardSummaryQuery.data?.most_used_items}
            leastUsedItems={dashboardSummaryQuery.data?.least_used_items}
            isLoading={dashboardSummaryQuery.isLoading}
            isError={dashboardSummaryQuery.isError}
          />

          <DashboardAiSuggestionCard
            weather={weatherQuery.data}
            isWeatherLoading={
              isUserLoading || (hasCoordinates && weatherQuery.isLoading)
            }
            isWeatherError={weatherQuery.isError}
          />
        </section>

        <section className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <DashboardTodayOutfitCard
            todayOutfit={dashboardSummaryQuery.data?.today_logged_outfit}
            isLoading={dashboardSummaryQuery.isLoading}
            isError={dashboardSummaryQuery.isError}
            onReportOutfit={() => setOpenReportModal(true)}
          />

          <DashboardClosetHealthCard
            closetHealth={dashboardSummaryQuery.data?.closet_health}
            isLoading={dashboardSummaryQuery.isLoading}
            isError={dashboardSummaryQuery.isError}
          />

          <DashboardRecentActivityCard
            recentActivity={dashboardSummaryQuery.data?.recent_activity}
            stats={dashboardSummaryQuery.data?.stats}
            isLoading={dashboardSummaryQuery.isLoading}
            isError={dashboardSummaryQuery.isError}
          />
        </section>
      </section>

      <ReportOutfitModal
        open={openReportModal}
        onClose={() => setOpenReportModal(false)}
      />
      <CreateClosetItem
        open={openItemModal}
        onClose={() => setOpenItemModal(false)}
      />
    </main>
  );
}
