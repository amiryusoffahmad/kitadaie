import { contentResponse, contentSession, listContent } from '@/server/content/content-service';
export async function GET(request) {
  return contentResponse(async () => listContent(new URL(request.url).searchParams, await contentSession()));
}
