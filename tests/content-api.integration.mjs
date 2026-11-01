import assert from 'node:assert/strict';
import { createHmac, randomUUID } from 'node:crypto';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
require('@next/env').loadEnvConfig(process.cwd());
const origin = process.env.CONTENT_TEST_URL || 'http://localhost:3105';
if (!['localhost', '127.0.0.1', '::1'].includes(process.env.DB_HOST) || !['localhost','127.0.0.1'].includes(new URL(origin).hostname)) throw Error('Integration tests require a local app and database.');
const db = require('knex')(require('../knexfile').development);
const prefix = `content-test-${Date.now()}`;
const ids = { admin: randomUUID(), reader: randomUUID(), items: [], categories: [], series: [] };
const secret = process.env.BETTER_AUTH_SECRET || process.env.AUTH_SECRET;
const now = Date.now();
const created = new Date(now - 3600000);
const body = [{type:'paragraph',text:'Kandungan ujian tempatan.'}];
let passed = 0;
function cookie(token) {
  const signed = encodeURIComponent(`${token}.${createHmac('sha256', secret).update(token).digest('base64')}`);
  return `kitadaie.session_token=${signed}; __Secure-kitadaie.session_token=${signed}`;
}
async function request(path, auth, method='GET', payload) {
  const response = await fetch(origin+path, {method,headers:{...(auth?{cookie:auth}:{}),...(method==='POST'?{'Content-Type':'application/json',origin}: {})},...(payload?{body:JSON.stringify(payload)}:{})});
  const json = await response.json();
  return {status:response.status,...json};
}
function check(name, fn) { fn(); passed++; console.log(`PASS ${name}`); }
let adminCookie,readerCookie;
try {
  for (const [role,id] of [['admin',ids.admin],['reader',ids.reader]]) {
    const token = randomUUID();
    await db('user').insert({id,name:prefix+'-'+role,email:prefix+'-'+role+'@example.invalid',emailVerified:1,createdAt:created,updatedAt:created});
    await db('user_roles').insert({id:Date.now()+(role==='admin'?1:2),user_id:id,role:role==='admin'?'admin':'user'});
    await db('session').insert({id:randomUUID(),userId:id,token,expiresAt:new Date(now+86400000),createdAt:created,updatedAt:created});
    if(role==='admin')adminCookie=cookie(token);else readerCookie=cookie(token);
  }
  const anonymous=await request('/api/content');check('anonymous reader API returns 401',()=>assert.equal(anonymous.status,401));
  const denied=await request('/api/admin/content',readerCookie,'POST',{entity:'item',kind:'article',title:'Denied',status:'draft',body_blocks:[],featured:false});
  check('reader cannot create content',()=>assert.equal(denied.status,403));
  const adminDenied=await request('/api/admin/content',readerCookie);check('reader cannot list drafts',()=>assert.equal(adminDenied.status,403));
  const adminData=await request('/api/admin/content',adminCookie);check('admin can list initial empty drafts',()=>{assert.equal(adminData.status,200);assert.ok(adminData.data.filter(i=>i.status==='draft').length>=13)});
  const draftId=adminData.data.find(i=>i.status==='draft').id;
  const hidden=await request('/api/content/'+draftId,readerCookie);check('draft direct URL is hidden',()=>assert.equal(hidden.status,404));
  const category=await request('/api/admin/content',adminCookie,'POST',{entity:'category',name:prefix,slug:prefix,active:true,sort_order:99});
  assert.equal(category.status,200);ids.categories.push(category.id);
  const series=await request('/api/admin/content',adminCookie,'POST',{entity:'series',title:prefix,slug:prefix,category_id:category.id,active:true,sort_order:99});
  assert.equal(series.status,200);ids.series.push(series.id);
  const emptyPublish=await request('/api/admin/content',adminCookie,'POST',{kind:'article',title:prefix,status:'published',body_blocks:[],featured:false});check('empty draft cannot be published',()=>assert.equal(emptyPublish.status,400));
  async function createItem(overrides={}) {
    const payload={kind:'bulletin',title:prefix,excerpt:'Ujian',body_blocks:body,status:'published',featured:false,publish_at:new Date(now-60000).toISOString(),...overrides};
    const result=await request('/api/admin/content',adminCookie,'POST',payload);
    assert.equal(result.status,200,JSON.stringify(result));ids.items.push(result.id);return {id:result.id,...payload};
  }
  const old=await createItem({publish_at:new Date(now-7200000).toISOString()});
  const fresh=await createItem();
  const scheduled=await createItem({status:'scheduled',publish_at:new Date(now+7200000).toISOString()});
  const article=await createItem({kind:'article',series_id:series.id,category_id:null,featured:true});
  const firstCount=await request('/api/content/unread',readerCookie);check('only bulletin after account creation counts unread',()=>assert.equal(firstCount.count,1));
  const beforeRead=await request('/api/content/'+fresh.id+'?kind=bulletin',readerCookie);assert.equal(beforeRead.status,200);
  const list=await request('/api/content?kind=bulletin',readerCookie);check('lists exclude scheduled content and bodies',()=>{assert.ok(!list.data.some(i=>i.id===scheduled.id));assert.ok(!list.data.some(i=>'body_blocks' in i));assert.equal(list.data.find(i=>i.id===old.id).unread,false);assert.equal(list.data.find(i=>i.id===fresh.id).unread,true)});
  const prefetchedReads=Number((await db('art_reads').where('user_id',ids.reader).count('* as count').first()).count);
  check('GET detail and list never mark read',()=>assert.equal(prefetchedReads,0));
  const hiddenScheduled=await request('/api/content/'+scheduled.id,readerCookie);check('scheduled direct URL remains hidden',()=>assert.equal(hiddenScheduled.status,404));
  const articleDetail=await request('/api/content/'+article.id+'?kind=article',readerCookie);check('series category is authoritative',()=>assert.equal(articleDetail.data.category_id,category.id));
  const featured=await request('/api/content?kind=article&mode=featured',readerCookie);check('Featured returns only Featured published articles',()=>assert.ok(featured.data.some(i=>i.id===article.id)&&featured.data.every(i=>i.featured)));
  const reads=await Promise.all(Array.from({length:4},()=>request('/api/content/'+fresh.id+'/read',readerCookie,'POST',{})));
  check('concurrent read requests succeed idempotently',()=>assert.ok(reads.every(r=>r.status===200&&r.count===0)));
  const savedReads=Number((await db('art_reads').where({user_id:ids.reader,item_id:fresh.id}).count('* as count').first()).count);
  check('one read record is retained',()=>assert.equal(savedReads,1));
  const archived=await request('/api/admin/content',adminCookie,'POST',{...fresh,status:'archived'});assert.equal(archived.status,200);
  const hiddenArchive=await request('/api/content/'+fresh.id,readerCookie);check('archiving removes direct reader access',()=>assert.equal(hiddenArchive.status,404));
  assert.equal(Number((await db('art_reads').where({user_id:ids.reader,item_id:fresh.id}).count('* as count').first()).count),1);
  const audit=await db('art_audit_logs').where({entity_id:fresh.id,entity_type:'item'});check('publishing and archival actions are audited',()=>assert.ok(audit.length>=2));
  const csrf=await fetch(origin+'/api/content/'+old.id+'/read',{method:'POST',headers:{cookie:readerCookie,origin:'https://example.invalid','Content-Type':'application/json'},body:'{}'});check('cross-origin mutation is rejected',()=>assert.equal(csrf.status,403));
  const changed=await request('/api/admin/content',adminCookie,'POST',{entity:'category',id:category.id,name:prefix,slug:prefix,active:false,sort_order:99});
  assert.equal(changed.status,200);
  const inactive=await request('/api/content/'+article.id,readerCookie);check('inactive categories hide direct article access',()=>assert.equal(inactive.status,404));
  const cronSecret=process.env.CONTENT_TEST_CRON_SECRET || process.env.CRON_SECRET;
  if(cronSecret){
    const noCron=await fetch(origin+'/api/cron/publish-content');check('scheduler rejects unsigned requests',()=>assert.equal(noCron.status,401));
    await db('art_items').where('id',scheduled.id).update({publish_at:new Date(now-30000).toISOString().slice(0,19).replace('T',' ')});
    const publish=await fetch(origin+'/api/cron/publish-content',{headers:{authorization:`Bearer ${cronSecret}`}});const published=await publish.json();
    check('due scheduled content is published',()=>{assert.equal(publish.status,200);assert.ok(published.published>=1)});
    const live=await request('/api/content/'+scheduled.id,readerCookie);check('scheduler makes due bulletin readable',()=>assert.equal(live.status,200));
    const event=await db('art_audit_logs').where({entity_type:'item',entity_id:scheduled.id,action:'scheduled_publish'});check('scheduled publishing is audited once',()=>assert.equal(event.length,1));
  }
  console.log(`Integration complete: ${passed} checks passed.`);
} finally {
  if(ids.items.length){await db('art_reads').whereIn('item_id',ids.items).del();await db('art_audit_logs').where('entity_type','item').whereIn('entity_id',ids.items).del();await db('art_items').whereIn('id',ids.items).del();}
  for(const [entity,values,table] of [['series',ids.series,'art_series'],['category',ids.categories,'art_categories']])if(values.length){await db('art_audit_logs').where('entity_type',entity).whereIn('entity_id',values).del();await db(table).whereIn('id',values).del();}
  await db('art_reads').whereIn('user_id',[ids.admin,ids.reader]).del();
  await db('session').whereIn('userId',[ids.admin,ids.reader]).del();
  await db('user_roles').whereIn('user_id',[ids.admin,ids.reader]).del();
  await db('user').whereIn('id',[ids.admin,ids.reader]).del();
  await db.destroy();
}
