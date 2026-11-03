import { contentResponse, contentSession, getContentItem } from '@/server/content/content-service';
export async function GET(request, { params }) {
  return contentResponse(async () => getContentItem((await params).id, null, await contentSession(true), true));
}
