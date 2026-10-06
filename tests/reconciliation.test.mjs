import { test } from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks, createRequire } from 'node:module';
const require=createRequire(import.meta.url);
registerHooks({resolve(specifier,context,next){if(specifier.startsWith('npm:'))return next(require.resolve(specifier.slice(4).replace(/@\d[^/]*$/,'')),context);return next(specifier,context);}});
globalThis.Deno={env:{get:()=>undefined}};
const {reconcileBookSessions}=await import('../supabase/functions/_shared/book-reconciliation.ts');
const id='41000000-0000-4000-8000-000000000001';
const order={id,format:'physical',livemode:false,stripe_session_id:'cs_test_fixture',stripe_payment_intent_id:'pi_fixture',currency:'eur',expected_amount:1499,amount_paid:1499,amount_refunded:500,payment_status:'partially_refunded'};
const session={id:'cs_test_fixture',created:1,livemode:false,status:'complete',payment_status:'paid',currency:'eur',amount_total:1499,metadata:{store:'budimse_books_v1',order_id:id,format:'physical'},payment_intent:{id:'pi_fixture',livemode:false,currency:'eur',amount_received:1499,status:'succeeded',latest_charge:{livemode:false,currency:'eur',amount_refunded:500,balance_transaction:{id:'txn_fixture',currency:'usd',amount:1600,fee:80,net:1520,status:'pending'}}}};
test('refunds are counted once and settlement currency is kept separate from EUR sales',()=>{
  const r=reconcileBookSessions([session],[order],false);
  assert.deepEqual(r.by_currency.eur,{paid_orders:1,gross_minor:1499,refunded_minor:500,net_minor:999}); assert.equal(r.mismatches,0);
  assert.equal(r.rows[0].charge_transaction.currency,'usd'); assert.equal(r.rows[0].charge_transaction.fee_minor,80);
});
test('missing orders and stale paid or refunded amounts are exposed, never repaired',()=>{
  const stale={...order,amount_paid:0,amount_refunded:0,payment_status:'failed'};
  const r=reconcileBookSessions([session],[stale],false);
  assert.ok(r.rows[0].issues.includes('amount_paid')); assert.ok(r.rows[0].issues.includes('amount_refunded')); assert.ok(r.rows[0].issues.includes('payment_status')); assert.equal(stale.amount_paid,0);
  assert.deepEqual(reconcileBookSessions([session],[],false).rows[0].issues,['missing_order']);
});
test('new-store totals exclude unrelated and legacy Checkout sessions',()=>{
  const r=reconcileBookSessions([session,{...session,id:'cs_other',metadata:{}}],[order],false);
  assert.equal(r.outside_store,1); assert.equal(r.rows.length,1); assert.equal(r.by_currency.eur.gross_minor,1499);
});
test('wrong account mode and unexpanded or inconsistent provider data fail without a false match',()=>{
  for(const changed of [{...session,livemode:true},{...session,payment_intent:'pi_fixture'},{...session,payment_intent:{...session.payment_intent,latest_charge:'ch_fixture'}},{...session,amount_total:NaN},{...session,payment_intent:{...session.payment_intent,currency:'bgn'}}]) assert.throws(()=>reconcileBookSessions([changed],[order],false));
});
test('pending and expired sessions are compared without counting promised money as received',()=>{
  const pending={...session,payment_status:'unpaid',payment_intent:{...session.payment_intent,amount_received:0,status:'processing',latest_charge:null}};
  const r=reconcileBookSessions([pending],[{...order,amount_paid:0,amount_refunded:0,payment_status:'created'}],false);
  assert.equal(r.by_currency.eur.gross_minor,0); assert.ok(r.rows[0].issues.includes('payment_status'));
  const expired={...session,status:'expired',payment_status:'unpaid',payment_intent:null};
  assert.equal(reconcileBookSessions([expired],[{...order,amount_paid:0,amount_refunded:0,payment_status:'expired'}],false).mismatches,0);
});
