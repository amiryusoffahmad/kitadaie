import { UserTaskDetail } from "../_components/UserTaskDetail";

export default async function UserTaskDetailPage({ params }) {
  const { id } = await params;
  return <UserTaskDetail taskId={parseInt(id)} />;
}
