'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from '@/lib/auth-client';
import { ArrowLeft, BookOpen, ChevronRight, Home, Newspaper, Type } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

let readingScaleMemory = 1;
const readingScaleServerSnapshot = () => 1;
function readingScaleSnapshot() {
  try {
    const value = Number(localStorage.getItem('kitadaie-reading-scale'));
    return [1, 1.125, 1.25].includes(value) ? value : readingScaleMemory;
  } catch { return readingScaleMemory; }
}
function subscribeReadingScale(listener) {
  window.addEventListener('storage', listener);
  window.addEventListener('kitadaie-reading-size', listener);
  return () => { window.removeEventListener('storage', listener); window.removeEventListener('kitadaie-reading-size', listener); };
}
function saveReadingScale(value) {
  readingScaleMemory = value;
  try { localStorage.setItem('kitadaie-reading-scale', String(value)); } catch { /* The preference still applies in this tab. */ }
  window.dispatchEvent(new Event('kitadaie-reading-size'));
}

export async function fetchContent(url, options) {
  const response = await fetch(url, { cache: 'no-store', ...options });
  const json = await response.json();
  if (!response.ok) throw new Error(json.error || 'Kandungan tidak dapat dimuatkan.');
  return json;
}

export function useBulletinCount() {
  const { data: session } = useSession();
  return useQuery({
    queryKey: ['content-unread', session?.user?.id],
    queryFn: () => fetchContent('/api/content/unread'),
    enabled: Boolean(session?.user?.id), refetchInterval: 60000,
  });
}

export function BulletinBadge() {
  const { data, isError } = useBulletinCount();
  if (isError || !data?.count) return null;
  return <Badge className='px-1.5' aria-label={`${data.count} buletin belum dibaca`}>{data.count > 99 ? '99+' : data.count}</Badge>;
}

export function ContentState({ loading, error, onRetry, title = 'Belum ada kandungan', message = 'Kandungan yang diterbitkan akan dipaparkan di sini.' }) {
  if (loading) return <p role='status' className='py-8 text-muted-foreground'>Memuatkan kandungan…</p>;
  return <div className='rounded-2xl border bg-card p-6 text-center space-y-3'>
    <BookOpen className='mx-auto text-muted-foreground' aria-hidden='true' />
    <h2 className='text-lg font-semibold'>{error ? 'Kandungan tidak dapat dimuatkan' : title}</h2>
    <p className='text-sm text-muted-foreground' role={error ? 'alert' : undefined}>{error?.message || message}</p>
    {error && onRetry && <Button variant='outline' onClick={onRetry}>Cuba semula</Button>}
  </div>;
}

export function ContentHeader({ title, back = '/home' }) {
  return <header className='flex items-center gap-3 mb-6'>
    <Button asChild variant='outline' size='icon'><Link href={back} aria-label='Kembali'><ArrowLeft aria-hidden='true' /></Link></Button>
    <h1 className='text-2xl font-bold min-w-0 break-words'>{title}</h1>
  </header>;
}

export function ContentDate({ value }) {
  if (!value) return null;
  return <time dateTime={value}>{new Intl.DateTimeFormat('ms-MY', { dateStyle: 'medium', timeZone: 'Asia/Kuala_Lumpur' }).format(new Date(value))}</time>;
}

function ContentCard({ item, featured }) {
  const href = `/${item.kind === 'bulletin' ? 'bulletin' : 'articles'}/${item.id}`;
  return <Link href={href} className={featured ? 'block w-[85%] shrink-0 snap-start' : 'block'}>
    <Card className='h-full transition-colors hover:border-primary'>
      <CardHeader className='space-y-3'>
        <div className='flex items-center justify-between gap-2 text-sm text-muted-foreground'>
          {item.kind === 'bulletin' ? <Newspaper aria-hidden='true' className='text-primary' /> : <BookOpen aria-hidden='true' className='text-primary' />}
          {item.unread && <Badge variant='secondary'>Belum dibaca</Badge>}
          <span>{item.reading_minutes} min bacaan</span>
        </div>
        <CardTitle className='text-lg leading-relaxed break-words'>{item.title}</CardTitle>
      </CardHeader>
      <CardContent className='space-y-3'>
        {item.excerpt && <p className='text-sm text-muted-foreground break-words'>{item.excerpt}</p>}
        {item.category_name && <p className='text-sm text-primary'>{[item.category_name, item.series_title].filter(Boolean).join(' / ')}</p>}
        <p className='text-sm text-muted-foreground'><ContentDate value={item.publish_at} /></p>
      </CardContent>
    </Card>
  </Link>;
}

export function ContentList({ kind = 'article', mode = 'latest', seriesId, categoryId }) {
  const { data: session } = useSession();
  const query = useInfiniteQuery({
    queryKey: ['content-list', session?.user?.id, kind, mode, seriesId, categoryId],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams({ kind, mode, page: String(pageParam) });
      if (seriesId) params.set('series', seriesId);
      if (categoryId) params.set('category', categoryId);
      return fetchContent(`/api/content?${params}`);
    },
    getNextPageParam: (last) => last.hasMore ? last.page + 1 : undefined,
    enabled: Boolean(session?.user?.id),
  });
  const items = query.data?.pages.flatMap((page) => page.data) || [];
  if (query.isPending) return <ContentState loading />;
  if (query.isError) return <ContentState error={query.error} onRetry={() => query.refetch()} />;
  if (!items.length) return <ContentState title={kind === 'bulletin' ? 'Belum ada buletin' : 'Belum ada artikel'} />;
  return <div className='space-y-4'>
    <div className={mode === 'featured' ? 'flex overflow-x-auto snap-x snap-mandatory gap-3 pb-3' : 'grid gap-4'}>
      {items.map((item) => <ContentCard item={item} key={item.id} featured={mode === 'featured'} />)}
    </div>
    {query.isFetchNextPageError && <p role='alert'>Halaman seterusnya tidak dapat dimuatkan. Cuba sekali lagi.</p>}
    {query.hasNextPage && <Button variant='outline' onClick={() => query.fetchNextPage()} disabled={query.isFetchingNextPage}>{query.isFetchingNextPage ? 'Memuatkan…' : 'Lihat lagi'}</Button>}
  </div>;
}

export function ArticlesHub() {
  const [mode, setMode] = useState('featured');
  const taxonomy = useQuery({ queryKey: ['content-taxonomy'], queryFn: () => fetchContent('/api/content/taxonomy') });
  return <div className='space-y-6'>
    <ContentHeader title='Articles' />
    <div className='grid grid-cols-2 gap-2 rounded-xl bg-secondary p-1' role='group' aria-label='Susunan artikel'>
      {['featured', 'latest'].map((value) => <Button key={value} variant={mode === value ? 'default' : 'ghost'} aria-pressed={mode === value} onClick={() => setMode(value)}>{value === 'featured' ? 'Featured' : 'Latest'}</Button>)}
    </div>
    <ContentList mode={mode} />
    <section className='space-y-3' aria-labelledby='categories-title'>
      <h2 id='categories-title' className='text-xl font-semibold'>Kategori</h2>
      {taxonomy.isPending ? <ContentState loading /> : taxonomy.isError ? <ContentState error={taxonomy.error} onRetry={() => taxonomy.refetch()} /> :
        <div className='grid grid-cols-2 gap-3'>{taxonomy.data.categories.map((category) =>
          <Link key={category.id} href={`/articles/categories/${category.id}`} className='rounded-2xl border bg-card p-4 space-y-3 hover:border-primary'>
            <span className='flex size-11 items-center justify-center rounded-full bg-secondary text-primary'><BookOpen aria-hidden='true' /></span>
            <span className='block font-semibold break-words'>{category.name}</span>
          </Link>)}</div>}
    </section>
  </div>;
}

export function CollectionPage({ id, kind }) {
  const query = useQuery({ queryKey: ['content-taxonomy'], queryFn: () => fetchContent('/api/content/taxonomy') });
  if (query.isPending) return <ContentState loading />;
  if (query.isError) return <ContentState error={query.error} onRetry={() => query.refetch()} />;
  const record = query.data[kind === 'category' ? 'categories' : 'series'].find((row) => String(row.id) === String(id));
  if (!record) return <><ContentHeader title='Articles' back='/articles' /><ContentState title='Tidak ditemui' message='Kategori atau siri ini tidak tersedia.' /></>;
  const series = query.data.series.filter((row) => row.category_id === record.id);
  return <div className='space-y-4'>
    <ContentHeader title={record.name || record.title} back={kind === 'category' ? '/articles' : `/articles/categories/${record.category_id}`} />
    {kind === 'category' && <section className='space-y-3'>
      <h2 className='text-xl font-semibold'>Siri</h2>
      {!series.length && <ContentState title='Belum ada siri' message='Siri akan dipaparkan selepas disediakan oleh admin.' />}
      {series.map((row) => <Link key={row.id} href={`/articles/series/${row.id}`} className='flex items-center gap-3 rounded-2xl border bg-card p-4'>
        <BookOpen aria-hidden='true' className='shrink-0 text-primary' /><span className='grow font-semibold'>{row.title}</span><ChevronRight aria-hidden='true' className='shrink-0' />
      </Link>)}
    </section>}
    <h2 className='text-xl font-semibold'>Artikel</h2>
    <ContentList {...(kind === 'category' ? { categoryId: id } : { seriesId: id })} />
  </div>;
}

export function ArticleBody({ blocks, scale = 1 }) {
  return <div className='article-body space-y-5 break-words' style={{ fontSize: `${scale}rem`, lineHeight: 1.65 }}>
    {blocks.map((block, index) => {
      if (block.type === 'heading') return <h2 key={index} className='font-semibold' style={{ fontSize: '1.25em' }}>{block.text}</h2>;
      if (block.type === 'quote') return <blockquote key={index} className='border-l-4 border-primary pl-4 whitespace-pre-wrap'>{block.text}</blockquote>;
      if (block.type === 'verse') return <figure key={index} className='rounded-xl bg-secondary p-4 space-y-4'>
        <p className='arabic-reading whitespace-pre-wrap text-right' lang='ar' dir='rtl' style={{ '--arabic-reading-size': `${1.25 * scale}rem` }}>{block.text}</p>
        <blockquote className='whitespace-pre-wrap'>{block.translation}</blockquote>
        <figcaption className='text-sm text-muted-foreground'>{block.reference}</figcaption>
      </figure>;
      return <p key={index} className='whitespace-pre-wrap'>{block.text}</p>;
    })}
  </div>;
}

export function ContentReader({ id, kind }) {
  const scale = useSyncExternalStore(subscribeReadingScale, readingScaleSnapshot, readingScaleServerSnapshot);
  const client = useQueryClient();
  const { data: session } = useSession();
  const query = useQuery({ queryKey: ['content-item', session?.user?.id, id, kind], queryFn: () => fetchContent(`/api/content/${id}?kind=${kind}`), enabled: Boolean(session?.user?.id) });
  const read = useMutation({
    mutationFn: () => fetchContent(`/api/content/${id}/read`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }),
    onSuccess: (result) => {
      client.setQueryData(['content-unread', session?.user?.id], result);
      client.invalidateQueries({ queryKey: ['content-list'] });
    },
  });
  const { mutate: markRead } = read;
  const marked = useRef(null);
  useEffect(() => {
    const key = `${session?.user?.id}:${id}`;
    if (query.data?.data && kind === 'bulletin' && marked.current !== key) {
      marked.current = key;
      markRead();
    }
  }, [query.data, kind, id, markRead, session?.user?.id]); // Runs after the successful reader render, never on list/prefetch requests.
  const back = kind === 'bulletin' ? '/bulletin' : '/articles';
  return <article className='space-y-6'>
    <div className='flex flex-wrap items-center justify-between gap-2'>
      <Button asChild variant='outline' size='icon'><Link href={back} aria-label='Kembali'><ArrowLeft aria-hidden='true' /></Link></Button>
      <Button asChild variant='ghost' size='icon'><Link href='/home' aria-label='Home'><Home aria-hidden='true' /></Link></Button>
      <label className='flex items-center gap-2 text-sm'><Type aria-hidden='true' />Saiz teks
        <select className='field rounded-lg border p-2' value={scale} onChange={(event) => {
          saveReadingScale(Number(event.target.value));
        }}><option value={1}>Biasa</option><option value={1.125}>Besar</option><option value={1.25}>Lebih besar</option></select>
      </label>
    </div>
    {query.isPending ? <ContentState loading /> : query.isError ? <ContentState error={query.error} onRetry={() => query.refetch()} /> : <>
      <header className='space-y-3'>
        <p className='text-sm font-semibold text-primary'>{kind === 'bulletin' ? 'Bulletin' : query.data.data.category_name || 'Articles'}</p>
        <h1 className='text-2xl font-bold break-words'>{query.data.data.title}</h1>
        <div className='flex flex-wrap gap-3 text-sm text-muted-foreground'><ContentDate value={query.data.data.publish_at} /><span>{query.data.data.reading_minutes} min bacaan</span></div>
      </header>
      <ArticleBody blocks={query.data.data.body_blocks} scale={scale} />
      {read.isError && <div role='alert' className='rounded-xl border p-4 space-y-2'><p>Rekod bacaan belum disimpan.</p><Button variant='outline' disabled={read.isPending} onClick={() => read.mutate()}>Cuba semula</Button></div>}
    </>}
  </article>;
}
