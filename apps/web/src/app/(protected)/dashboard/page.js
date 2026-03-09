"use client";

import { useState } from "react";
import { categorySummaryData } from "../../../lib/static-data";
import Button from "../../components/ui/Button";
import CategorySummaryCard from "../../../features/category-summary/component/CategorySummaryCard";
import ReportOutfitModal from "../../../features/outfits/components/ReportOutfitModal";
import { useClosetItemsQuery } from "@/features/closet/hooks/useClosetItemsQuery";

export default function DashboardPage() {
  const [category, setCategory] = useState("");

  const { data: closetItems, isLoading, error } = useClosetItemsQuery(category);

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
