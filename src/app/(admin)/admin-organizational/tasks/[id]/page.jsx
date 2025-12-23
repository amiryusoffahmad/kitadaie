import { TaskDetail } from "../_components/TaskDetail";

export default async function TaskDetailPage({ params }) {
  const { id } = await params;
  return <TaskDetail taskId={parseInt(id)} />;
}
