import {before,after,beforeEach,afterEach,test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,rm} from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {build} from 'esbuild';
import {JSDOM} from 'jsdom';
import {createElement as h,act} from 'react';

let dom,root,container,Panel,createRoot,Router,temporary,requests,checkoutResponse,previousOrder;
const originalFetch=globalThis.fetch;
const orderId='41000000-0000-4000-8000-000000000071';
const oldAttempt={request_id:'51000000-0000-4000-8000-000000000071',order_token:'b'.repeat(64)};
const store={livemode:false,currency:'eur',prices:{physical:1499,digital:399},physical_available:true,digital_available:false,edition:null};
const button=text=>[...container.querySelectorAll('button')].find(node=>node.textContent===text);
const buy=()=>[...container.querySelectorAll('button')].find(node=>node.textContent.startsWith('Купи'));
const click=async node=>{assert.ok(node);await act(async()=>{node.click();});};
const flush=async()=>{await act(async()=>{});};
before(async()=>{
  dom=new JSDOM('<!doctype html><html><body></body></html>',{url:'https://budimse.online/order'});
  for(const key of ['window','document','HTMLElement','Event','Node','sessionStorage'])globalThis[key]=dom.window[key];
  Object.defineProperty(globalThis,'navigator',{configurable:true,value:dom.window.navigator});
  globalThis.IS_REACT_ACT_ENVIRONMENT=true;
  ({createRoot}=await import('react-dom/client'));({MemoryRouter:Router}=await import('react-router-dom'));
  globalThis.fetch=async(input,init={})=>{
    const url=new URL(typeof input==='string'?input:input.url);
    const body=init.body?JSON.parse(init.body):undefined;requests.push({name:url.pathname.split('/').at(-1),body});
    if(url.pathname.endsWith('/book-store'))return Response.json(store);
    if(url.pathname.endsWith('/create-book-checkout'))return checkoutResponse();
    if(url.pathname.endsWith('/get-book-order')){
      assert.equal(body.order_id,orderId);assert.equal(body.order_token,oldAttempt.order_token);
      return Response.json({order:previousOrder});
    }
    throw new Error('Unexpected fixture endpoint');
  };
  temporary=await mkdtemp(path.resolve('node_modules/.tmp/book-ui-'));
  const result=await build({stdin:{contents:"export {default} from './src/pages/order/BookPurchasePanel';",resolveDir:process.cwd(),loader:'tsx'},bundle:true,write:false,platform:'node',format:'esm',packages:'external',jsx:'automatic',alias:{'@':path.resolve('src')},define:{'import.meta.env':JSON.stringify({VITE_PUBLIC_SUPABASE_URL:'https://fixture.supabase.test',VITE_PUBLIC_SUPABASE_ANON_KEY:'fixture-public-key'})}});
  const file=path.join(temporary,'panel.mjs');await writeFile(file,result.outputFiles[0].text);({default:Panel}=await import(pathToFileURL(file).href));
});
beforeEach(()=>{
  sessionStorage.clear();window.history.replaceState(null,'','/order');requests=[];
  previousOrder={id:orderId,format:'physical',quantity:1,currency:'eur',amount_total:1499,amount_paid:1499,amount_refunded:0,payment_status:'paid',fulfillment_status:'ready',livemode:false,shipping_carrier:null,tracking_number:null,created_at:'2026-10-09T00:00:00Z',paid_at:'2026-10-09T00:00:00Z',downloadable:false};
  checkoutResponse=()=>Response.json({error:'Тази платежна сесия е приключила. Провери статуса на поръчката.',code:'checkout_closed',order_id:orderId},{status:409});
  container=document.createElement('div');document.body.appendChild(container);root=createRoot(container);
});
afterEach(async()=>{await act(async()=>root.unmount());container.remove();});
after(async()=>{globalThis.fetch=originalFetch;dom.window.close();await rm(temporary,{recursive:true,force:true});});
const mount=async()=>{await act(async()=>root.render(h(Router,null,h(Panel))));await flush();};
test('a completed saved checkout opens the owner status instead of stranding a returning buyer',async()=>{
  sessionStorage.setItem('book-attempt:physical:1',JSON.stringify(oldAttempt));await mount();await click(buy());await flush();
  assert.match(container.querySelector('[aria-label="Твоята поръчка"]').textContent,/Платена/);
  assert.ok(button('Нова покупка'));assert.equal(buy().disabled,true);
  assert.equal(window.location.search,'?order='+orderId);
  assert.equal(sessionStorage.getItem('book-order:'+orderId),oldAttempt.order_token);
  assert.equal(requests.filter(request=>request.name==='create-book-checkout').length,1);
});
test('expired orders allow an explicit fresh attempt while preserving other attempts and access links',async()=>{
  previousOrder.payment_status='expired';previousOrder.amount_paid=0;
  sessionStorage.setItem('book-attempt:physical:1',JSON.stringify(oldAttempt));sessionStorage.setItem('book-attempt:digital:1','other-attempt');
  await mount();await click(buy());await flush();await click(button('Нова покупка'));
  assert.equal(sessionStorage.getItem('book-attempt:physical:1'),null);
  assert.equal(sessionStorage.getItem('book-attempt:digital:1'),'other-attempt');
  assert.equal(sessionStorage.getItem('book-order:'+orderId),oldAttempt.order_token);
  checkoutResponse=()=>Response.json({error:'Fixture transient failure'},{status:503});
  await click(buy());const fresh=requests.filter(request=>request.name==='create-book-checkout').at(-1).body;
  assert.notEqual(fresh.request_id,oldAttempt.request_id);assert.notEqual(fresh.order_token,oldAttempt.order_token);
});
test('a closed checkout awaiting delayed confirmation never offers another payment',async()=>{
  previousOrder.payment_status='pending';previousOrder.amount_paid=0;
  sessionStorage.setItem('book-attempt:physical:1',JSON.stringify(oldAttempt));await mount();await click(buy());await flush();
  assert.match(container.textContent,/Плащането се обработва/);
  assert.equal(button('Нова покупка'),undefined);assert.equal(buy().disabled,true);
  assert.equal(requests.filter(request=>request.name==='create-book-checkout').length,1);
});
test('temporary server failure preserves the same attempt on retry',async()=>{
  checkoutResponse=()=>Response.json({error:'Fixture transient failure'},{status:503});
  await mount();await click(buy());await click(buy());
  const calls=requests.filter(request=>request.name==='create-book-checkout');assert.equal(calls.length,2);
  assert.equal(calls[0].body.request_id,calls[1].body.request_id);assert.equal(calls[0].body.order_token,calls[1].body.order_token);
  assert.equal(button('Нова покупка'),undefined);
});
test('the previously deployed closed-checkout response recovers through the pre-redirect capability',async()=>{
  sessionStorage.setItem('book-attempt:physical:1',JSON.stringify(oldAttempt));sessionStorage.setItem('book-order:'+orderId,oldAttempt.order_token);
  checkoutResponse=()=>Response.json({error:'Тази платежна сесия е приключила. Провери статуса на поръчката.'},{status:409});
  await mount();await click(buy());await flush();assert.ok(button('Нова покупка'));
  assert.match(container.querySelector('[aria-label="Твоята поръчка"]').textContent,/Платена/);
});
test('an unrelated checkout conflict cannot be mistaken for a paid or expired order',async()=>{
  checkoutResponse=()=>Response.json({error:'Електронното издание още не е достъпно за покупка.'},{status:409});
  await mount();await click(buy());assert.equal(button('Нова покупка'),undefined);
  assert.equal(requests.some(request=>request.name==='get-book-order'),false);
  assert.equal(container.querySelector('[aria-label="Твоята поръчка"]'),null);
});
