import { contentResponse, contentSession, unreadCount } from '@/server/content/content-service';
export async function GET() {
  return contentResponse(async () => unreadCount(await contentSession()));
}
