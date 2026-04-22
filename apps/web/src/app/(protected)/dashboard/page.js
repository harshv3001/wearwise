"use client";

import { useState } from "react";
import ReportOutfitModal from "../../../features/outfits/components/ReportOutfitModal/ReportOutfitModal";
import CreateClosetItem from "../../../features/closet/component/CreateClosetItem/CreateClosetItem.jsx";
import { useCurrentUser } from "../../../features/auth/hooks/useCurrentUser";
import { useDashboardSummaryQuery } from "../../../features/dashboard/hooks/useDashboardSummaryQuery";

import CategoryCard from "../../../features/dashboard/components/CategoryCard/CategoryCard";
import UsageCard from "../../../features/dashboard/components/UsageCard/UsageCard";
import AISuggestionPanel from "../../../features/AISuggestion/AISuggestionPanel";
import TodayOutfitCard from "../../../features/dashboard/components/TodayOutfitCard/TodayOutfitCard";
import ClosetHealthCard from "../../../features/dashboard/components/ClosetHealthCard/ClosetHealthCard";
import HeroCard from "@/features/dashboard/components/HeroCard/HeroCard";

export default function DashboardPage() {
  const { data: user, isLoading: isUserLoading } = useCurrentUser();
  const dashboardSummaryQuery = useDashboardSummaryQuery();

  const [openReportModal, setOpenReportModal] = useState(false);
  const [openItemModal, setOpenItemModal] = useState(false);

  return (
    <main className="p-3 md:p-4">
      <section className="mx-auto flex w-full max-w-[1500px] flex-col gap-4">
        <HeroCard
          setOpenReportModal={setOpenReportModal}
          setOpenItemModal={setOpenItemModal}
          user={user}
          dashboardSummaryQuery={dashboardSummaryQuery}
          isUserLoading={isUserLoading}
        />
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-[0.9fr_1.15fr_0.95fr]">
          <div className="flex flex-col gap-4">
            <CategoryCard
              categoryCounts={dashboardSummaryQuery.data?.category_counts}
              isLoading={dashboardSummaryQuery.isLoading}
              isError={dashboardSummaryQuery.isError}
            />

            <ClosetHealthCard
              closetHealth={dashboardSummaryQuery.data?.closet_health}
              isLoading={dashboardSummaryQuery.isLoading}
              isError={dashboardSummaryQuery.isError}
            />
          </div>

          <UsageCard
            mostUsedItems={dashboardSummaryQuery.data?.most_used_items}
            leastUsedItems={dashboardSummaryQuery.data?.least_used_items}
            isLoading={dashboardSummaryQuery.isLoading}
            isError={dashboardSummaryQuery.isError}
          />

          <div className="flex flex-col gap-4">
            <TodayOutfitCard
              todayOutfit={dashboardSummaryQuery.data?.today_logged_outfit}
              isLoading={dashboardSummaryQuery.isLoading}
              isError={dashboardSummaryQuery.isError}
              onReportOutfit={() => setOpenReportModal(true)}
            />

            {/* <RecentActivityCard
              recentActivity={dashboardSummaryQuery.data?.recent_activity}
              stats={dashboardSummaryQuery.data?.stats}
              isLoading={dashboardSummaryQuery.isLoading}
              isError={dashboardSummaryQuery.isError}
            /> */}
          </div>
        </section>
      </section>

      <AISuggestionPanel
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
