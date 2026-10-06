import { before, after, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';

const migrationsDirectory = new URL('../supabase/migrations/', import.meta.url);
const migration = readdirSync(migrationsDirectory).filter(name => name.endsWith('.sql')).sort()
  .map(name => readFileSync(new URL(name, migrationsDirectory), 'utf8')).join('\n');
const baseline = readFileSync(new URL('./fixtures/schema-before.sql', import.meta.url), 'utf8');
let db;
const users = { super_admin: '10000000-0000-4000-8000-000000000001', editor: '10000000-0000-4000-8000-000000000002', moderator: '10000000-0000-4000-8000-000000000003', ordinary: '10000000-0000-4000-8000-000000000004' };
const session = u => u.replace('10000000', '20000000');
const factor = u => u.replace('10000000', '30000000');
const post = '40000000-0000-4000-8000-000000000001';
const pending = '40000000-0000-4000-8000-000000000002';
const hashA = 'a'.repeat(64), hashB = 'b'.repeat(64);

async function asRole(role, user, aal, query, params = []) {
  await db.exec('begin');
  try {
    await db.exec(`set local role ${role}`);
    const claims = user ? { sub: users[user], session_id: session(users[user]), role: 'authenticated', aal } : { role: 'anon' };
    await db.query("select set_config('request.jwt.claims',$1,true)", [JSON.stringify(claims)]);
    return await db.query(query, params);
  } finally { await db.exec('rollback'); }
}
async function denied(role, user, aal, query, params = []) {
  await assert.rejects(asRole(role, user, aal, query, params), e => e.code === '42501');
}

before(async () => {
  db = new PGlite();
  await db.exec(baseline);
  await db.exec(readFileSync(new URL('./fixtures/book-platform.sql', import.meta.url), 'utf8'));
  await db.exec(migration);
  for (const [role, u] of Object.entries(users)) {
    await db.query('insert into auth.users(id) values($1)', [u]);
    await db.query("insert into auth.mfa_factors(id,user_id,status) values($1,$2,'verified')", [factor(u), u]);
    await db.query("insert into auth.sessions(id,user_id,factor_id,aal) values($1,$2,$3,'aal2')", [session(u),u,factor(u)]);
    if (role !== 'ordinary') await db.query('insert into public.admin_users(user_id,role) values($1,$2)', [u,role]);
  }
  await db.query("insert into public.social_game_posts(id,platform,content,username,approved) values($1,'instagram','Approved fixture','Test',true),($2,'instagram','Private pending fixture','Test',false)", [post,pending]);
  await db.query('insert into private.game_owners(post_id,token_hash) values($1,$2)', [pending,hashA]);
  await db.query("insert into public.social_game_comments(post_id,content,approved,flagged) values($1,'Approved comment',true,false),($1,'Pending comment',false,false),($1,'Flagged comment',true,true),($2,'Hidden parent',true,false)", [post,pending]);
  await db.query("insert into public.tavora_shield_results(answers,pci_score,eei_score,cri_score,asi_score,total_score,classification,classification_details,radar_data) values('{\"fixture\":1}',0,0,0,0,0,'Fixture','{}','{}')");
  await db.exec("insert into public.contact_submissions(organization,type,email) values('Security fixture','other','test@example.invalid'); insert into public.news(title,slug,body,published) values('Published fixture','security-published','Fixture body text',true),('Private draft','security-draft','Private fixture body',false)");
  await db.exec("insert into public.book_orders(format,quantity,unit_amount,expected_amount,livemode,customer_email) values('physical',1,1499,1499,false,'book-fixture@example.invalid')");
});
after(async () => { await db?.close(); });

test('anonymous clients see approved posts only', async () => {
  const { rows } = await asRole('anon',null,null,'select id from public.social_game_posts');
  assert.deepEqual(rows.map(r=>r.id),[post]);
});
test('comments need approval, no flag and an approved parent', async () => {
  const { rows } = await asRole('anon',null,null,'select content from public.social_game_comments');
  assert.deepEqual(rows.map(r=>r.content),['Approved comment']);
});
test('anonymous visitors cannot read any assessment, even a newly inserted result', async () => {
  await denied('anon',null,null,'select * from public.tavora_shield_results');
});
test('public INSERT cannot bypass the validated server for any table', async () => {
  for (const table of ['analyses','contact_submissions','tavora_shield_results','tavora_biometric_logs','tavora_literacy_logs','social_game_posts','social_game_comments','admin_users','news']) {
    await denied('anon',null,null,`insert into public.${table} default values`);
  }
});
test('anonymous content edits, approvals, counters, deletes and truncation are denied', async () => {
  for (const query of ["update public.social_game_posts set content='attack'",'update public.social_game_posts set approved=true','update public.social_game_posts set likes=999','delete from public.social_game_posts','delete from public.social_game_comments','truncate public.social_game_posts cascade']) await denied('anon',null,null,query);
});
test('non-administrators cannot grant themselves membership', async () => {
  await denied('authenticated','ordinary','aal2',"insert into public.admin_users(user_id,role) values($1,'super_admin')",[users.ordinary]);
  await denied('authenticated','ordinary','aal2',"update public.admin_users set role='super_admin'");
});
test('an ordinary signed-in user has no private rows or authorization', async () => {
  for (const table of ['contact_submissions','tavora_shield_results']) assert.equal((await asRole('authenticated','ordinary','aal2',`select id from public.${table}`)).rows.length,0);
  assert.equal((await asRole('authenticated','ordinary','aal2','select user_id,role from public.admin_users')).rows.length,0);
  assert.equal((await asRole('authenticated','ordinary','aal2',"select public.admin_authorize('orders') allowed")).rows[0].allowed,false);
});
test('membership can be checked before MFA enrollment without exposing private data', async () => {
  const access=(await asRole('authenticated','super_admin','aal1','select public.admin_access() access')).rows[0].access;
  assert.equal(access.role,'super_admin'); assert.equal(access.mfa_verified,false); assert.deepEqual(access.permissions,[]);
  assert.equal((await asRole('authenticated','super_admin','aal1','select id from public.contact_submissions')).rows.length,0);
});
test('password-only administrators cannot edit moderation or retrieve orders', async () => {
  assert.equal((await asRole('authenticated','super_admin','aal1',"select public.admin_authorize('orders') allowed")).rows[0].allowed,false);
  assert.equal((await asRole('authenticated','super_admin','aal1','update public.social_game_posts set approved=true returning id')).rows.length,0);
});
test('MFA super administrator can access customer data', async () => {
  assert.equal((await asRole('authenticated','super_admin','aal2','select id from public.contact_submissions')).rows.length,1);
  assert.equal((await asRole('authenticated','super_admin','aal2',"select public.admin_authorize('orders') allowed")).rows[0].allowed,true);
});
test('only the current MFA super administrator can read saved book customer records', async () => {
  for (const role of ['ordinary','editor','moderator']) assert.equal((await asRole('authenticated',role,'aal2','select id from public.book_orders')).rows.length,0);
  assert.equal((await asRole('authenticated','super_admin','aal1','select id from public.book_orders')).rows.length,0);
  assert.equal((await asRole('authenticated','super_admin','aal2','select id from public.book_orders')).rows.length,1);
  await denied('authenticated','super_admin','aal2',"update public.book_orders set amount_paid=1499");
  await denied('authenticated','super_admin','aal2',"select public.configure_book_payment_secret(false,'webhook','whsec_forged')");
});
test('MFA editor can read drafts, but cannot read inquiries, orders or moderate', async () => {
  assert.equal((await asRole('authenticated','editor','aal2','select id from public.news')).rows.length,2);
  assert.equal((await asRole('authenticated','editor','aal2','select id from public.contact_submissions')).rows.length,0);
  for (const p of ['orders','moderate','private_data']) assert.equal((await asRole('authenticated','editor','aal2','select public.admin_authorize($1) allowed',[p])).rows[0].allowed,false);
});
test('MFA moderator can approve comments and posts, but cannot edit their content or counters', async () => {
  assert.equal((await asRole('authenticated','moderator','aal2','update public.social_game_posts set approved=true where id=$1 returning id',[pending])).rows.length,1);
  assert.equal((await asRole('authenticated','moderator','aal2','update public.social_game_comments set approved=true returning id')).rows.length,4);
  await denied('authenticated','moderator','aal2',"update public.social_game_posts set content='attack'");
  await denied('authenticated','moderator','aal2','update public.social_game_posts set likes=900');
  assert.equal((await asRole('authenticated','moderator','aal2',"select public.admin_authorize('news') allowed")).rows[0].allowed,false);
});
test('revoking membership denies an otherwise valid MFA session immediately', async () => {
  await db.query('delete from public.admin_users where user_id=$1',[users.editor]);
  assert.equal((await asRole('authenticated','editor','aal2',"select public.admin_authorize('news') allowed")).rows[0].allowed,false);
  await db.query("insert into public.admin_users(user_id,role) values($1,'editor')",[users.editor]);
});
test('revoked, expired, banned and unenrolled sessions are denied', async () => {
  const u=users.super_admin;
  await db.query("update auth.sessions set not_after=now()-interval '1 minute' where user_id=$1",[u]);
  assert.equal((await asRole('authenticated','super_admin','aal2',"select public.admin_authorize('orders') allowed")).rows[0].allowed,false);
  await db.query('update auth.sessions set not_after=null where user_id=$1',[u]);
  await db.query("update auth.users set banned_until=now()+interval '1 day' where id=$1",[u]);
  assert.equal((await asRole('authenticated','super_admin','aal2',"select public.admin_authorize('orders') allowed")).rows[0].allowed,false);
  await db.query('update auth.users set banned_until=null where id=$1',[u]);
  await db.query("update auth.mfa_factors set status='unverified' where user_id=$1",[u]);
  assert.equal((await asRole('authenticated','super_admin','aal2',"select public.admin_authorize('orders') allowed")).rows[0].allowed,false);
  await db.query("update auth.mfa_factors set status='verified' where user_id=$1",[u]);
  await db.query('delete from auth.sessions where user_id=$1',[u]);
  assert.equal((await asRole('authenticated','super_admin','aal2',"select public.admin_authorize('orders') allowed")).rows[0].allowed,false);
  await db.query("insert into auth.sessions(id,user_id,factor_id,aal) values($1,$2,$3,'aal2')",[session(u),u,factor(u)]);
});
test('public callers cannot execute server-only game or rate-limit RPCs', async () => {
  for (const role of ['anon','authenticated']) {
    const user=role==='authenticated'?'super_admin':null;
    for (const sql of ["select public.game_history('"+hashA+"')","select public.consume_rate_limit('"+hashA+"',5)","select public.create_game_post('{}','"+hashA+"')", "select public.game_interact('like','"+post+"','"+hashA+"','{\"liked\":true}')"]) await denied(role,user,'aal2',sql);
  }
});
test('even administrators cannot select private capability hashes', async () => {
  await denied('authenticated','super_admin','aal2','select * from private.game_owners');
});
test('only the private owner capability retrieves pending history', async () => {
  const a=(await asRole('service_role',null,null,'select public.game_history($1) history',[hashA])).rows[0].history;
  const b=(await asRole('service_role',null,null,'select public.game_history($1) history',[hashB])).rows[0].history;
  assert.equal(a.length,1); assert.equal(a[0].id,pending); assert.deepEqual(b,[]);
});
test('forged ownership cannot delete a foreign pending post', async () => {
  await assert.rejects(asRole('service_role',null,null,"select public.game_interact('delete',$1,$2)",[pending,hashB]), /Not owner/);
  assert.equal((await db.query('select id from public.social_game_posts where id=$1',[pending])).rows.length,1);
});
test('valid owner deletion removes its pending post, comments and private ownership atomically', async () => {
  await db.exec('begin; set local role service_role');
  try {
    const result = (await db.query("select public.game_interact('delete',$1,$2) result", [pending,hashA])).rows[0].result;
    assert.equal(result.deleted, true);
    for (const query of ['select count(*)::int n from public.social_game_posts where id=$1',
      'select count(*)::int n from public.social_game_comments where post_id=$1',
      'select count(*)::int n from private.game_owners where post_id=$1']) {
      assert.equal((await db.query(query,[pending])).rows[0].n,0);
    }
    assert.equal((await db.query('select count(*)::int n from public.social_game_posts where id=$1',[post])).rows[0].n,1);
  } finally { await db.exec('rollback'); }
});
test('server assigns pending status, ignores client approval and counter injection cannot reach RPC', async () => {
  const data={ platform:'facebook',content:'Fixture',username:'Test',approved:true };
  const created=(await asRole('service_role',null,null,'select public.create_game_post($1,$2) post',[JSON.stringify(data),hashB])).rows[0].post;
  assert.equal(created.approved,false); assert.equal(created.session_id,null);
});
test('reactions are atomic and idempotent', async () => {
  await db.exec('begin');
  try {
    await db.exec('set local role service_role');
    const call=async liked=>(await db.query("select public.game_interact('like',$1,$2,$3) result",[post,hashA,JSON.stringify({liked})])).rows[0].result;
    assert.equal((await call(true)).likes,1); assert.equal((await call(true)).likes,1); assert.equal((await call(false)).likes,0);
  } finally { await db.exec('rollback'); }
});
test('a comment remains pending regardless of supplied approved/flagged fields', async () => {
  const result=(await asRole('service_role',null,null,"select public.game_interact('comment',$1,$2,$3) result",[post,hashA,JSON.stringify({ content:'Fixture',username:'Test',approved:true,flagged:true })])).rows[0].result;
  assert.equal(result.comment.approved,false); assert.equal(result.comment.flagged,false);
});
test('unknown actions and unavailable posts cannot be used to mutate data', async () => {
  await assert.rejects(asRole('service_role',null,null,"select public.game_interact('approve',$1,$2)",[post,hashA]),/Invalid action/);
  await assert.rejects(asRole('service_role',null,null,"select public.game_interact('like',$1,$2,'{\"liked\":true}')",[pending,hashA]),/Post unavailable/);
});
test('persistent rate limit shares one atomic counter across requests', async () => {
  await db.exec('begin');
  try {
    await db.exec('set local role service_role');
    const hit=async ()=>(await db.query('select public.consume_rate_limit($1,2) allowed',[hashB])).rows[0].allowed;
    assert.equal(await hit(),true); assert.equal(await hit(),true); assert.equal(await hit(),false);
  } finally { await db.exec('rollback'); }
});


test('new public functions and tables do not accidentally inherit visitor privileges', async () => {
  await db.exec("create function public.future_security_fixture() returns integer language sql as $$ select 42 $$; create table public.future_security_table(id integer)");
  assert.equal((await db.query("select has_function_privilege('anon','public.future_security_fixture()','execute') allowed")).rows[0].allowed,false);
  assert.equal((await db.query("select has_table_privilege('anon','public.future_security_table','select') allowed")).rows[0].allowed,false);
});
