'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArticleBody, ContentState, fetchContent } from './content-client';

const emptyItem = { kind: 'article', title: '', excerpt: '', category_id: '', series_id: '', body_blocks: [], featured: false, status: 'draft', publish_at: '', sort_order: 0 };
const statuses = { draft: 'Draf', scheduled: 'Berjadual', published: 'Diterbitkan', archived: 'Arkib' };

function localPublishTime(value) {
  if (!value) return '';
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Kuala_Lumpur', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(value)).replace(' ', 'T');
}

function Field({ label, children }) {
  return <label className='grid gap-2 text-sm font-medium'>{label}{children}</label>;
}

export function ContentManager() {
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState('item');
  const [item, setItem] = useState(null);
  const [taxonomy, setTaxonomy] = useState(null);
  const [preview, setPreview] = useState(false);
  const [notice, setNotice] = useState('');
  const client = useQueryClient();
  const query = useQuery({ queryKey: ['admin-content', page], queryFn: () => fetchContent(`/api/admin/content?page=${page}`) });
  const save = useMutation({
    mutationFn: (body) => fetchContent('/api/admin/content', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
    onSuccess: () => {
      setItem(null); setTaxonomy(null); setPreview(false); setNotice('Perubahan berjaya disimpan.');
      client.invalidateQueries({ queryKey: ['admin-content'] });
      client.invalidateQueries({ queryKey: ['content-taxonomy'] });
      client.invalidateQueries({ queryKey: ['content-list'] });
      client.invalidateQueries({ queryKey: ['content-item'] });
      client.invalidateQueries({ queryKey: ['content-unread'] });
    },
  });
  const set = (key, value) => setItem((current) => ({ ...current, [key]: value }));
  const updateBlock = (index, key, value) => set('body_blocks', item.body_blocks.map((block, i) => i === index ? { ...block, [key]: value } : block));
  const begin = (value) => { save.reset(); setNotice(''); setPreview(false); setTaxonomy(null); setItem(value); };
  if (query.isPending) return <ContentState loading />;
  if (query.isError) return <ContentState error={query.error} onRetry={() => query.refetch()} />;
  const data = query.data;

  return <div className='p-4 md:p-6 space-y-6 max-w-5xl w-full mx-auto'>
    <header className='space-y-2'><h1 className='text-2xl font-bold'>Articles & Bulletin</h1><p className='text-muted-foreground'>Urus kandungan bacaan. Upload fail ditangguhkan; pengguna hanya melihat kandungan yang diterbitkan.</p></header>
    <div className='flex flex-wrap gap-2' role='group' aria-label='Jenis rekod'>
      {['item', 'category', 'series'].map((value) => <Button key={value} aria-pressed={tab === value} variant={tab === value ? 'default' : 'outline'} onClick={() => { setTab(value); setItem(null); setTaxonomy(null); save.reset(); }}>{value === 'item' ? 'Kandungan' : value === 'category' ? 'Kategori' : 'Siri'}</Button>)}
    </div>
    {notice && <p role='status' className='text-success'>{notice}</p>}
    {save.isError && <p role='alert' className='text-destructive'>{save.error.message}</p>}

    {tab === 'item' && !item && <>
      <Button onClick={() => begin({ ...emptyItem, body_blocks: [] })}>Kandungan baharu</Button>
      <div className='space-y-3'>{data.data.map((row) => <div key={row.id} className='rounded-xl border bg-card p-4 flex flex-wrap items-center gap-3'>
        <div className='grow min-w-0 space-y-1'><p className='font-semibold break-words'>{row.title}</p><p className='text-sm text-muted-foreground'>{row.kind === 'bulletin' ? 'Bulletin' : 'Article'}{row.series_title && ` / ${row.series_title}`}</p></div>
        <Badge variant='secondary'>{statuses[row.status]}</Badge>
        <Button variant='outline' onClick={() => begin({ ...row, category_id: row.category_id || '', series_id: row.series_id || '', original_publish_at: row.publish_at, publish_at: localPublishTime(row.publish_at) })}>Edit / Pratonton</Button>
      </div>)}</div>
      {!data.data.length && <ContentState />}
      <div className='flex items-center gap-3'><Button variant='outline' disabled={page === 1} onClick={() => setPage(page - 1)}>Sebelum</Button><span>Halaman {page}</span><Button variant='outline' disabled={!data.hasMore} onClick={() => setPage(page + 1)}>Seterusnya</Button></div>
    </>}

    {tab === 'item' && item && <form className='space-y-5 rounded-2xl border bg-card p-4' onSubmit={(event) => {
      event.preventDefault();
      const unchangedTime = item.original_publish_at && localPublishTime(item.original_publish_at) === item.publish_at;
      save.mutate({ ...item, entity: 'item', publish_at: unchangedTime ? item.original_publish_at : item.publish_at ? `${item.publish_at}:00+08:00` : null });
    }}>
      <h2 className='text-xl font-semibold'>{item.id ? 'Edit kandungan' : 'Kandungan baharu'}</h2>
      <div className='grid sm:grid-cols-2 gap-4'>
        <Field label='Jenis'><select className='field' value={item.kind} onChange={(e) => { set('kind', e.target.value); set('category_id', ''); set('series_id', ''); }}><option value='article'>Article</option><option value='bulletin'>Bulletin</option></select></Field>
        <Field label='Status'><select className='field' value={item.status} onChange={(e) => set('status', e.target.value)}>{Object.entries(statuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field>
      </div>
      <Field label='Tajuk'><input required maxLength={240} className='field' value={item.title} onChange={(e) => set('title', e.target.value)} /></Field>
      <Field label='Ringkasan'><textarea maxLength={1000} rows={3} className='field' value={item.excerpt} onChange={(e) => set('excerpt', e.target.value)} /></Field>
      {item.kind === 'article' && <div className='grid sm:grid-cols-2 gap-4'>
        <Field label='Kategori'><select className='field' value={item.category_id} disabled={Boolean(item.series_id)} onChange={(e) => set('category_id', e.target.value)}><option value=''>Tanpa kategori</option>{data.categories.map((c) => <option key={c.id} value={c.id}>{c.name}{!c.active ? ' (tidak aktif)' : ''}</option>)}</select></Field>
        <Field label='Siri'><select className='field' value={item.series_id} onChange={(e) => { set('series_id', e.target.value); const series = data.series.find((s) => String(s.id) === e.target.value); if (series) set('category_id', series.category_id); }}><option value=''>Tanpa siri</option>{data.series.map((s) => <option key={s.id} value={s.id}>{s.title}{!s.active ? ' (tidak aktif)' : ''}</option>)}</select></Field>
        <label className='flex items-center gap-2 min-h-11'><input type='checkbox' checked={item.featured} onChange={(e) => set('featured', e.target.checked)} />Featured</label>
      </div>}
      <div className='grid sm:grid-cols-2 gap-4'>
        <Field label='Susunan dalam siri'><input type='number' min={0} max={100000} className='field' value={item.sort_order} onChange={(e) => set('sort_order', e.target.value)} /></Field>
        <Field label='Waktu terbit (Malaysia, UTC+08:00)'><input type='datetime-local' className='field' required={item.status === 'scheduled'} value={item.publish_at} onChange={(e) => set('publish_at', e.target.value)} /></Field>
      </div>
      <p className='text-sm text-muted-foreground'>Waktu kosong menggunakan waktu semasa apabila diterbitkan. Draf kosong tidak boleh diterbitkan. Semak ketepatan teks Arab, terjemahan dan rujukan sebelum penerbitan.</p>
      <section className='space-y-4'>
        <h3 className='text-lg font-semibold'>Isi kandungan</h3>
        {item.body_blocks.map((block, index) => <fieldset key={index} className='rounded-xl border p-4 space-y-3'>
          <legend className='px-1 font-semibold'>Blok {index + 1}</legend>
          <Field label='Jenis blok'><select className='field' value={block.type} onChange={(e) => updateBlock(index, 'type', e.target.value)}><option value='paragraph'>Perenggan</option><option value='heading'>Tajuk bahagian</option><option value='quote'>Petikan</option><option value='verse'>Ayat Arab dan terjemahan</option></select></Field>
          <Field label={block.type === 'verse' ? 'Teks Arab' : 'Teks'}><textarea className={`field ${block.type === 'verse' ? 'arabic-reading' : ''}`} lang={block.type === 'verse' ? 'ar' : undefined} dir={block.type === 'verse' ? 'rtl' : undefined} rows={4} maxLength={10000} required value={block.text} onChange={(e) => updateBlock(index, 'text', e.target.value)} /></Field>
          {block.type === 'verse' && <><Field label='Terjemahan'><textarea className='field' rows={3} required maxLength={10000} value={block.translation || ''} onChange={(e) => updateBlock(index, 'translation', e.target.value)} /></Field><Field label='Rujukan'><input className='field' required maxLength={240} value={block.reference || ''} onChange={(e) => updateBlock(index, 'reference', e.target.value)} /></Field></>}
          <div className='flex flex-wrap gap-2'>
            <Button type='button' variant='outline' disabled={index === 0} onClick={() => { const blocks = [...item.body_blocks]; [blocks[index - 1], blocks[index]] = [blocks[index], blocks[index - 1]]; set('body_blocks', blocks); }}>Naik</Button>
            <Button type='button' variant='outline' disabled={index === item.body_blocks.length - 1} onClick={() => { const blocks = [...item.body_blocks]; [blocks[index], blocks[index + 1]] = [blocks[index + 1], blocks[index]]; set('body_blocks', blocks); }}>Turun</Button>
            <Button type='button' variant='outline' onClick={() => set('body_blocks', item.body_blocks.filter((_, i) => i !== index))}>Buang blok</Button>
          </div>
        </fieldset>)}
        <Button type='button' variant='outline' disabled={item.body_blocks.length >= 200} onClick={() => set('body_blocks', [...item.body_blocks, { type: 'paragraph', text: '' }])}>Tambah blok</Button>
      </section>
      <div className='flex flex-wrap gap-2'>
        <Button type='submit' disabled={save.isPending}>{save.isPending ? 'Menyimpan…' : 'Simpan'}</Button>
        <Button type='button' variant='outline' onClick={() => setPreview(!preview)}>{preview ? 'Tutup pratonton' : 'Pratonton'}</Button>
        <Button type='button' variant='ghost' disabled={save.isPending} onClick={() => { setItem(null); save.reset(); }}>Batal</Button>
      </div>
      {preview && <section className='max-w-[30rem] mx-auto rounded-xl border p-4 space-y-4' aria-label='Pratonton pembaca'><Badge variant='secondary'>Pratonton admin</Badge><h2 className='text-2xl font-bold'>{item.title || 'Tanpa tajuk'}</h2>{item.body_blocks.length ? <ArticleBody blocks={item.body_blocks} /> : <p className='text-muted-foreground'>Isi kandungan belum disediakan.</p>}</section>}
    </form>}

    {tab !== 'item' && <>
      {!taxonomy && <Button onClick={() => { save.reset(); setNotice(''); setTaxonomy({ slug: '', name: '', title: '', category_id: '', sort_order: 0, active: true }); }}>Tambah {tab === 'category' ? 'kategori' : 'siri'}</Button>}
      {taxonomy && <form className='rounded-xl border bg-card p-4 space-y-4' onSubmit={(e) => { e.preventDefault(); save.mutate({ ...taxonomy, active: Boolean(taxonomy.active), entity: tab }); }}>
        <Field label='Nama / tajuk'><input required maxLength={tab === 'category' ? 160 : 240} className='field' value={tab === 'category' ? taxonomy.name : taxonomy.title} onChange={(e) => setTaxonomy({ ...taxonomy, [tab === 'category' ? 'name' : 'title']: e.target.value })} /></Field>
        <Field label='Slug'><input className='field' required maxLength={120} pattern='[a-z0-9]+(-[a-z0-9]+)*' value={taxonomy.slug} onChange={(e) => setTaxonomy({ ...taxonomy, slug: e.target.value })} /></Field>
        {tab === 'series' && <Field label='Kategori'><select required className='field' value={taxonomy.category_id} onChange={(e) => setTaxonomy({ ...taxonomy, category_id: e.target.value })}><option value=''>Pilih kategori</option>{data.categories.map((c) => <option value={c.id} key={c.id}>{c.name}</option>)}</select></Field>}
        <Field label='Susunan'><input className='field' type='number' min={0} max={100000} value={taxonomy.sort_order} onChange={(e) => setTaxonomy({ ...taxonomy, sort_order: e.target.value })} /></Field>
        <label className='flex items-center gap-2 min-h-11'><input type='checkbox' checked={Boolean(taxonomy.active)} onChange={(e) => setTaxonomy({ ...taxonomy, active: e.target.checked })} />Aktif</label>
        <p className='text-sm text-muted-foreground'>Kategori atau siri yang tidak aktif turut menyembunyikan kandungannya daripada pembaca.</p>
        <div className='flex gap-2'><Button disabled={save.isPending}>Simpan</Button><Button type='button' variant='outline' disabled={save.isPending} onClick={() => setTaxonomy(null)}>Batal</Button></div>
      </form>}
      <div className='space-y-3'>{data[tab === 'category' ? 'categories' : 'series'].map((row) => <div key={row.id} className='flex flex-wrap items-center gap-3 rounded-xl border bg-card p-4'><div className='grow'><p className='font-semibold'>{row.name || row.title}</p><p className='text-sm text-muted-foreground'>Susunan {row.sort_order}{row.category_name && ` / ${row.category_name}`} / {row.active ? 'Aktif' : 'Tidak aktif'}</p></div><Button variant='outline' onClick={() => { save.reset(); setTaxonomy({ ...row }); }}>Edit</Button></div>)}</div>
    </>}
  </div>;
}
