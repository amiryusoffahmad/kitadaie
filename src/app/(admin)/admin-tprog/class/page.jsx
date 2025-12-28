import { PageContainer, PageHeader } from "@/components/admin";
import DataList from './_components/DataList';

export const metadata = {
  title: "Training Program Classes | Admin",
  description: "Manage training program classes",
};

export default function Page() {
  return (
    <PageContainer>
      <PageHeader
        title="Training Program Classes"
        description="Manage classes and assignments"
      />
      <DataList />
    </PageContainer>
  );
}
