import { PageContainer, PageHeader, LoadingState } from "@/components/admin";
import { Suspense } from "react";
import { AssignmentsList } from "./_components/AssignmentsList";

export const metadata = {
  title: "User Assignments | Admin",
  description: "Manage user role and department assignments",
};

export default function AssignmentsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="User Assignments"
        description="Assign users to organizational roles and departments"
      />

      <Suspense fallback={<LoadingState />}>
        <AssignmentsList />
      </Suspense>
    </PageContainer>
  );
}
