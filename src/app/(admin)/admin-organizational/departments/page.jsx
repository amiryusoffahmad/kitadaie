import { PageContainer, PageHeader, LoadingState } from "@/components/admin";
import { Suspense } from "react";
import { DepartmentsList } from "./_components/DepartmentsList";

export const metadata = {
  title: "Departments | Admin",
  description: "Manage organizational departments",
};

export default function DepartmentsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Departments"
        description="Manage organizational departments and Telegram group configurations"
      />

      <Suspense fallback={<LoadingState />}>
        <DepartmentsList />
      </Suspense>
    </PageContainer>
  );
}
