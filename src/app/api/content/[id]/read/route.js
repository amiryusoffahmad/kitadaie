import { contentResponse, contentSession, contentBody, recordRead } from '@/server/content/content-service';
export async function POST(request, { params }) {
  return contentResponse(async () => {
    const user = await contentSession();
    await contentBody(request);
    return recordRead((await params).id, user);
  });
}
