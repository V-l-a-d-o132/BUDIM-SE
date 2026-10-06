import { before, after, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { PGlite } from '@electric-sql/pglite';

let db; let sequence = 0;
const owner = 'a'.repeat(64), other = 'b'.repeat(64);
const actor = '10000000-0000-4000-8000-000000000001';
before(async () => {
  db = new PGlite();
  for (const file of ['schema-before.sql', 'book-platform.sql']) await db.exec(readFileSync(new URL('./fixtures/'+file, import.meta.url), 'utf8'));
  const directory = new URL('../supabase/migrations/', import.meta.url);
  for (const file of readdirSync(directory).filter(n=>n.endsWith('.sql')).sort()) await db.exec(readFileSync(new URL(file,directory),'utf8'));
  await db.query('insert into auth.users(id) values($1)',[actor]);
  await db.query("insert into auth.mfa_factors(id,user_id,status) values($1,$2,'verified')",[actor.replace('1000','3000'),actor]);
  await db.query("insert into auth.sessions(id,user_id,factor_id,aal) values($1,$2,$3,'aal2')",[actor.replace('1000','2000'),actor,actor.replace('1000','3000')]);
  await db.query("insert into public.admin_users(user_id,role) values($1,'super_admin')",[actor]);
});
after(async()=>db?.close());
async function service(sql, params=[]) {
  await db.exec('begin');
  try {
    await db.exec('set local role service_role');
    await db.query("select set_config('request.jwt.claims',$1,true)",[JSON.stringify({role:'service_role'})]);
    const result = await db.query(sql,params); await db.exec('commit'); return result;
  } catch(error) { await db.exec('rollback'); throw error; }
}
async function begin(format='physical',quantity=1,request=randomUUID(),hash=owner,live=false,consent=format==='digital') {
  return (await service('select public.begin_book_order($1,$2,$3,$4,$5,$6) result',[request,hash,format,quantity,live,consent])).rows[0].result;
}
async function edition(letter='c') {
  const hash=letter.repeat(64); const path=`editions/${randomUUID()}/${hash}.pdf`;
  return (await service('select public.activate_book_edition($1,$2,$3) result',[path,'Fixture edition '+letter,hash])).rows[0].result;
}
async function get(id) { return (await db.query('select * from public.book_orders where id=$1',[id])).rows[0]; }
async function event(order,type='checkout.session.completed',changes={},id=`evt_fixture_${++sequence}`,live=order.livemode) {
  const data={order_id:order.id,format:order.format,session_id:`cs_test_${order.id}`,session_status:'complete',payment_status:'paid',payment_intent_id:`pi_${order.id}`,currency:'eur',amount_total:order.expected_amount,customer_email:'test@example.invalid',shipping_address:{country:'BG',city:'Sofia'},...changes};
  return (await service('select public.apply_book_payment_event($1,$2,$3,$4,$5) result',[id,type,live,Math.floor(Date.now()/1000),data])).rows[0].result;
}
const refund=(order,amount,id)=>event(order,'charge.refunded',{payment_intent_id:`pi_${order.id}`,amount_refunded:amount},id);

test('physical price and quantity are stored as integer EUR cents',async()=>{
  const o=await begin('physical',3); assert.equal(o.unit_amount,1499); assert.equal(o.expected_amount,4497); assert.equal(o.currency,'eur'); assert.equal(o.payment_status,'created');
});
test('retrying the same purchase request returns one order and rejects changed ownership or quantity',async()=>{
  const key=randomUUID(); const first=await begin('physical',1,key); const retry=await begin('physical',1,key);
  assert.equal(first.id,retry.id); await assert.rejects(begin('physical',2,key),/conflict/); await assert.rejects(begin('physical',1,key,other),/conflict/);
});
test('test and live requests cannot share an order',async()=>{
  const key=randomUUID(); const t=await begin('physical',1,key,owner,false); const l=await begin('physical',1,key,owner,true); assert.notEqual(t.id,l.id);
});
test('the database rejects non-EUR currencies and changed catalogue prices',async()=>{
  const o=await begin(); await assert.rejects(service("update public.book_orders set currency='bgn' where id=$1",[o.id]),e=>e.code==='23514');
  await assert.rejects(service('update public.book_orders set unit_amount=1,expected_amount=1 where id=$1',[o.id]),e=>e.code==='23514');
});
test('an ebook cannot be sold before an active file exists',async()=>{ await assert.rejects(begin('digital'),/unavailable/); });
test('digital orders require one copy and explicit immediate delivery request',async()=>{
  await edition(); await assert.rejects(begin('digital',2),/Invalid order/); await assert.rejects(begin('digital',1,randomUUID(),owner,false,false),/Invalid order/);
});
test('an ebook costs EUR 3.99 and keeps its purchased edition after a later update',async()=>{
  const first=await edition('d'); const o=await begin('digital'); await edition('e');
  assert.equal(o.expected_amount,399); assert.equal(o.edition_id,first.id); assert.equal((await get(o.id)).edition_id,first.id); assert.equal(o.digital_consent_version,'immediate-delivery-v1');
});
test('a token for another order never reads the requested order',async()=>{
  const a=await begin('physical',1,randomUUID(),owner); const b=await begin('physical',1,randomUUID(),other);
  assert.equal((await service('select public.book_order_for_owner($1,$2) result',[a.id,other])).rows[0].result,null);
  assert.equal((await service('select public.book_order_for_owner($1,$2) result',[b.id,owner])).rows[0].result,null);
  assert.equal((await service('select public.book_order_for_owner($1,$2) result',[a.id,owner])).rows[0].result.id,a.id);
});
test('an unpaid completed event remains pending without fulfillment',async()=>{
  const o=await begin(); await event(o,'checkout.session.completed',{payment_status:'unpaid'}); const current=await get(o.id);
  assert.equal(current.payment_status,'pending'); assert.equal(current.amount_paid,0); assert.equal(current.fulfillment_status,'awaiting_payment');
});
test('delayed success makes a pending order dispatchable exactly once',async()=>{
  const o=await begin(); await event(o,'checkout.session.completed',{payment_status:'unpaid'}); await event(o,'checkout.session.async_payment_succeeded');
  assert.equal((await get(o.id)).fulfillment_status,'ready'); assert.equal((await get(o.id)).amount_paid,1499);
});
test('delayed failure never grants ebook access',async()=>{
  const o=await begin('digital'); await event(o,'checkout.session.completed',{payment_status:'unpaid'}); await event(o,'checkout.session.async_payment_failed',{payment_status:'unpaid'});
  assert.equal((await get(o.id)).payment_status,'failed'); assert.equal((await service('select public.book_download_for_owner($1,$2) result',[o.id,owner])).rows[0].result,null);
});
test('a declined payment and an expired session never become paid orders',async()=>{
  const o=await begin(); await event(o,'payment_intent.payment_failed'); assert.equal((await get(o.id)).payment_status,'failed');
  await event(o,'checkout.session.expired',{session_status:'expired',payment_status:'unpaid'}); assert.equal((await get(o.id)).amount_paid,0);
});
test('replayed event IDs and equivalent completion events do not duplicate fulfillment',async()=>{
  const o=await begin(); const id=`evt_replay_${++sequence}`; await event(o,undefined,{},id); const retry=await event(o,undefined,{},id); assert.equal(retry.duplicate,true);
  await event(o); const histories=await db.query("select count(*)::integer n from private.book_order_history where order_id=$1 and action='payment_verified'",[o.id]); assert.equal(histories.rows[0].n,1);
});
test('late failures, pending notifications and expiry cannot downgrade a verified payment',async()=>{
  const o=await begin(); await event(o); await event(o,'checkout.session.completed',{payment_status:'unpaid'}); await event(o,'checkout.session.async_payment_failed',{payment_status:'unpaid'}); await event(o,'checkout.session.expired',{payment_status:'unpaid',session_status:'expired'});
  assert.equal((await get(o.id)).payment_status,'paid'); assert.equal((await get(o.id)).fulfillment_status,'ready');
});
test('mismatched amounts, currencies, formats, sessions and modes are rejected transactionally',async()=>{
  const o=await begin();
  for (const changes of [{amount_total:1500},{amount_total:null},{currency:'usd'},{format:'digital'}]) await assert.rejects(event(o,undefined,changes),/mismatch/);
  await event(o); await assert.rejects(event(o,undefined,{session_id:'cs_test_other'}),/mismatch/); await assert.rejects(event(o,undefined,{},undefined,true),/Unknown book order/);
});
test('failed event transactions can recover on provider retry with the same ID',async()=>{
  const o=await begin(); const id=`evt_recover_${++sequence}`; await assert.rejects(event(o,undefined,{currency:'usd'},id));
  assert.equal((await db.query('select count(*)::integer n from private.book_payment_events where event_id=$1',[id])).rows[0].n,0);
  await event(o,undefined,{},id); assert.equal((await get(o.id)).payment_status,'paid');
});
test('full refunds revoke new download links and cancel fulfillment',async()=>{
  const o=await begin('digital'); await event(o); await refund(o,399); assert.equal((await get(o.id)).payment_status,'refunded');
  assert.equal((await get(o.id)).fulfillment_status,'cancelled'); assert.equal((await service('select public.book_download_for_owner($1,$2) result',[o.id,owner])).rows[0].result,null);
});
test('partial refunds preserve paid access and stale refund snapshots cannot reverse them',async()=>{
  const o=await begin('digital'); await event(o); await refund(o,100); await refund(o,50);
  assert.equal((await get(o.id)).amount_refunded,100); assert.equal((await get(o.id)).payment_status,'partially_refunded');
  assert.ok((await service('select public.book_download_for_owner($1,$2) result',[o.id,owner])).rows[0].result.object_path);
});
test('a refund arriving before payment confirmation still revokes access once that payment is recorded',async()=>{
  const o=await begin('digital'); await refund(o,399); await event(o); const current=await get(o.id);
  assert.equal(current.amount_paid,399); assert.equal(current.amount_refunded,399); assert.equal(current.payment_status,'refunded'); assert.equal(current.fulfillment_status,'cancelled');
});
test('shipping requires a paid physical order, a valid transition and a carrier reference',async()=>{
  const o=await begin(); const update=(previous,next,carrier='',tracking='')=>service('select public.update_book_delivery($1,$2,$3,$4,$5,$6) result',[o.id,previous,next,carrier,tracking,actor]);
  await assert.rejects(update('ready','preparing'),/not dispatchable/); await event(o); await assert.rejects(update('ready','shipped','Fixture','123'),/Invalid delivery/);
  await update('ready','preparing'); await assert.rejects(update('ready','preparing'),/conflict/); await assert.rejects(update('preparing','shipped'),/required/);
  await update('preparing','shipped','Fixture carrier','TRACK123'); await update('shipped','delivered'); const current=await get(o.id);
  assert.equal(current.fulfillment_status,'delivered'); assert.equal(current.tracking_number,'TRACK123'); assert.ok(current.shipped_at); assert.ok(current.delivered_at);
});
test('browser roles cannot write orders, private capabilities or secret configuration',async()=>{
  await db.exec('begin'); try {
    await db.exec('set local role anon');
    for (const query of ['select * from public.book_orders','select * from private.book_order_tokens','select public.book_payment_secret(false,\'webhook\')']) {
      await db.exec('savepoint denied'); await assert.rejects(db.query(query),e=>e.code==='42501'); await db.exec('rollback to savepoint denied');
    }
  } finally { await db.exec('rollback'); }
});
test('the Vault adapter requires a service JWT and returns no secret to authenticated users',async()=>{
  await service("select public.configure_book_payment_secret(false,'webhook','whsec_fixture','we_fixture')");
  const config=(await service('select public.book_payment_configuration(false) result')).rows[0].result; assert.equal(config.webhook_configured,true); assert.equal('secret' in config,false);
  await db.exec('begin'); try {
    await db.exec('set local role service_role'); await db.query("select set_config('request.jwt.claims','{}',true)"); await assert.rejects(db.query("select public.book_payment_secret(false,'webhook')"),e=>e.code==='42501');
  } finally { await db.exec('rollback'); }
});
test('the PDF bucket is private and ordinary visitors cannot read or upload objects',async()=>{
  assert.equal((await db.query("select public from storage.buckets where id='book-downloads'")).rows[0].public,false);
  await db.exec('begin'); try {
    await db.exec('set local role authenticated'); await db.query("select set_config('request.jwt.claims',$1,true)",[JSON.stringify({role:'authenticated',sub:randomUUID(),aal:'aal2'})]);
    assert.equal((await db.query("select * from storage.objects where bucket_id='book-downloads'")).rows.length,0);
    await assert.rejects(db.query("insert into storage.objects(bucket_id,name) values('book-downloads',$1)",[`editions/${randomUUID()}/${'f'.repeat(64)}.pdf`]),e=>e.code==='42501');
  } finally { await db.exec('rollback'); }
});
test('order totals include all tracked rows and refunds, beyond a display page',async()=>{
  const before=(await service('select public.book_order_totals(false) result')).rows[0].result;
  await service("insert into public.book_orders(format,quantity,unit_amount,expected_amount,amount_paid,amount_refunded,payment_status,livemode) select 'physical',1,1499,1499,1499,100,'partially_refunded',false from generate_series(1,1100)");
  const after=(await service('select public.book_order_totals(false) result')).rows[0].result;
  assert.equal(after.gross_minor-before.gross_minor,1100*1499); assert.equal(after.refunded_minor-before.refunded_minor,1100*100); assert.equal(after.net_minor-before.net_minor,1100*1399); assert.equal(after.currency,'eur');
});


test('a queue of 500 payment redeliveries grants fulfillment once and keeps the full refund',async()=>{
  const o=await begin();
  const payload={order_id:o.id,format:o.format,session_id:`cs_test_${o.id}`,session_status:'complete',payment_status:'paid',payment_intent_id:`pi_${o.id}`,currency:'eur',amount_total:o.expected_amount};
  const id=`evt_stress_${o.id}`;
  const replies=await Promise.all(Array.from({length:500},()=>db.query('select public.apply_book_payment_event($1,$2,$3,$4,$5) result',[id,'checkout.session.completed',false,Math.floor(Date.now()/1000),payload])));
  assert.equal(replies.filter(r=>r.rows[0].result.duplicate===true).length,499);
  await refund(o,1499);await event(o);
  const current=await get(o.id);assert.equal(current.payment_status,'refunded');assert.equal(current.amount_refunded,1499);
  assert.equal((await db.query("select count(*)::integer n from private.book_order_history where order_id=$1 and action='payment_verified'",[o.id])).rows[0].n,1);
});
test('limiter cleanup removes at most 200 expired buckets and leaves live limits intact',async()=>{
  const prefix=randomUUID().replaceAll('-','');
  await db.query("insert into private.rate_limits(bucket,expires_at) select lpad($1||i::text,64,'0'),now()-interval '1 day' from generate_series(1,1000) i",[prefix]);
  const live=prefix.padEnd(64,'f');
  await db.query('insert into private.rate_limits(bucket,hits) values($1,5)',[live]);
  const before=(await db.query('select count(*)::integer n from private.rate_limits where expires_at<now()')).rows[0].n;
  const key=randomUUID().replaceAll('-','').padEnd(64,'a');
  await service('select public.consume_rate_limit($1,7)',[key]);
  const after=(await db.query('select count(*)::integer n from private.rate_limits where expires_at<now()')).rows[0].n;
  assert.equal(before-after,200);
  assert.equal((await db.query('select hits from private.rate_limits where bucket=$1',[live])).rows[0].hits,5);
  const replies=await Promise.all(Array.from({length:50},()=>db.query('select public.consume_rate_limit($1,7) allowed',[key])));
  assert.equal(replies.filter(r=>r.rows[0].allowed).length,6);
  assert.equal((await db.query('select hits from private.rate_limits where bucket=$1',[key])).rows[0].hits,51);
});
