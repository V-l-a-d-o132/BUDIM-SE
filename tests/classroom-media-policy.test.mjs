import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';

test('HTML and hosting policies permit own signed classroom videos and local previews',()=>{
  const document=new JSDOM(readFileSync(new URL('../index.html',import.meta.url),'utf8')).window.document;
  const html=document.querySelector('meta[http-equiv="Content-Security-Policy"]').content;
  const hosting=JSON.parse(readFileSync(new URL('../vercel.json',import.meta.url),'utf8')).headers;
  const policies=[html,...hosting.flatMap(rule=>rule.headers.filter(header=>header.key.toLowerCase()==='content-security-policy').map(header=>header.value))];
  assert.ok(policies.length>=2);
  for(const policy of policies){
    const sources=policy.split(';').map(part=>part.trim().split(/\s+/)).find(parts=>parts[0]==='media-src');
    assert.deepEqual(new Set(sources?.slice(1)),new Set(["'self'",'blob:','https://plcmsgbsetpqwjkfmjzk.supabase.co']));
  }
});
