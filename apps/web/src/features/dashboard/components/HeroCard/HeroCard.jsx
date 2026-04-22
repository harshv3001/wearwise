"use client";

import { useMemo } from "react";
import { getDisplayName, getGreetingLabel } from "../../dashboardHelper";
import SummaryChip from "../SummaryChip/SummaryChip";
import SummaryChipSkeleton from "../SummaryChip/SummaryChipSkeleton/SummaryChipSkeleton";
import { Button } from "@/app/components/ui/actions";

export default function HeroCard({
  setOpenItemModal,
  setOpenReportModal,
  dashboardSummaryQuery,
  user,
  isUserLoading,
}) {
  const displayName = useMemo(() => getDisplayName(user), [user]);
  const greetingLabel = useMemo(() => getGreetingLabel(), []);
  const summaryStats = dashboardSummaryQuery?.data?.stats;

  return (
    <section className="rounded-[24px] border border-[rgba(56,53,59,0.12)] bg-[linear-gradient(135deg,rgba(255,151,140,0.18)_0%,rgba(255,255,255,0.94)_36%,rgba(252,219,144,0.15)_100%)] px-4 py-4 shadow-[0_12px_28px_rgba(67,45,41,0.07)] md:px-5 md:py-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          {isUserLoading ? (
            <div className="space-y-2">
              <div className="h-[44px] w-[280px] animate-pulse rounded-2xl bg-[rgba(255,255,255,0.75)]" />
              <div className="h-5 w-[70%] animate-pulse rounded-2xl bg-[rgba(255,255,255,0.65)]" />
            </div>
          ) : (
            <>
              <h1 className="m-0 text-[1.85rem] font-extrabold leading-tight text-[var(--ww-text-primary)] md:text-[1.5rem]">
                {greetingLabel}, {displayName}
              </h1>
            </>
          )}

          <div className="mt-3 flex flex-wrap gap-2.5">
            {dashboardSummaryQuery.isLoading ? (
              <>
                <SummaryChipSkeleton />
                <SummaryChipSkeleton />
                <SummaryChipSkeleton />
              </>
            ) : dashboardSummaryQuery.isError && !summaryStats ? (
              <div className="rounded-full border border-[rgba(56,53,59,0.08)] bg-white px-4 py-2 text-sm text-[var(--ww-text-secondary)] shadow-sm">
                Summary insights unavailable right now
              </div>
            ) : (
              <>
                <SummaryChip
                  label="Logged today"
                  value={summaryStats?.logged_today_count ?? 0}
                  tone="accent"
                />
                <SummaryChip
                  label="Saved outfits"
                  value={summaryStats?.saved_outfits_count ?? 0}
                  tone="highlight"
                />
                <SummaryChip
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
    </section>
  );
}
