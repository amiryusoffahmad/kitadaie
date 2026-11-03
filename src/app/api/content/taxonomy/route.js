import { contentResponse, contentSession, getTaxonomy } from '@/server/content/content-service';
export async function GET() {
  return contentResponse(async () => { await contentSession(); return getTaxonomy(); });
}
