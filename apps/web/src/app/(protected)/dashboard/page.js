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
    <main className="p-3 md:p-4">
      <section className="mx-auto flex w-full max-w-[1500px] flex-col gap-4">
        <div className="rounded-[24px] border border-[rgba(56,53,59,0.12)] bg-[linear-gradient(135deg,rgba(255,151,140,0.18)_0%,rgba(255,255,255,0.94)_36%,rgba(252,219,144,0.15)_100%)] px-4 py-4 shadow-[0_12px_28px_rgba(67,45,41,0.07)] md:px-5 md:py-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <div className="mb-1 text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-[var(--ww-text-secondary)]">
                Dashboard
              </div>

              {isUserLoading ? (
                <div className="space-y-2">
                  <div className="h-[44px] w-[280px] animate-pulse rounded-2xl bg-[rgba(255,255,255,0.75)]" />
                  <div className="h-5 w-[70%] animate-pulse rounded-2xl bg-[rgba(255,255,255,0.65)]" />
                </div>
              ) : (
                <>
                  <h1 className="m-0 text-[1.85rem] font-extrabold leading-tight text-[var(--ww-text-primary)] md:text-[2.3rem]">
                    {greetingLabel}, {displayName}
                  </h1>
                  <p className="mt-1.5 max-w-3xl text-[0.94rem] leading-6 text-[var(--ww-text-secondary)]">
                    {getSummaryLine(
                      summaryStats,
                      dashboardSummaryQuery.isError && !summaryStats
                    )}
                  </p>
                </>
              )}

              <div className="mt-3 flex flex-wrap gap-2.5">
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

            <div className="flex flex-col gap-2.5 sm:flex-row lg:justify-end">
              <Button
                variant="primary"
                size="md"
                className="font-bold"
                onClick={() => setOpenReportModal(true)}
              >
                Report outfit
              </Button>
              <Button
                variant="tertiary"
                size="md"
                onClick={() => setOpenItemModal(true)}
              >
                Add clothing item
              </Button>
            </div>
          </div>
        </div>

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-[0.95fr_0.95fr_1.2fr]">
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

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
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
