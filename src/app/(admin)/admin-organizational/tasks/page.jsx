import { PageContainer, PageHeader, LoadingState } from "@/components/admin";
import { Suspense } from "react";
import { TasksList } from "./_components/TasksList";

export const metadata = {
  title: "Organizational Tasks | Admin",
  description: "Manage organizational tasks and reminders",
};

export default function TasksPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Organizational Tasks"
        description="Create and manage tasks with automatic reminders"
      />

      <Suspense fallback={<LoadingState />}>
        <TasksList />
      </Suspense>
    </PageContainer>
  );
}
