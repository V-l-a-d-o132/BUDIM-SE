import { before, after, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { createRequire, registerHooks } from 'node:module';
import { PGlite } from '@electric-sql/pglite';

const require=createRequire(import.meta.url);
registerHooks({resolve(specifier,context,next){
  if(specifier.startsWith('npm:'))return next(require.resolve(specifier.slice(4).replace(/@\d[^/]*$/,'')),context);
  return next(specifier,context);
}});
const originalFetch=globalThis.fetch,handlers={};let db,capture,room,participant,requests=[];
const token='e'.repeat(64),adminId='10000000-0000-4000-8000-000000000092';
const session='20000000-0000-4000-8000-000000000092',factor='30000000-0000-4000-8000-000000000092';
const env={SUPABASE_URL:'https://fixture.supabase.test',SUPABASE_SERVICE_ROLE_KEY:'test-server-key',RECAPTCHA_SECRET_KEY:'fixture-secret'};
const signatures={consume_rate_limit:['bucket_key','max_requests'],lab_join:['actor_hash','room_code','participant_alias'],lab_state:['actor_hash'],lab_sync:['actor_hash','known_revision'],lab_check_access:['actor_hash','required_scope'],lab_command:['actor_hash','operation','details']};
async function rpc(name,body){
  const args=signatures[name];assert.ok(args,'Known server RPC '+name);
  await db.exec('begin;set local role service_role');
  try{
    const result=await db.query('select public.'+name+'('+args.map((_,i)=>'$'+(i+1)).join(',')+') result',args.map(key=>typeof body[key]==='object'?JSON.stringify(body[key]):body[key]));
    await db.exec('commit');return Response.json(result.rows[0].result);
  }catch(error){await db.exec('rollback');return Response.json({code:error.code,message:error.message},{status:400});}
}
async function admin(operation,details={}){
  await db.exec('begin;set local role authenticated');
  try{
    await db.query("select set_config('request.jwt.claims',$1,true)",[JSON.stringify({sub:adminId,session_id:session,aal:'aal2',role:'authenticated'})]);
    const result=await db.query('select public.lab_admin($1,$2) result',[operation,JSON.stringify(details)]);
    await db.exec('commit');return result.rows[0].result;
  }catch(error){await db.exec('rollback');throw error;}
}
const call=(name,body)=>handlers[name](new Request('https://fixture.supabase.test/functions/v1/'+name,{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://budimse.online','x-forwarded-for':'192.0.2.92'},body:JSON.stringify(body)}));
before(async()=>{
  db=new PGlite();
  for(const file of ['schema-before.sql','book-platform.sql'])await db.exec(readFileSync(new URL('./fixtures/'+file,import.meta.url),'utf8'));
  const directory=new URL('../supabase/migrations/',import.meta.url);
  for(const file of readdirSync(directory).filter(file=>file.endsWith('.sql')).sort())await db.exec(readFileSync(new URL(file,directory),'utf8'));
  await db.query('insert into auth.users(id) values($1)',[adminId]);
  await db.query("insert into auth.mfa_factors(id,user_id,status) values($1,$2,'verified')",[factor,adminId]);
  await db.query("insert into auth.sessions(id,user_id,factor_id,aal) values($1,$2,$3,'aal2')",[session,adminId,factor]);
  await db.query("insert into public.admin_users(user_id,role) values($1,'moderator')",[adminId]);
  const created=await admin('create_room',{name:'Edge to database fixture'});room=created.rooms.find(item=>item.id===created.selected_room);
  globalThis.Deno={env:{get:key=>env[key]},serve:handler=>{handlers[capture]=handler;}};
  for(const name of ['classroom','tavora-content-analyzer']){capture=name;await import('../supabase/functions/'+name+'/index.ts');}
  globalThis.fetch=async(input,init={})=>{
    const url=new URL(typeof input==='string'?input:input.url);
    const raw=init.body??(input instanceof Request?await input.text():'');
    const body=typeof raw==='string'&&raw.startsWith('{')?JSON.parse(raw):{};
    requests.push({path:url.pathname,body});
    if(url.hostname==='www.google.com')return Response.json({success:false});
    if(url.pathname==='/storage/v1/object/sign/classroom-media')return Response.json(body.paths.map(path=>({path,signedURL:'/object/sign/classroom-media/'+path+'?token=fixture'})));
    const name=url.pathname.split('/rpc/')[1];if(name)return rpc(name,body);
    throw new Error('Unexpected external request '+url.pathname);
  };
});
after(async()=>{globalThis.fetch=originalFetch;delete globalThis.Deno;await db?.close();});
test('deployed handler path accepts a real database limiter and records the pending classroom request',async()=>{
  const response=await call('classroom',{action:'join',access_token:token,code:room.code,alias:'Student fixture'});
  assert.equal(response.status,200);
  const state=(await response.json()).state;assert.equal(state.access.status,'pending');assert.deepEqual(state.posts,[]);
  participant=state.access.member_id;
  assert.equal((await admin('list',{room_id:room.id})).members[0].id,participant);
  for(const request of requests.filter(item=>item.path.endsWith('consume_rate_limit'))){
    assert.match(request.body.bucket_key,/^[a-f0-9]{64}$/);assert.ok(request.body.max_requests<=20000);
  }
});
test('approved participant can read, publish, react and comment through the handler and real SQL',async()=>{
  await admin('approve_member',{room_id:room.id,member_id:participant,approved:true,simulators:true,analyzer:true});
  const pending=await call('classroom',{action:'publish',access_token:token,app_id:'facebook',content:'Actual persisted fixture',approved:true,likes:1000});
  assert.equal(pending.status,200);const state=(await pending.json()).state,post=state.posts[0];
  assert.equal(post.approved,false);assert.equal(post.likes,0);
  await admin('moderate_post',{room_id:room.id,post_id:post.id,approved:true});
  const liked=await call('classroom',{action:'react',access_token:token,post_id:post.id,reaction:'love'});
  assert.equal(liked.status,200);assert.equal((await liked.json()).state.posts[0].likes,1);
  const comment=await call('classroom',{action:'comment',access_token:token,post_id:post.id,content:'Actual comment'});
  assert.equal(comment.status,200);assert.equal((await comment.json()).state.comments[0].approved,false);
  const read=await call('classroom',{action:'state',access_token:token});assert.equal(read.status,200);
});
test('analyzer uses the same actual database budget before CAPTCHA and keeps per-tool permission checks',async()=>{
  const input={text:'A sufficiently long classroom excerpt.',access_token:token,recaptcha_token:'fixture'};
  assert.equal((await call('tavora-content-analyzer',input)).status,403);
  await admin('update_room',{room_id:room.id,analyzer_enabled:true});requests=[];
  const response=await call('tavora-content-analyzer',input);assert.equal(response.status,403);
  assert.match((await response.json()).error,/Проверката за изпращане/);
  assert.ok(requests.some(item=>item.path.endsWith('consume_rate_limit')&&item.body.max_requests===6));
  assert.ok(requests.some(item=>item.path.endsWith('siteverify')));
});
test('invalid limiter keys and oversized budgets stay rejected by the actual SQL contract',async()=>{
  for(const body of [{bucket_key:token+':bad',max_requests:120},{bucket_key:token,max_requests:20001}]){
    const result=await rpc('consume_rate_limit',body);assert.equal(result.status,400);
  }
});
test('preflight is cached without bypassing server permissions or contacting the database',async()=>{
  requests=[];
  const response=await handlers.classroom(new Request('https://fixture.supabase.test/functions/v1/classroom',{method:'OPTIONS',headers:{Origin:'https://budimse.online'}}));
  assert.equal(response.status,204);assert.equal(response.headers.get('Access-Control-Max-Age'),'600');
  assert.equal(requests.length,0);
});
test('unchanged reads and cached authorized media URLs avoid repeated signing and still honor revocation',async()=>{
  const path=room.id+'/'+participant+'/signed-fixture.png';
  const media=await db.query("insert into private.lab_media(room_id,member_id,path,mime_type,size,uploaded) values($1,$2,$3,'image/png',100,true) returning id",[room.id,participant,path]);
  await db.query("insert into private.lab_posts(room_id,member_id,app_id,content,media_id,approved) values($1,$2,'facebook','Media fixture',$3,true)",[room.id,participant,media.rows[0].id]);
  requests=[];
  let response=await call('classroom',{action:'state',access_token:token});assert.equal(response.status,200);
  const first=(await response.json()).state;assert.ok(first.posts.find(post=>post.media)?.media.url);
  response=await call('classroom',{action:'state',access_token:token,revision:first.revision});assert.equal(response.status,200);assert.equal((await response.json()).state.unchanged,true);
  response=await call('classroom',{action:'state',access_token:token});assert.equal(response.status,200);
  assert.equal(requests.filter(item=>item.path.startsWith('/storage/v1')).length,1);
  await admin('approve_member',{room_id:room.id,member_id:participant,approved:false});
  response=await call('classroom',{action:'state',access_token:token,revision:first.revision});assert.deepEqual((await response.json()).state.posts,[]);
});
