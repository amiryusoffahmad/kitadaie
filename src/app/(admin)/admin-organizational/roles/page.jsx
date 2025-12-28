import { PageContainer, PageHeader, LoadingState } from "@/components/admin";
import { Suspense } from "react";
import { RolesList } from "./_components/RolesList";

export const metadata = {
  title: "Roles | Admin",
  description: "Manage organizational roles",
};

export default function RolesPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Organizational Roles"
        description="Manage organizational roles and Telegram group configurations"
      />

      <Suspense fallback={<LoadingState />}>
        <RolesList />
      </Suspense>
    </PageContainer>
  );
}
