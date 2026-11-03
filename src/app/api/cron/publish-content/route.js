import { timingSafeEqual } from 'node:crypto';
import { ContentError } from '@/features/content/rules.mjs';
import { contentResponse, publishScheduled } from '@/server/content/content-service';
export async function GET(request) {
  return contentResponse(async () => {
    const secret = process.env.CRON_SECRET;
    if (!secret) throw new ContentError('Penjadual belum dikonfigurasi.', 503);
    const expected = Buffer.from(`Bearer ${secret}`);
    const actual = Buffer.from(request.headers.get('authorization') || '');
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) throw new ContentError('Unauthorized', 401);
    return publishScheduled();
  });
}
