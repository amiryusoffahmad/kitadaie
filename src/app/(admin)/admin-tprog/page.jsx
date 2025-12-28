import { PageContainer, PageHeader } from "@/components/admin";
import DataList from './_components/DataList';

export const metadata = {
  title: "Training Program | Admin",
  description: "Manage training programs",
};

export default function Page() {
  return (
    <PageContainer>
      <PageHeader
        title="Training Program"
        description="Manage training program classes and assignments"
      />
      <DataList />
    </PageContainer>
  );
}
