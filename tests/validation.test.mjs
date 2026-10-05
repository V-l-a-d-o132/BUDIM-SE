import { test } from 'node:test';
import assert from 'node:assert/strict';
import { requireAdmin } from '../supabase/functions/_shared/admin-auth.ts';
import { validAssessmentAnswers } from '../supabase/functions/_shared/assessment-validation.ts';
import { validAdminRole, requiredAdminPermission } from '../src/lib/admin-permissions.ts';
import sanitizeHtml from 'sanitize-html';

test('invalid and anonymous authentication is rejected before authorization is queried', async () => {
  const client={auth:{getUser:async()=>({data:{user:null},error:new Error('bad token')})},rpc:()=>{throw new Error('must not run');}};
  assert.equal((await requireAdmin(client,'orders')).status,401);
});
test('an authenticated user without current database permission is rejected', async () => {
  const client={auth:{getUser:async()=>({data:{user:{id:'test'}}})},rpc:async()=>({data:false})};
  assert.equal((await requireAdmin(client,'orders')).status,403);
});
test('authorization failures fail closed rather than granting access', async () => {
  const client={auth:{getUser:async()=>({data:{user:{id:'test'}}})},rpc:async()=>({data:true,error:new Error('database unavailable')})};
  assert.equal((await requireAdmin(client,'news')).status,403);
});
test('the server checks the permission for the specific requested operation', async () => {
  let input;
  const client={auth:{getUser:async()=>({data:{user:{id:'test'}}})},rpc:async(name,args)=>{input={name,args};return {data:true};}};
  assert.equal(await requireAdmin(client,'orders'),null);
  assert.deepEqual(input,{name:'admin_authorize',args:{required_permission:'orders'}});
});
test('unknown roles and sensitive routes have explicit permissions', () => {
  assert.equal(validAdminRole('admin'),false); assert.equal(validAdminRole('moderator'),true);
  assert.equal(requiredAdminPermission('/admin/orders'),'orders');
  assert.equal(requiredAdminPermission('/admin/inquiries'),'inquiries');
  assert.equal(requiredAdminPermission('/admin/comments'),'moderate');
});
const validAnswers=()=>Object.fromEntries(Array.from({length:35},(_,i)=>[`${Math.floor(i/7)}-${i%7}`,0]));
test('a complete questionnaire with values from its actual scales is accepted', () => {
  const a=validAnswers(); a['0-0']=6; a['3-2']=6; a['4-0']=8; a['4-1']=7; a['4-2']=6;
  assert.equal(validAssessmentAnswers(a),true);
});
test('missing, extra, unknown, string, negative and out-of-scale answers are rejected', () => {
  for (const bad of [null,[],{}, {...validAnswers(),extra:0},{...validAnswers(),'0-0':'6'},{...validAnswers(),'0-0':3},{...validAnswers(),'4-1':8},{...validAnswers(),'3-0':6},{...validAnswers(),'4-2':-1}]) assert.equal(validAssessmentAnswers(bad),false);
  const missing=validAnswers(); delete missing['0-0']; assert.equal(validAssessmentAnswers(missing),false);
  const substituted=validAnswers();delete substituted['0-0'];substituted['wrong']=0;assert.equal(validAssessmentAnswers(substituted),false);
});
test('HTML sanitizer removes script, event handlers and javascript links while preserving supported formatting', () => {
  const clean=sanitizeHtml('<b>Safe</b><script>alert(1)</script><img src=x onerror=alert(1)><a href="javascript:alert(1)" onclick="alert(1)">Link</a>',{allowedTags:['a','b','strong','i','em','u','br','span'],allowedAttributes:{a:['href','title']},allowedSchemes:['http','https','mailto'],allowProtocolRelative:false});
  assert.equal(clean,'<b>Safe</b><a>Link</a>');
});
