"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getApiErrorMessage } from "../../../lib/apiError";
import { getClosetItemsApi } from "../../../features/closet/api/closetApi";
import { categorySummaryData } from "../../../lib/static-data";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card/Card";
import CategorySummaryCard from "../../../features/category-summary/component/CategorySummaryCard";
import ReportOutfitModal from "../../../features/outfits/components/ReportOutfitModal";

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["closet-items"],
    queryFn: getClosetItemsApi,
  });

  const [openReportModal, setOpenReportModal] = useState(false);

  return (
    <main className="p-6">
      <div className="m-2 flex flex-col gap-4 items-center justify-center">
        <Button
          variant="primary"
          size="xxl"
          className="font-bold"
          onClick={() => setOpenReportModal(true)}
        >
          Report outfit
        </Button>
      </div>
      <section className="flex flex-wrap gap-4 justify-center">
        <CategorySummaryCard items={categorySummaryData} />
        <CategorySummaryCard items={categorySummaryData} />
        <CategorySummaryCard items={categorySummaryData} />
      </section>
      <div className="m-2 flex flex-col gap-4 items-center justify-center">
        <Button variant="secondary" size="xl">
          Add new clothing item
        </Button>
        <Button variant="tertiary">Go to Closet</Button>
        <Button variant="default">Default</Button>
        <Button variant="custom" size="lg">
          Custom
        </Button>
      </div>

      <ReportOutfitModal
        open={openReportModal}
        onClose={() => setOpenReportModal(false)}
      />
    </main>
  );
}
