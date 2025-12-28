import { PageContainer, PageHeader } from "@/components/admin";
import DataList from './_components/DataList';

export const metadata = {
  title: "Training Program Users | Admin",
  description: "Manage training program users",
};

export default function Page() {
  return (
    <PageContainer>
      <PageHeader
        title="Training Program Users"
        description="Manage user enrollments and progress"
      />
      <DataList />
    </PageContainer>
  );
}
