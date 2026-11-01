import { contentResponse, contentSession, getContentItem } from '@/server/content/content-service';
export async function GET(request, { params }) {
  return contentResponse(async () => {
    const user = await contentSession();
    return getContentItem((await params).id, new URL(request.url).searchParams.get('kind'), user);
  });
}
