"use client";

import { useState } from "react";
import { categorySummaryData } from "../../../lib/static-data";
import Button from "../../components/ui/Button";
import CategorySummaryCard from "../../../features/category-summary/component/CategorySummaryCard";
import ReportOutfitModal from "../../../features/outfits/components/ReportOutfitModal";
import CreateClosetItem from "../../../features/closet/component/CreateClosetItem.jsx";
import { useCurrentUser } from "../../../features/auth/hooks/useCurrentUser";
import { useWeather } from "../../../features/weather/hooks/useWeather";
import WeatherCard from "../../../features/weather/components/WeatherCard";

export default function DashboardPage() {
  const { data: user, isLoading: isUserLoading } = useCurrentUser();
  const weatherQuery = useWeather(user?.latitude, user?.longitude);

  const [openReportModal, setOpenReportModal] = useState(false);
  const [openItemModal, setOpenItemModal] = useState(false);

  return (
    <main className="p-6">
      <div className="m-2 flex flex-col gap-4 items-center justify-center">
        <div className="border-1 border-black-100 rounded-lg p-4 w-full text-center mb-4">
          <Button
            variant="primary"
            size="xxl"
            className="font-bold"
            onClick={() => setOpenReportModal(true)}
          >
            Report outfit
          </Button>
        </div>
      </div>
      <section className="m-2 mb-6">
        <WeatherCard
          user={user}
          weather={weatherQuery.data}
          isLoading={isUserLoading || weatherQuery.isLoading}
          isError={weatherQuery.isError}
        />
      </section>
      <section className="flex flex-wrap gap-4 justify-center">
        <CategorySummaryCard items={categorySummaryData} />
        {/* <CategorySummaryCard items={categorySummaryData} />
        <CategorySummaryCard items={categorySummaryData} /> */}
      </section>
      <div className="m-2 flex flex-col gap-4 items-center justify-center">
        <Button
          variant="secondary"
          size="xl"
          onClick={() => setOpenItemModal(true)}
          className="mt-4 me-auto"
        >
          Add new clothing item
        </Button>
      </div>
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
