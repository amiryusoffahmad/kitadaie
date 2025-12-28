import { PageContainer } from "@/components/admin";
import { TaskDetail } from "../_components/TaskDetail";

export const metadata = {
  title: "Create Task | Admin",
  description: "Create a new organizational task",
};

export default function CreateTaskPage() {
  return (
    <PageContainer>
      <TaskDetail />
    </PageContainer>
  );
}
