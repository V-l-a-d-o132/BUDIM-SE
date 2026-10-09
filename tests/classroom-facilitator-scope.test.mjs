import {before,after,test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {PGlite} from '@electric-sql/pglite';

let db,roomA,roomB;
const actors=['moderator','moderator','super_admin','editor'].map((role,index)=>({
  role,id:`10000000-0000-4000-8000-00000000010${index}`,
  session:`20000000-0000-4000-8000-00000000010${index}`,
  factor:`30000000-0000-4000-8000-00000000010${index}`,
}));
const [teacherA,teacherB,central,editor]=actors;
async function query(actor,sql,params=[],aal='aal2',role='authenticated'){
  await db.exec('begin');
  try{
    await db.exec(`set local role ${role}`);
    await db.query("select set_config('request.jwt.claims',$1,true)",[JSON.stringify({
      role,sub:actor?.id,session_id:actor?.session,aal,
    })]);
    const result=await db.query(sql,params);await db.exec('commit');return result;
  }catch(error){await db.exec('rollback');throw error;}
}
const admin=(actor,operation,details={})=>query(actor,'select public.lab_admin($1,$2) result',
  [operation,JSON.stringify(details)]).then(result=>result.rows[0].result);
const forbidden=error=>error.code==='42501';
before(async()=>{
  db=new PGlite();
  for(const file of ['schema-before.sql','book-platform.sql'])await db.exec(readFileSync(new URL(`./fixtures/${file}`,import.meta.url),'utf8'));
  const directory=new URL('../supabase/migrations/',import.meta.url);
  for(const file of readdirSync(directory).filter(file=>file.endsWith('.sql')).sort())await db.exec(readFileSync(new URL(file,directory),'utf8'));
  for(const actor of actors){
    await db.query('insert into auth.users(id) values($1)',[actor.id]);
    await db.query("insert into auth.mfa_factors(id,user_id,status) values($1,$2,'verified')",[actor.factor,actor.id]);
    await db.query("insert into auth.sessions(id,user_id,factor_id,aal) values($1,$2,$3,'aal2')",[actor.session,actor.id,actor.factor]);
    await db.query('insert into public.admin_users(user_id,role) values($1,$2)',[actor.id,actor.role]);
  }
  roomA=(await admin(teacherA,'create_room',{name:'School A'})).selected_room;
  roomB=(await admin(teacherB,'create_room',{name:'School B'})).selected_room;
  for(const room of [roomA,roomB])await db.query("insert into storage.objects(bucket_id,name) values('classroom-media',$1)",[`${room}/member/video.mp4`]);
  await db.query("insert into storage.objects(bucket_id,name) values('classroom-media','malformed/file.mp4')");
});
after(async()=>{await db?.close();});

test('facilitators list only owned classrooms while the central administrator sees both',async()=>{
  for(const [teacher,own] of [[teacherA,roomA],[teacherB,roomB]]){
    const response=await admin(teacher,'list');
    assert.deepEqual(response.rooms.map(room=>room.id),[own]);assert.equal(response.selected_room,own);
    assert.equal(response.can_assign_facilitators,false);
  }
  assert.deepEqual(new Set((await admin(central,'list')).rooms.map(room=>room.id)),new Set([roomA,roomB]));
  await assert.rejects(admin(editor,'list'),forbidden);
});
test('knowing a foreign room ID cannot expose content or authorize any administrative mutation',async()=>{
  const fakeId='40000000-0000-4000-8000-000000000100';
  for(const operation of ['list','update_room','approve_member','moderate_post','moderate_comment','delete_post','delete_comment','delete_message','set_facilitator']){
    await assert.rejects(admin(teacherA,operation,{room_id:roomB,status:'closed',member_id:fakeId,post_id:fakeId,comment_id:fakeId,message_id:fakeId,user_id:teacherA.id,active:true}),forbidden);
  }
  for(const operation of ['update_room','approve_member','delete_post'])await assert.rejects(admin(teacherA,operation,{}),forbidden);
  assert.equal((await admin(teacherB,'list',{room_id:roomB})).rooms[0].status,'open');
});
test('only the central administrator can assign an existing eligible facilitator',async()=>{
  await assert.rejects(admin(teacherA,'set_facilitator',{room_id:roomA,user_id:teacherB.id,active:true}),forbidden);
  for(const user_id of [editor.id,'50000000-0000-4000-8000-000000000100']){
    await assert.rejects(admin(central,'set_facilitator',{room_id:roomB,user_id,active:true}),error=>error.code==='22023');
  }
  const granted=await admin(central,'set_facilitator',{room_id:roomB,user_id:teacherA.id,active:true});
  assert.deepEqual(granted.facilitators,[teacherA.id]);
  assert.equal((await admin(teacherA,'list',{room_id:roomB})).selected_room,roomB);
  await admin(teacherA,'update_room',{room_id:roomB,analyzer_enabled:true});
  assert.equal((await admin(teacherB,'list',{room_id:roomB})).rooms[0].analyzer_enabled,true);
});
test('signed media requests are scoped to the current allowed room and reject malformed paths',async()=>{
  // The assignment from the previous test allows A to read both; B still has only B.
  const files=await query(teacherB,"select name from storage.objects where bucket_id='classroom-media'");
  assert.deepEqual(files.rows.map(row=>row.name),[`${roomB}/member/video.mp4`]);
  const allowed=await query(teacherA,"select name from storage.objects where bucket_id='classroom-media'");
  assert.equal(allowed.rows.length,2);
  assert.equal((await query(teacherA,"select private.can_read_lab_media('not-a-uuid/file') allowed")).rows[0].allowed,false);
  for(const role of ['anon','authenticated'])await assert.rejects(query(teacherA,'select * from private.lab_room_facilitators',[],undefined,role),forbidden);
});
test('revocation removes foreign room and media access on the next request without deleting content',async()=>{
  await admin(central,'set_facilitator',{room_id:roomB,user_id:teacherA.id,active:false});
  await assert.rejects(admin(teacherA,'list',{room_id:roomB}),forbidden);
  assert.deepEqual((await admin(teacherA,'list')).rooms.map(room=>room.id),[roomA]);
  const files=await query(teacherA,'select name from storage.objects');
  assert.deepEqual(files.rows.map(row=>row.name),[`${roomA}/member/video.mp4`]);
  assert.equal((await admin(central,'list')).rooms.length,2);
});
test('an assignment never bypasses current role, session, ban or verified MFA',async()=>{
  await admin(central,'set_facilitator',{room_id:roomB,user_id:teacherA.id,active:true});
  await assert.rejects(query(teacherA,"select public.lab_admin('list',$1)",[JSON.stringify({room_id:roomB})],'aal1'),forbidden);
  for(const [change,restore] of [
    ["update public.admin_users set role='editor' where user_id=$1","update public.admin_users set role='moderator' where user_id=$1"],
    ["update auth.users set banned_until=now()+interval '1 hour' where id=$1","update auth.users set banned_until=null where id=$1"],
    ["update auth.sessions set not_after=now()-interval '1 second' where user_id=$1","update auth.sessions set not_after=null where user_id=$1"],
    ["update auth.mfa_factors set status='unverified' where user_id=$1","update auth.mfa_factors set status='verified' where user_id=$1"],
  ]){
    await db.query(change,[teacherA.id]);
    try{
      await assert.rejects(admin(teacherA,'list',{room_id:roomB}),forbidden);
      assert.equal((await query(teacherA,'select name from storage.objects')).rows.length,0);
    }finally{await db.query(restore,[teacherA.id]);}
  }
  assert.equal((await admin(teacherA,'list',{room_id:roomB})).selected_room,roomB);
});
