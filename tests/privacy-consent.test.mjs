import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../public/privacy-consent.js',import.meta.url),'utf8');
function browser({stored=null,pathname='/',search='',disabled=false}={}) {
  const scripts=[],events=new Map(),cookies=[];
  const storage=new Map(stored?[['budimse_privacy_v2',JSON.stringify(stored)]]:[]);
  storage.set('cookie_consent','accepted');
  let reloads=0;
  const location={pathname,search,hash:'',hostname:'budimse.online',reload(){reloads++;}};
  const window={location,localStorage:{getItem:key=>{if(disabled)throw Error('disabled');return storage.get(key)??null;},setItem:(k,v)=>{if(disabled)throw Error('disabled');storage.set(k,v);},removeItem:k=>{if(disabled)throw Error('disabled');storage.delete(k);}},addEventListener:(name,fn)=>events.set(name,fn),dispatchEvent(){}};
  const document={head:{appendChild:node=>scripts.push(node)},createElement:()=>({})};
  Object.defineProperty(document,'cookie',{get:()=> '_fbp=old; _ga_ABC=old; necessary=keep',set:value=>cookies.push(value)});
  vm.runInNewContext(source,{window,document,CustomEvent:class{constructor(type){this.type=type;}}});
  return {window,scripts,storage,cookies,events,get reloads(){return reloads;}};
}
const accepted=()=>({version:2,marketing:true,updated_at:Date.now()});
test('a first visit and the obsolete accepted choice load no optional tracker',()=>{
  const b=browser(); assert.equal(b.scripts.length,0); assert.equal(b.window.BudimPrivacy.get(),null);
  assert.equal(b.storage.has('cookie_consent'),false);
  assert.ok(b.cookies.some(value=>value.startsWith('_fbp='))); assert.ok(b.cookies.every(value=>!value.startsWith('necessary=')));
});
test('refusal does not load a script and survives a fresh page',()=>{
  const b=browser(); b.window.BudimPrivacy.save(false); assert.equal(b.scripts.length,0);
  const stored=JSON.parse(b.storage.get('budimse_privacy_v2'));
  assert.equal(stored.marketing,false); assert.equal(browser({stored}).scripts.length,0);
});
test('explicit marketing permission loads one pixel once, without GTM or matching fields',()=>{
  const b=browser(); b.window.BudimPrivacy.save(true); b.window.BudimPrivacy.save(true); b.window.BudimPrivacy.route();
  assert.equal(b.scripts.length,1); assert.equal(b.scripts[0].src,'https://connect.facebook.net/en_US/fbevents.js');
  const commands=b.window.fbq.queue.map(args=>Array.from(args));
  assert.equal(commands.filter(args=>args[0]==='init').length,1); assert.equal(commands.find(args=>args[0]==='init').length,2);
  assert.ok(commands.some(args=>args[0]==='set'&&args[1]==='autoConfig'&&args[2]===false));
});
test('private purchase, admin, forms and query URLs never load the pixel, even with consent',()=>{
  for (const pathname of ['/order','/admin/orders','/analizator','/contact','/center','/digitalna-gramotnost','/tavora-shield']) assert.equal(browser({pathname,stored:accepted()}).scripts.length,0);
  assert.equal(browser({pathname:'/news',search:'?q=private',stored:accepted()}).scripts.length,0);
});
test('withdrawal revokes delivery, removes accessible optional cookies and reloads loaded code',()=>{
  const b=browser({stored:accepted()}); b.window.BudimPrivacy.save(false);
  assert.equal(b.reloads,1); assert.equal(JSON.parse(b.storage.get('budimse_privacy_v2')).marketing,false);
  assert.equal(Array.from(b.window.fbq.queue.at(-1))[1],'revoke'); assert.ok(b.cookies.length>0);
});
test('navigation from a public page into a private flow unloads the existing tracker',()=>{
  const b=browser({stored:accepted()}); b.window.location.pathname='/order'; b.window.BudimPrivacy.route();
  assert.equal(b.reloads,1); assert.equal(browser({stored:accepted(),pathname:'/order'}).scripts.length,0);
});
test('changed consent in another tab also stops an already loaded pixel',()=>{
  const b=browser({stored:accepted()}); b.storage.set('budimse_privacy_v2',JSON.stringify({...accepted(),marketing:false}));
  b.events.get('storage')({key:'budimse_privacy_v2'}); assert.equal(b.reloads,1);
});
test('expired, future, malformed and unsupported versions fail closed',()=>{
  for (const stored of [{...accepted(),version:1},{...accepted(),marketing:'true'},{...accepted(),updated_at:Date.now()+100000},{...accepted(),updated_at:Date.now()-181*86400000}]) assert.equal(browser({stored}).scripts.length,0);
  assert.equal(browser({disabled:true,stored:accepted()}).scripts.length,0);
});
test('the HTML has no unconditional tracking script, resource hint or noscript beacon',()=>{
  const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
  assert.doesNotMatch(html,/GTM-N93VGJF8|1744566393346119|fbq\(|facebook\.com\/tr|googletagmanager\.com\/ns|dns-prefetch[^>]*googletagmanager/);
  assert.match(html,/<script src="\/privacy-consent\.js"><\/script>/);
});
