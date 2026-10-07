import { before, after, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync,readdirSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
let db,room,otherRoom,memberA,memberB,foreignMember,post;
const adminId='10000000-0000-4000-8000-000000000081';
const session='20000000-0000-4000-8000-000000000081';
const factor='30000000-0000-4000-8000-000000000081';
const A='a'.repeat(64), B='b'.repeat(64), C='c'.repeat(64), F='f'.repeat(64);
async function query(role,sql,params=[],aal='aal2') {
  await db.exec('begin');
  try{
    await db.exec('set local role '+role);
    const claims=role==='authenticated'?{sub:adminId,session_id:session,aal,role}:{role};
    await db.query("select set_config('request.jwt.claims',$1,true)",[JSON.stringify(claims)]);
    const result=await db.query(sql,params);await db.exec('commit');return result;
  }catch(err){await db.exec('rollback');throw err;}
}
const admin=(operation,details={})=>query('authenticated','select public.lab_admin($1,$2) result',[operation,JSON.stringify(details)]).then(result=>result.rows[0].result);
const state=hash=>query('service_role','select public.lab_state($1) result',[hash]).then(result=>result.rows[0].result);
const command=(hash,operation,details={})=>query('service_role','select public.lab_command($1,$2,$3) result',[hash,operation,JSON.stringify(details)]).then(result=>result.rows[0].result);
const access=(hash,scope)=>query('service_role','select public.lab_check_access($1,$2) result',[hash,scope]).then(result=>result.rows[0].result);
before(async()=>{
  db=new PGlite();
  await db.exec(readFileSync(new URL('./fixtures/schema-before.sql',import.meta.url),'utf8'));
  await db.exec(readFileSync(new URL('./fixtures/book-platform.sql',import.meta.url),'utf8'));
  const directory=new URL('../supabase/migrations/',import.meta.url);
  for(const file of readdirSync(directory).filter(file=>file.endsWith('.sql')).sort())await db.exec(readFileSync(new URL(file,directory),'utf8'));
  await db.query('insert into auth.users(id) values($1)',[adminId]);
  await db.query("insert into auth.mfa_factors(id,user_id,status) values($1,$2,'verified')",[factor,adminId]);
  await db.query("insert into auth.sessions(id,user_id,factor_id,aal) values($1,$2,$3,'aal2')",[session,adminId,factor]);
  await db.query("insert into public.admin_users(user_id,role) values($1,'moderator')",[adminId]);
  let result=await admin('create_room',{name:'Classroom fixture'});room=result.rooms[0];
  result=await admin('create_room',{name:'Isolated fixture'});otherRoom=result.rooms.find(item=>item.id!==room.id);
  for(const [hash,selected,alias]of [[A,room,'Alice'],[B,room,'Bob'],[F,otherRoom,'Foreign']]){
    const joined=await query('service_role','select public.lab_join($1,$2,$3) result',[hash,selected.code,alias]);
    const id=joined.rows[0].result.access.member_id;
    await admin('approve_member',{room_id:selected.id,member_id:id,approved:true,simulators:true,analyzer:true});
    if(hash===A)memberA=id;else if(hash===B)memberB=id;else foreignMember=id;
  }
});
after(async()=>{await db?.close();});
test('public and authenticated clients cannot read private room content or call capability RPCs',async()=>{
  for(const role of ['anon','authenticated']){
    await assert.rejects(query(role,'select * from private.lab_members'),error=>error.code==='42501');
    await assert.rejects(query(role,'select public.lab_state($1)',[A]),error=>error.code==='42501');
    await assert.rejects(query(role,"select public.lab_command($1,'publish','{}')",[A]),error=>error.code==='42501');
  }
});
test('room membership without verified MFA cannot administer grants',async()=>{
  await assert.rejects(query('authenticated',"select public.lab_admin('list','{}')",[],'aal1'),error=>error.code==='42501');
  await assert.rejects(query('anon',"select public.lab_admin('list','{}')"),error=>error.code==='42501');
});
test('pending participants cannot see classroom content or grant themselves permissions',async()=>{
  const joined=(await query('service_role','select public.lab_join($1,$2,$3) result',[C,room.code,'Pending'])).rows[0].result;
  assert.equal(joined.access.status,'pending');assert.deepEqual(joined.posts,[]);assert.deepEqual(joined.participants,[]);
  assert.equal(await access(C,'simulators'),null);
  await assert.rejects(command(C,'publish',{app_id:'facebook',content:'Cannot post',approved:true}),error=>error.code==='42501');
});
test('analyzer requires both individual and current room permission',async()=>{
  assert.equal(await access(A,'analyzer'),null);
  await admin('update_room',{room_id:room.id,analyzer_enabled:true});
  assert.equal((await access(A,'analyzer')).member_id,memberA);
  await admin('approve_member',{room_id:room.id,member_id:memberA,approved:true,simulators:true,analyzer:false});
  assert.equal(await access(A,'analyzer'),null);assert.ok(await access(A,'simulators'));
});
test('publication begins with actual zero counts and stays private until teacher approval',async()=>{
  const result=await command(A,'publish',{app_id:'facebook',kind:'post',content:'Ordinary classroom post',likes:999,approved:true});
  post=result.posts[0].id;
  for(const field of ['likes','comments','shares','views'])assert.equal(result.posts[0][field],0);
  assert.equal(result.posts[0].approved,false);assert.deepEqual((await state(B)).posts,[]);
  await admin('moderate_post',{room_id:room.id,post_id:post,approved:true});
  assert.equal((await state(B)).posts[0].id,post);assert.deepEqual((await state(F)).posts,[]);
});
test('reactions, saves, shares and unique displayed views survive reads and repeated requests',async()=>{
  for(let i=0;i<3;i++){
    await command(B,'react',{post_id:post,reaction:'love'});
    await command(B,'save',{post_id:post,active:true});
    await command(B,'share',{post_id:post,active:true});
    await command(B,'view',{post_id:post});
  }
  let item=(await state(B)).posts[0];assert.equal(item.likes,1);assert.equal(item.shares,1);assert.equal(item.views,1);
  assert.equal(item.reaction,'love');assert.equal(item.saved,true);assert.equal(item.shared,true);
  await command(B,'react',{post_id:post,reaction:'angry'});assert.equal((await state(B)).posts[0].likes,1);
  await command(B,'react',{post_id:post,reaction:null});await command(B,'share',{post_id:post,active:false});
  item=(await state(B)).posts[0];assert.equal(item.likes,0);assert.equal(item.shares,0);
});
test('moderation controls comment visibility and exact approved comment counts',async()=>{
  let result=await command(B,'comment',{post_id:post,content:'A classroom comment',approved:true});
  assert.equal(result.comments[0].approved,false);assert.equal((await state(A)).comments.length,0);
  await admin('moderate_comment',{room_id:room.id,comment_id:result.comments[0].id,approved:true});
  result=await state(A);assert.equal(result.comments.length,1);assert.equal(result.posts[0].comments,1);
  await admin('delete_comment',{room_id:room.id,comment_id:result.comments[0].id});
  assert.equal((await state(A)).posts[0].comments,0);
});
test('foreign room IDs and ownership cannot be used for reactions, messages, follows or deletion',async()=>{
  for(const [hash,action,details]of [[F,'react',{post_id:post,reaction:'like'}],[A,'message',{app_id:'whatsapp',recipient_id:foreignMember,content:'Unauthorized'}],[A,'follow',{target_id:foreignMember,active:true}],[B,'delete_post',{post_id:post}]]){
    await assert.rejects(command(hash,action,details),error=>error.code==='42501');
  }
});
test('a direct conversation is visible only to its parties and the classroom moderator',async()=>{
  const before=(await state(C)).messages.length;
  await command(A,'message',{app_id:'whatsapp',recipient_id:memberB,content:'Direct classroom message'});
  assert.equal((await state(B)).messages.length,1);assert.equal((await state(A)).messages.length,1);
  assert.equal((await state(C)).messages.length,before);
  assert.equal((await admin('list',{room_id:room.id})).messages.length,1);
});
test('retrying the same post or message request creates only one record',async()=>{
  const payload={app_id:'facebook',content:'Idempotent fixture',request_id:'70000000-0000-4000-8000-000000000009'};
  for(let i=0;i<3;i++)await command(A,'publish',payload);
  assert.equal((await state(A)).posts.filter(item=>item.content===payload.content).length,1);
  const message={app_id:'whatsapp',content:'Idempotent message',recipient_id:memberB,request_id:'70000000-0000-4000-8000-000000000010'};
  for(let i=0;i<3;i++)await command(A,'message',message);
  assert.equal((await state(A)).messages.filter(item=>item.content===message.content).length,1);
});
test('following a participant in one application does not subscribe in another',async()=>{
  await command(A,'follow',{target_id:memberB,app_id:'instagram',active:true});
  const follows=(await state(A)).app_follows;
  assert.equal(follows.filter(item=>item.app_id==='instagram'&&item.target_id===memberB).length,1);
  assert.equal(follows.filter(item=>item.app_id==='youtube').length,0);
});
test('room pause, closure, scope changes, expiry and revocation take effect on every operation',async()=>{
  await admin('update_room',{room_id:room.id,status:'paused'});
  assert.equal(await access(A,'simulators'),null);assert.deepEqual((await state(A)).posts,[]);
  await assert.rejects(command(A,'react',{post_id:post,reaction:'like'}),error=>error.code==='42501');
  await admin('update_room',{room_id:room.id,status:'open'});
  assert.ok(await access(A,'simulators'));
  await admin('approve_member',{room_id:room.id,member_id:memberB,approved:false,simulators:false,analyzer:false});
  assert.deepEqual((await state(B)).posts,[]);
  await db.query("update private.lab_rooms set expires_at=now()-interval '1 minute' where id=$1",[room.id]);
  assert.equal(await access(A,'simulators'),null);
  await admin('update_room',{room_id:room.id,status:'closed',extend_hours:8});
  assert.equal(await access(A,'simulators'),null);
});
test('closed-room requests never create write-idempotency records',async()=>{
  const before=(await db.query('select count(*)::int n from private.lab_requests')).rows[0].n;
  await assert.rejects(command(A,'publish',{app_id:'facebook',content:'Blocked',request_id:'70000000-0000-4000-8000-000000000001'}),error=>error.code==='42501');
  assert.equal((await db.query('select count(*)::int n from private.lab_requests')).rows[0].n,before);
});
