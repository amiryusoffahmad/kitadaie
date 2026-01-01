import { Suspense } from "react";
import { PageContainer, PageHeader, LoadingState } from "@/components/admin";
import { SendNotificationForm } from "./_components/SendNotificationForm";

export const metadata = {
  title: "Send Notification | Admin",
  description: "Send a notification to users",
};

export default function SendNotificationPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Send Notification"
        description="Create and send a notification to users, departments, or roles"
      />

      <Suspense fallback={<LoadingState />}>
        <SendNotificationForm />
      </Suspense>
    </PageContainer>
  );
}
