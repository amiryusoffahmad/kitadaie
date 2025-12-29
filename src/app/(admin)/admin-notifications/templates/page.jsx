import { Suspense } from "react";
import { PageContainer, PageHeader, LoadingState } from "@/components/admin";
import { TemplatesList } from "./_components/TemplatesList";

export const metadata = {
  title: "Notification Templates | Admin",
  description: "Manage reusable notification templates",
};

export default function NotificationTemplatesPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Notification Templates"
        description="Create and manage reusable notification templates for quick sending"
      />

      <Suspense fallback={<LoadingState />}>
        <TemplatesList />
      </Suspense>
    </PageContainer>
  );
}
