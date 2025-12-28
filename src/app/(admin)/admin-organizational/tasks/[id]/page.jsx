import { PageContainer } from "@/components/admin";
import { TaskDetail } from "../_components/TaskDetail";

export default async function TaskDetailPage({ params }) {
  const { id } = await params;
  return (
    <PageContainer>
      <TaskDetail taskId={parseInt(id)} />
    </PageContainer>
  );
}
