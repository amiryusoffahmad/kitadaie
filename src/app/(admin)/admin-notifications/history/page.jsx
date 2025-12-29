import { Suspense } from "react";
import { PageContainer, PageHeader, LoadingState } from "@/components/admin";
import { HistoryList } from "./_components/HistoryList";

export const metadata = {
  title: "Notification History | Admin",
  description: "View sent and scheduled notifications",
};

export default function NotificationHistoryPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Notification History"
        description="View and manage all sent, scheduled, and recurring notifications"
      />

      <Suspense fallback={<LoadingState />}>
        <HistoryList />
      </Suspense>
    </PageContainer>
  );
}
