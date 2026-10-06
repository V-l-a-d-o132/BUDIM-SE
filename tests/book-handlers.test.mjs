import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks, createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import Stripe from 'stripe';

const require=createRequire(import.meta.url);
registerHooks({ resolve(specifier,context,next) {
  if(specifier.startsWith('npm:')) return next(require.resolve(specifier.slice(4).replace(/@\d[^/]*$/,'')),context);
  return next(specifier,context);
}});
const handlers={}; let capture; let requests=[]; let authorized=false; let eventFailure=false; let downloadAllowed=false; let modeMismatch=false; let orderUnavailable=false;
const token='a'.repeat(64); const tokenHash=createHash('sha256').update(token).digest('hex');
const id='41000000-0000-4000-8000-000000000001';
const requestId='51000000-0000-4000-8000-000000000001';
const secret='whsec_fixture';
const env={SUPABASE_URL:'https://fixture.supabase.test',SUPABASE_ANON_KEY:'test-public-key',SUPABASE_SERVICE_ROLE_KEY:'test-server-key',STRIPE_SECRET_KEY:'rk_test_fixture',STRIPE_BOOK_WEBHOOK_SECRET_TEST:secret};
globalThis.Deno={env:{get:key=>env[key]},serve:handler=>{handlers[capture]=handler;}};
const originalFetch=globalThis.fetch;
const signer=new Stripe('signature-fixture');
let savedOrder={id,format:'physical',quantity:1,unit_amount:1499,expected_amount:1499,amount_paid:1499,amount_refunded:0,currency:'eur',livemode:false,payment_status:'paid',fulfillment_status:'ready',customer_email:'private@example.invalid',customer_phone:'+000000000',shipping_address:{line1:'Private fixture'},checkout_url:null,stripe_session_id:null,edition_id:'edition-private',created_at:'2026-10-06T00:00:00Z'};
before(async()=>{
  for(const name of ['create-book-checkout','book-store','get-book-order','book-payment-webhook','admin-book-orders']) { capture=name; await import(`../supabase/functions/${name}/index.ts`); }
  globalThis.fetch=async(input,init={})=>{
    const url=new URL(typeof input==='string'?input:input.url); const raw=typeof init.body==='string'?init.body:'';
    const body=raw.startsWith('{')?JSON.parse(raw):Object.fromEntries(new URLSearchParams(raw));
    requests.push({url:url.href,body,headers:new Headers(init.headers)});
    if(url.pathname.endsWith('/auth/v1/user')) return Response.json({id:'10000000-0000-4000-8000-000000000001',role:'authenticated',aud:'authenticated'});
    if(url.pathname.endsWith('/rpc/admin_authorize')) return Response.json(authorized);
    if(url.pathname.endsWith('/rpc/consume_rate_limit')) return Response.json(true);
    if(url.pathname.endsWith('/rpc/begin_book_order')) return Response.json({...savedOrder,format:body.book_format,quantity:body.book_quantity,unit_amount:body.book_format==='digital'?399:1499,expected_amount:(body.book_format==='digital'?399:1499)*body.book_quantity});
    if(url.pathname.endsWith('/rpc/bind_book_checkout')) return Response.json(null);
    if(url.pathname.endsWith('/rpc/book_order_for_owner')) return Response.json(body.token_hash===tokenHash && !orderUnavailable?savedOrder:null);
    if(url.pathname.endsWith('/rpc/book_download_for_owner')) return Response.json(downloadAllowed?{object_path:'editions/fixture/'+'a'.repeat(64)+'.pdf'}:null);
    if(url.pathname.endsWith('/rpc/record_book_download')) return Response.json(null);
    if(url.pathname.endsWith('/rpc/book_edition_configuration')) return Response.json({digital_available:false,edition:null});
    if(url.pathname.endsWith('/rpc/book_payment_configuration')) return Response.json({});
    if(url.pathname.endsWith('/rpc/configure_book_payment_secret')) return Response.json('configured');
    if(url.pathname.endsWith('/rpc/apply_book_payment_event')) return eventFailure?Response.json({message:'fixture storage failure'},{status:503}):Response.json({order_id:id,payment_status:'paid'});
    if(url.pathname.endsWith('/book_orders')) return Response.json([{...savedOrder,stripe_session_id:'cs_test_fixture',stripe_payment_intent_id:'pi_fixture'}]);
    if(url.hostname==='api.stripe.com' && url.pathname==='/v1/checkout/sessions' && init.method==='GET') return Response.json({object:'list',has_more:false,data:[{id:'cs_test_fixture',created:1,status:'complete',payment_status:'paid',livemode:false,currency:'eur',amount_total:1499,metadata:{store:'budimse_books_v1',order_id:id,format:'physical'},payment_intent:{id:'pi_fixture',livemode:false,currency:'eur',amount_received:1499,status:'succeeded',latest_charge:{livemode:false,currency:'eur',amount_refunded:0,balance_transaction:{id:'txn_fixture',currency:'eur',amount:1499,fee:72,net:1427,status:'pending'}}}}]});
    if(url.hostname==='api.stripe.com' && url.pathname==='/v1/checkout/sessions') return Response.json({id:'cs_test_fixture',object:'checkout.session',url:'https://checkout.stripe.com/c/pay/cs_test_fixture',livemode:modeMismatch,metadata:{order_id:id},status:'open'});
    if(url.hostname==='api.stripe.com' && url.pathname==='/v1/webhook_endpoints') return Response.json({id:'we_fixture',object:'webhook_endpoint',secret:'whsec_setup_fixture',livemode:false});
    if(url.pathname.includes('/storage/v1/object/sign/')) return Response.json({signedURL:'/object/sign/book-downloads/editions/fixture.pdf?token=fixture'});
    if(url.pathname.includes('/storage/v1/object/book-downloads/')) return new Response('not a PDF',{headers:{'content-type':'application/pdf'}});
    throw new Error('Unexpected fixture request: '+url.hostname+url.pathname);
  };
});
beforeEach(()=>{requests=[];authorized=false;eventFailure=false;downloadAllowed=false;modeMismatch=false;orderUnavailable=false;env.STRIPE_BOOK_WEBHOOK_SECRET_TEST=secret;});
after(()=>{globalThis.fetch=originalFetch;delete globalThis.Deno;});
const call=(name,body,headers={})=>handlers[name](new Request('https://fixture.supabase.test/functions/v1/'+name,{method:'POST',headers:{'Content-Type':'application/json',...headers},body:JSON.stringify(body)}));
const input={request_id:requestId,order_token:token,quantity:1,format:'physical',currency:'eur'};
const signed=(changes={},type='checkout.session.completed',time=Math.floor(Date.now()/1000))=>{
  const payload=JSON.stringify({id:'evt_fixture',type,created:time,livemode:false,data:{object:{id:'cs_test_fixture',metadata:{store:'budimse_books_v1',order_id:id,format:'physical'},currency:'eur',amount_total:1499,status:'complete',payment_status:'paid',payment_intent:'pi_fixture',...changes}}});
  return handlers['book-payment-webhook'](new Request('https://fixture.supabase.test/functions/v1/book-payment-webhook?mode=test',{method:'POST',headers:{'Stripe-Signature':signer.webhooks.generateTestHeaderString({payload,secret,timestamp:time})},body:payload}));
};

test('checkout rejects other currencies, unknown formats and malformed quantities before creating orders',async()=>{
  for(const body of [{...input,currency:'bgn'},{...input,format:'free'},{...input,quantity:'1'},{...input,quantity:0},{...input,quantity:101},{...input,order_token:'forged'}]) assert.equal((await call('create-book-checkout',body)).status,400);
  assert.equal(requests.some(r=>r.url.includes('/begin_book_order')||r.url.includes('api.stripe.com')),false);
});
test('checkout ignores supplied prices and redirect origins and fixes physical totals in EUR',async()=>{
  const response=await call('create-book-checkout',{...input,price:1,origin:'https://evil.invalid'}, {Origin:'https://budimse.online'});
  assert.equal(response.status,200); const stripe=requests.find(r=>r.url.includes('api.stripe.com'));
  assert.equal(stripe.body['line_items[0][price_data][currency]'],'eur'); assert.equal(stripe.body['line_items[0][price_data][unit_amount]'],'1499');
  assert.match(stripe.body.success_url,/^https:\/\/budimse.online\/order\?/); assert.equal('payment_method_types[0]' in stripe.body,false);
  assert.equal(stripe.body['adaptive_pricing[enabled]'],'false'); assert.equal(stripe.headers.get('Idempotency-Key'),`budimse-book:test:${id}`);
  assert.equal(requests.find(r=>r.url.includes('/begin_book_order')).headers.get('apikey'),'test-server-key');
});
test('a digital purchase uses 399 cents, one copy, explicit delivery consent and no shipping fields',async()=>{
  assert.equal((await call('create-book-checkout',{...input,format:'digital'})).status,400);
  assert.equal((await call('create-book-checkout',{...input,format:'digital',quantity:2,immediate_delivery:true})).status,400);
  const response=await call('create-book-checkout',{...input,format:'digital',immediate_delivery:true}); assert.equal(response.status,200);
  const stripe=requests.find(r=>r.url.includes('api.stripe.com')); assert.equal(stripe.body['line_items[0][price_data][unit_amount]'],'399');
  assert.equal(Object.keys(stripe.body).some(k=>k.startsWith('shipping_address_collection')||k.startsWith('phone_number_collection')),false);
});
test('configured test checkout refuses a provider response from live mode',async()=>{
  modeMismatch=true; assert.equal((await call('create-book-checkout',input)).status,503); assert.equal(requests.some(r=>r.url.includes('/bind_book_checkout')),false);
});
test('the webhook verifies a genuine HMAC over the raw body and forwards only selected fields',async()=>{
  const response=await signed({customer_details:{email:'fixture@example.invalid',tax_ids:[{secret:'unused'}]},unneeded:{large:'fixture'}}); assert.equal(response.status,200);
  const write=requests.find(r=>r.url.includes('/apply_book_payment_event')); assert.equal(write.body.event_data.customer_email,'fixture@example.invalid');
  assert.equal('unneeded' in write.body.event_data,false); assert.equal('tax_ids' in write.body.event_data,false); assert.equal(write.body.is_live,false);
});
test('missing and forged webhook signatures never process an event',async()=>{
  const a=await handlers['book-payment-webhook'](new Request('https://fixture.supabase.test/functions/v1/book-payment-webhook?mode=test',{method:'POST',body:'{}'})); assert.equal(a.status,400);
  const b=await handlers['book-payment-webhook'](new Request('https://fixture.supabase.test/functions/v1/book-payment-webhook?mode=test',{method:'POST',headers:{'Stripe-Signature':'forged'},body:'{}'})); assert.equal(b.status,400);
  assert.equal(requests.some(r=>r.url.includes('/apply_book_payment_event')),false);
});
test('old signed requests, wrong modes and unrelated Checkout metadata are rejected or ignored',async()=>{
  assert.equal((await signed({},undefined,Math.floor(Date.now()/1000)-600)).status,400);
  const payload=JSON.stringify({id:'evt_live_fixture',type:'checkout.session.completed',livemode:true,data:{object:{}}});
  const response=await handlers['book-payment-webhook'](new Request('https://fixture.supabase.test/functions/v1/book-payment-webhook?mode=test',{method:'POST',headers:{'Stripe-Signature':signer.webhooks.generateTestHeaderString({payload,secret})},body:payload})); assert.equal(response.status,400);
  assert.equal((await signed({metadata:{store:'another-site'}})).status,200); assert.equal(requests.some(r=>r.url.includes('/apply_book_payment_event')),false);
});
test('webhook storage failure returns a retryable response instead of acknowledging fulfillment',async()=>{
  eventFailure=true; assert.equal((await signed()).status,503);
});
test('status lookup requires the private token and never returns customer or file data',async()=>{
  assert.equal((await call('get-book-order',{order_id:id,order_token:'b'.repeat(64)})).status,404);
  const response=await call('get-book-order',{order_id:id,order_token:token}); assert.equal(response.status,200); const data=await response.json();
  for(const key of ['customer_email','customer_phone','shipping_address','edition_id','checkout_url']) assert.equal(key in data.order,false);
  assert.equal(data.order.currency,'eur'); assert.equal(data.order.amount_total,1499);
});
test('an order without ebook entitlement never reaches URL signing',async()=>{
  assert.equal((await call('get-book-order',{order_id:id,order_token:token,action:'download'})).status,409);
  assert.equal(requests.some(r=>r.url.includes('/storage/')),false);
});
test('verified ebook entitlement generates a 60-second private download and records issuance',async()=>{
  downloadAllowed=true; const response=await call('get-book-order',{order_id:id,order_token:token,action:'download'}); assert.equal(response.status,200);
  const request=requests.find(r=>r.url.includes('/storage/')); assert.equal(request.body.expiresIn,60); assert.equal(request.headers.get('apikey'),'test-server-key');
  assert.equal((await response.json()).expires_in,60); assert.ok(requests.find(r=>r.url.includes('/record_book_download')));
});
test('administrator operations reject missing authentication and missing current MFA permission',async()=>{
  assert.equal((await call('admin-book-orders',{action:'setup_webhook'})).status,401);
  assert.equal((await call('admin-book-orders',{action:'setup_webhook'}, {Authorization:'Bearer fixture'})).status,403);
  assert.equal(requests.some(r=>r.url.includes('api.stripe.com')||r.url.includes('/configure_book_payment_secret')),false);
});
test('authorized webhook setup encrypts the secret without returning it to the browser',async()=>{
  authorized=true; const response=await call('admin-book-orders',{action:'setup_webhook',livemode:false},{Authorization:'Bearer fixture'}); assert.equal(response.status,200);
  const data=await response.json(); assert.equal(data.configured,true); assert.equal('secret' in data,false);
  const stored=requests.find(r=>r.url.includes('/configure_book_payment_secret')); assert.equal(stored.body.new_value,'whsec_setup_fixture');
  const provider=requests.find(r=>r.url.includes('/webhook_endpoints')); assert.match(provider.body.url,/book-payment-webhook\?mode=test$/);
});
test('MFA-authorized reconciliation compares provider facts without returning secrets or customer fields',async()=>{
  authorized=true;const response=await call('admin-book-orders',{action:'reconcile',livemode:false},{Authorization:'Bearer fixture'});assert.equal(response.status,200);
  const result=await response.json();assert.equal(result.mismatches,0);assert.equal(result.by_currency.eur.net_minor,1499);assert.equal(result.rows[0].charge_transaction.fee_minor,72);
  assert.equal(result.scope,'stripe_sessions_page');assert.equal(result.has_more,false);
  for(const field of ['customer_email','customer_phone','shipping_address','order_token','client_secret']) assert.equal(field in result.rows[0],false);
  const provider=requests.find(r=>r.url.includes('api.stripe.com'));assert.ok(new URL(provider.url).searchParams.getAll('expand[0]').includes('data.payment_intent.latest_charge.balance_transaction'));
  assert.equal(requests.some(r=>r.url.includes('/apply_book_payment_event')),false);
});
test('ebook activation rejects traversal and false PDF content',async()=>{
  authorized=true;
  assert.equal((await call('admin-book-orders',{action:'activate_ebook',object_path:'../private',sha256:'a'.repeat(64),label:'Fixture'},{Authorization:'Bearer fixture'})).status,400);
  const response=await call('admin-book-orders',{action:'activate_ebook',object_path:`editions/${id}/${'a'.repeat(64)}.pdf`,sha256:'a'.repeat(64),label:'Fixture'},{Authorization:'Bearer fixture'}); assert.equal(response.status,400);
  assert.equal(requests.some(r=>r.url.includes('/activate_book_edition')),false);
});
test('every public book operation rejects a foreign browser Origin and an unsupported method',async()=>{
  for(const name of ['create-book-checkout','get-book-order','admin-book-orders']) {
    assert.equal((await call(name,input,{Origin:'https://foreign.invalid'})).status,403);
    assert.equal((await handlers[name](new Request('https://fixture.supabase.test/functions/v1/'+name))).status,405);
  }
});
