"use client";

import { useState } from "react";
import ReportOutfitModal from "../../../features/outfits/components/ReportOutfitModal/ReportOutfitModal";
import CreateClosetItem from "../../../features/closet/component/CreateClosetItem/CreateClosetItem.jsx";
import { useCurrentUser } from "../../../features/auth/hooks/useCurrentUser";
import { useDashboardSummaryQuery } from "../../../features/dashboard/hooks/useDashboardSummaryQuery";

import DashboardCategoryCard from "../../../features/dashboard/components/DashboardCategoryCard/DashboardCategoryCard";
import DashboardUsageCard from "../../../features/dashboard/components/DashboardUsageCard/DashboardUsageCard";
import DashboardAiSuggestionPanel from "../../../features/dashboard/components/DashboardAiSuggestionPanel/DashboardAiSuggestionPanel";
import DashboardTodayOutfitCard from "../../../features/dashboard/components/DashboardTodayOutfitCard/DashboardTodayOutfitCard";
import DashboardClosetHealthCard from "../../../features/dashboard/components/DashboardClosetHealthCard/DashboardClosetHealthCard";
import DashboardHeroCard from "@/features/dashboard/components/DashboardHeroCard/DashboardHeroCard";

export default function DashboardPage() {
  const { data: user, isLoading: isUserLoading } = useCurrentUser();
  const dashboardSummaryQuery = useDashboardSummaryQuery();

  const [openReportModal, setOpenReportModal] = useState(false);
  const [openItemModal, setOpenItemModal] = useState(false);

  return (
    <main className="p-3 md:p-4">
      <section className="mx-auto flex w-full max-w-[1500px] flex-col gap-4">
        <DashboardHeroCard
          setOpenReportModal={setOpenReportModal}
          setOpenItemModal={setOpenItemModal}
          user={user}
          dashboardSummaryQuery={dashboardSummaryQuery}
          isUserLoading={isUserLoading}
        />
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-[0.9fr_1.15fr_0.95fr]">
          <div className="flex flex-col gap-4">
            <DashboardCategoryCard
              categoryCounts={dashboardSummaryQuery.data?.category_counts}
              isLoading={dashboardSummaryQuery.isLoading}
              isError={dashboardSummaryQuery.isError}
            />

            <DashboardClosetHealthCard
              closetHealth={dashboardSummaryQuery.data?.closet_health}
              isLoading={dashboardSummaryQuery.isLoading}
              isError={dashboardSummaryQuery.isError}
            />
          </div>

          <DashboardUsageCard
            mostUsedItems={dashboardSummaryQuery.data?.most_used_items}
            leastUsedItems={dashboardSummaryQuery.data?.least_used_items}
            isLoading={dashboardSummaryQuery.isLoading}
            isError={dashboardSummaryQuery.isError}
          />

          <div className="flex flex-col gap-4">
            <DashboardTodayOutfitCard
              todayOutfit={dashboardSummaryQuery.data?.today_logged_outfit}
              isLoading={dashboardSummaryQuery.isLoading}
              isError={dashboardSummaryQuery.isError}
              onReportOutfit={() => setOpenReportModal(true)}
            />

            {/* <DashboardRecentActivityCard
              recentActivity={dashboardSummaryQuery.data?.recent_activity}
              stats={dashboardSummaryQuery.data?.stats}
              isLoading={dashboardSummaryQuery.isLoading}
              isError={dashboardSummaryQuery.isError}
            /> */}
          </div>
        </section>
      </section>

      <DashboardAiSuggestionPanel
        latitude={user?.latitude}
        longitude={user?.longitude}
        isUserLoading={isUserLoading}
      />

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
