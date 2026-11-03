import { contentResponse, contentSession, contentBody, adminContent, saveContent } from '@/server/content/content-service';
export async function GET(request) {
  return contentResponse(async () => { await contentSession(true); return adminContent(new URL(request.url).searchParams); });
}
export async function POST(request) {
  return contentResponse(async () => {
    const user = await contentSession(true);
    return saveContent(await contentBody(request), user);
  });
}
