import {before,after,beforeEach,afterEach,test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,rm} from 'node:fs/promises';
import {fileURLToPath,pathToFileURL} from 'node:url';
import path from 'node:path';
import {build} from 'esbuild';
import {JSDOM} from 'jsdom';
import {createElement,act} from 'react';
const project=fileURLToPath(new URL('../',import.meta.url));
let dom,root,container,components,createRoot,Router,temp,state,requests=[],deferJoin;
const token='d'.repeat(64),member='10000000-0000-4000-8000-000000000099';
const originalFetch=globalThis.fetch;
const blank=()=>({access:null,participants:[],posts:[],comments:[],follows:[],messages:[],notifications:[]});
function approved(){
  const fixture=blank();fixture.access={member_id:member,alias:'Student',status:'approved',simulators:true,analyzer:false,
    room:{id:'20000000-0000-4000-8000-000000000099',name:'Fixture class',status:'open',expires_at:new Date(Date.now()+3600000).toISOString(),simulators_enabled:true,analyzer_enabled:false,sort_mode:'chronological',moderate_posts:false,moderate_comments:false}};
  fixture.participants=[{id:member,alias:'Student'},{id:'30000000-0000-4000-8000-000000000099',alias:'Peer'}];
  for(const [index,app]of ['instagram','tiktok','facebook','youtube','x','snapchat'].entries())fixture.posts.push({id:'fixture-'+index,member_id:member,alias:'Student',app_id:app,kind:app==='tiktok'||app==='youtube'?'clip':'post',content:'Publication '+app,created_at:new Date().toISOString(),approved:true,media:null,likes:0,shares:0,views:0,comments:0,reaction:null,saved:false,shared:false});
  return fixture;
}
const normalized=node=>node.textContent.replace(/\s+/g,' ').trim();
const button=text=>{const found=[...container.querySelectorAll('button')].find(node=>normalized(node)===text);assert.ok(found,'Button '+text);return found;};
const click=async node=>{assert.ok(node);await act(async()=>{node.click();});};
const setValue=async(node,value)=>{await act(async()=>{Object.getOwnPropertyDescriptor(node.tagName==='TEXTAREA'?dom.window.HTMLTextAreaElement.prototype:dom.window.HTMLInputElement.prototype,'value').set.call(node,value);node.dispatchEvent(new dom.window.Event('input',{bubbles:true}));});};
const selectApp=async id=>{const node=container.querySelector('[aria-label="Избери демо приложение"]');await act(async()=>{node.value=id;node.dispatchEvent(new dom.window.Event('change',{bubbles:true}));});};
before(async()=>{
  globalThis.BroadcastChannel=undefined;
  dom=new JSDOM('<!doctype html><html><head></head><body></body></html>',{url:'https://fixture.test/analizator'});
  for(const key of ['window','document','HTMLElement','HTMLInputElement','HTMLTextAreaElement','Event','MouseEvent','Node','Storage'])globalThis[key]=dom.window[key];
  Object.defineProperty(globalThis,'navigator',{configurable:true,value:dom.window.navigator});
  globalThis.IS_REACT_ACT_ENVIRONMENT=true;
  globalThis.requestAnimationFrame=callback=>{queueMicrotask(()=>callback(0));return 0;};
  dom.window.HTMLElement.prototype.scrollIntoView=()=>{};
  globalThis.fetch=async(input,init={})=>{
    const url=typeof input==='string'?input:input.url;
    assert.match(url,/\/functions\/v1\/classroom$/);
    const body=JSON.parse(init.body);requests.push(body);
    if(body.action==='join'&&deferJoin)await deferJoin;
    if(body.action==='state'&&state.revision&&body.revision===state.revision&&state.access?.status==='approved')return Response.json({success:true,state:{access:state.access,revision:state.revision,unchanged:true}});
    if(body.action==='react'){const post=state.posts.find(post=>post.id===body.post_id);post.reaction=body.reaction;post.likes=body.reaction?1:0;}
    if(body.action==='publish')state.posts.unshift({id:'published',member_id:member,alias:'Student',app_id:body.app_id,kind:body.kind,content:body.content,approved:true,created_at:new Date().toISOString(),media:null,likes:0,comments:0,shares:0,views:0,reaction:null,saved:false,shared:false});
    if(body.action==='comment'){state.comments.push({id:'comment',post_id:body.post_id,member_id:member,alias:'Student',content:body.content,approved:true,created_at:new Date().toISOString()});state.posts.find(post=>post.id===body.post_id).comments++;}
    if(body.action==='message')state.messages.push({...body,id:'message',member_id:member,alias:'Student',created_at:new Date().toISOString()});
    return Response.json({success:true,state});
  };
  ({createRoot}=await import('react-dom/client'));({MemoryRouter:Router}=await import('react-router-dom'));
  await mkdir(path.join(project,'node_modules/.tmp'),{recursive:true});temp=await mkdtemp(path.join(project,'node_modules/.tmp/classroom-ui-'));
  const output=await build({stdin:{contents:"export {default as Focus} from './src/pages/tavora-shield/components/GrayscaleGuide';export {default as Page} from './src/pages/tavora-shield/page';export {ClassroomProvider as Provider,useClassroom} from './src/pages/tavora-shield/components/classroom/ClassroomContext';export {clearLabToken,labRequest} from './src/lib/classroom';",resolveDir:project,loader:'tsx'},bundle:true,write:false,platform:'node',format:'esm',packages:'external',jsx:'automatic',alias:{'@':path.join(project,'src')},loader:{'.css':'empty'},define:{'import.meta.env':JSON.stringify({VITE_PUBLIC_SUPABASE_URL:'https://fixture.supabase.test',VITE_PUBLIC_SUPABASE_ANON_KEY:'fixture-public-key'})}});
  const file=path.join(temp,'fixture.mjs');await writeFile(file,output.outputFiles[0].text);components=await import(pathToFileURL(file).href);
});
beforeEach(()=>{state=approved();requests=[];deferJoin=null;components.clearLabToken();window.sessionStorage.clear();window.sessionStorage.setItem('budimse_classroom_capability_v1',token);container=document.createElement('div');document.body.appendChild(container);root=createRoot(container);});
afterEach(async()=>{await act(async()=>root.unmount());container.remove();components.clearLabToken();});
after(async()=>{globalThis.fetch=originalFetch;dom.window.close();await rm(temp,{recursive:true,force:true});});
async function mountFocus(){await act(async()=>root.render(createElement(components.Provider,null,createElement(components.Focus))));}
test('unchanged synchronization retains content while a revoked grant returns an empty snapshot',async()=>{
  state.revision='7';const previous=structuredClone(state);
  const same=await components.labRequest('state',{revision:'7'},token,previous);assert.equal(same.posts.length,6);
  state={...blank(),access:{...previous.access,status:'revoked'},revision:'8'};
  const revoked=await components.labRequest('state',{revision:'7'},token,previous);assert.equal(revoked.access.status,'revoked');assert.deepEqual(revoked.posts,[]);
});
test('idle polling renews expiring media and removes stories whose lifetime has elapsed',async()=>{
  const now=Date.now(),originalNow=Date.now;let connection;
  state.revision='7';state.posts[0].media={id:'fixture-media',mime_type:'image/png',url:'https://fixture.test/old.png',url_expires_at:now+20000};
  state.posts[1].kind='story';state.posts[1].created_at=new Date(now-86400000+60000).toISOString();
  function Harness(){connection=components.useClassroom();return createElement('div');}
  try{
    await act(async()=>root.render(createElement(components.Provider,null,createElement(Harness))));
    state.posts[0].media={...state.posts[0].media,url:'https://fixture.test/renewed.png',url_expires_at:now+300000};
    await act(async()=>connection.refresh());
    assert.equal(requests.at(-1).revision,undefined);assert.match(connection.state.posts[0].media.url,/renewed/);
    await act(async()=>connection.refresh());assert.equal(requests.at(-1).revision,'7');
    Date.now=()=>now+61000;state.posts=state.posts.filter(post=>post.kind!=='story');
    await act(async()=>connection.refresh());
    assert.equal(requests.at(-1).revision,undefined);assert.equal(connection.state.posts.some(post=>post.kind==='story'),false);
  }finally{Date.now=originalNow;}
});
test('background polling cannot overtake an in-flight classroom join',async()=>{
  components.clearLabToken();window.sessionStorage.clear();
  const originalInterval=window.setInterval;let poll,release,connection,joining;
  window.setInterval=callback=>{poll=callback;return 999;};
  deferJoin=new Promise(resolve=>{release=resolve;});
  function Harness(){connection=components.useClassroom();return createElement('div',null,connection.state.access?.status??'');}
  try{
    await act(async()=>root.render(createElement(components.Provider,null,createElement(Harness))));
    await act(async()=>{joining=connection.join('CODE1234','Pending');await Promise.resolve();});
    await act(async()=>{poll();await Promise.resolve();});
    assert.equal(requests.filter(request=>request.action==='state').length,0);
    state.access.status='pending';await act(async()=>{release();await joining;});
    assert.match(container.textContent,/pending/);
  }finally{release();await joining?.catch(()=>{});window.setInterval=originalInterval;deferJoin=null;}
});
test('the public page locks both tools and never invokes analysis without permission',async()=>{
  window.sessionStorage.clear();await act(async()=>root.render(createElement(Router,null,createElement(components.Page))));
  assert.match(container.textContent,/Симулаторите се включват от водещия/);
  await click(container.querySelector('[aria-controls="module-analyzer"]'));
  assert.match(container.textContent,/Анализът се включва от водещия/);
  assert.equal(container.querySelector('[data-testid="content-analyzer"]'),null);assert.equal(requests.length,0);
});
test('all twelve connected applications render in iPhone and Samsung layouts',async()=>{
  await mountFocus();
  for(const platform of ['iOS','Android']){
    await click(button(platform));
    for(const id of ['instagram','tiktok','facebook','youtube','x','snapchat','whatsapp','gmail','chrome','photos','camera','settings']){
      await selectApp(id);assert.ok(container.querySelector('[data-testid="app-'+id+'"]'),platform+'/'+id);
    }
  }
  assert.ok(requests.every(request=>request.action==='state'));
});
test('a stored reaction survives switching phone platform and reopening an application',async()=>{
  await mountFocus();await selectApp('instagram');await click(container.querySelector('[aria-label="Харесай публикацията"]'));
  assert.equal(state.posts.find(post=>post.app_id==='instagram').likes,1);
  await click(button('Android'));assert.ok(container.querySelector('[aria-label="Премахни реакцията"][aria-pressed="true"]'));
  await click(button('Начален екран'));await selectApp('instagram');
  assert.ok(container.querySelector('[aria-label="Премахни реакцията"][aria-pressed="true"]'));
  const write=requests.find(request=>request.action==='react');assert.equal(write.access_token,token);assert.equal(write.reaction,'like');
});
test('publishing and commenting use the backend result and keep zero fabricated reactions',async()=>{
  await mountFocus();await selectApp('facebook');await click(container.querySelector('[aria-label="Нова публикация"]'));
  await setValue(container.querySelector('[aria-label="Текст на публикацията"]'),'Useful classroom cause');await click(button('Публикувай'));
  assert.match(container.textContent,/Useful classroom cause/);assert.equal(state.posts[0].likes,0);
  assert.match(requests.find(request=>request.action==='publish').request_id,/^[a-f0-9-]{36}$/);
  await click(container.querySelector('[aria-label="Отвори коментарите"]'));await setValue(container.querySelector('#lab-comment'),'A considered response');await click(button('Изпрати'));
  assert.match(container.textContent,/A considered response/);assert.equal(state.posts[0].comments,1);
});
test('classroom conversations send only to the selected in-room recipient',async()=>{
  await mountFocus();await selectApp('whatsapp');await click([...container.querySelectorAll('.lab-contact')].find(node=>node.textContent.includes('Peer')));
  await setValue(container.querySelector('[aria-label="Учебно съобщение"]'),'Classroom discussion');await click(container.querySelector('[aria-label="Изпрати съобщението"]'));
  assert.match(container.textContent,/Classroom discussion/);
  const write=requests.find(request=>request.action==='message');assert.equal(write.recipient_id,state.participants[1].id);assert.equal(write.app_id,'whatsapp');
});
