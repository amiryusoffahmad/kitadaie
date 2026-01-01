import { Suspense } from "react";
import { PageContainer, PageHeader, LoadingState } from "@/components/admin";
import { NotificationDetail } from "./_components/NotificationDetail";

export const metadata = {
  title: "Notification Details | Admin",
  description: "View notification details and recipients",
};

export default function NotificationDetailPage({ params }) {
  return (
    <PageContainer>
      <PageHeader
        title="Notification Details"
        description="View full notification details, recipients, and history"
      />

      <Suspense fallback={<LoadingState />}>
        <NotificationDetail notificationId={params.id} />
      </Suspense>
    </PageContainer>
  );
}
