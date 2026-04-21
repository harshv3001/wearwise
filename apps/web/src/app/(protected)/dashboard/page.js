"use client";

import { useState } from "react";
import { FloatingSidePanel } from "../../components/ui/overlays";
import ReportOutfitModal from "../../../features/outfits/components/ReportOutfitModal/ReportOutfitModal";
import CreateClosetItem from "../../../features/closet/component/CreateClosetItem/CreateClosetItem.jsx";
import { useCurrentUser } from "../../../features/auth/hooks/useCurrentUser";
import { useWeather } from "../../../features/weather/hooks/useWeather";
import { useDashboardSummaryQuery } from "../../../features/dashboard/hooks/useDashboardSummaryQuery";

import DashboardCategoryCard from "../../../features/dashboard/components/DashboardCategoryCard/DashboardCategoryCard";
import DashboardUsageCard from "../../../features/dashboard/components/DashboardUsageCard/DashboardUsageCard";
import DashboardAiSuggestionCard from "../../../features/dashboard/components/DashboardAiSuggestionCard/DashboardAiSuggestionCard";
import DashboardTodayOutfitCard from "../../../features/dashboard/components/DashboardTodayOutfitCard/DashboardTodayOutfitCard";
import DashboardClosetHealthCard from "../../../features/dashboard/components/DashboardClosetHealthCard/DashboardClosetHealthCard";
import DashboardRecentActivityCard from "../../../features/dashboard/components/DashboardRecentActivityCard/DashboardRecentActivityCard";
import DashboardHeroCard from "@/features/dashboard/components/DashboardHeroCard/DashboardHeroCard";

export default function DashboardPage() {
  const { data: user, isLoading: isUserLoading } = useCurrentUser();
  const dashboardSummaryQuery = useDashboardSummaryQuery();

  const [openReportModal, setOpenReportModal] = useState(false);
  const [openItemModal, setOpenItemModal] = useState(false);
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);

  const weatherQuery = useWeather(user?.latitude, user?.longitude, {
    enabled: isAiPanelOpen,
  });

  const hasCoordinates =
    typeof user?.latitude === "number" &&
    Number.isFinite(user.latitude) &&
    typeof user?.longitude === "number" &&
    Number.isFinite(user.longitude);

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

      <FloatingSidePanel
        open={isAiPanelOpen}
        onToggle={() => setIsAiPanelOpen((current) => !current)}
        onClose={() => setIsAiPanelOpen(false)}
        triggerLabel="AI Suggestions"
      >
        <DashboardAiSuggestionCard
          weather={weatherQuery.data}
          isWeatherLoading={
            isAiPanelOpen &&
            (isUserLoading || (hasCoordinates && weatherQuery.isLoading))
          }
          isWeatherError={weatherQuery.isError}
        />
      </FloatingSidePanel>

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
