// Bounded checks against explicitly provisioned, disposable classroom fixtures.
// This script never creates rooms, approves participants or deletes user data.
import {readFile,writeFile} from 'node:fs/promises';
import {performance} from 'node:perf_hooks';
const args=process.argv.slice(2),option=(key,fallback)=>{const i=args.indexOf(key);return i<0?fallback:args[i+1];};
const manifestPath=option('--manifest'),phase=option('--phase','read');
if(!manifestPath)throw new Error('Provide --manifest for disposable fixtures.');
const manifest=JSON.parse(await readFile(manifestPath,'utf8'));
if(manifest.fixture!==true||!Array.isArray(manifest.participants)||manifest.participants.length>600)throw new Error('Expected at most 600 disposable fixture participants.');
if(!['join','read','steady','publish','react','comment','view','message','deny','analyzer-deny'].includes(phase))throw new Error('Unknown phase.');
const concurrency=Number(option('--concurrency','40'));
if(!Number.isInteger(concurrency)||concurrency<1||concurrency>80)throw new Error('Concurrency must be 1–80.');
const conditional=args.includes('--conditional')||phase==='steady',samples=[],started=performance.now();
const perGroup=Number(option('--per-group','30')),counts=new Map();
if(!Number.isInteger(perGroup)||perGroup<1||perGroup>30)throw new Error('Per-group sample must be 1–30.');
const participants=manifest.participants.filter(actor=>{const count=counts.get(actor.room_id)??0;counts.set(actor.room_id,count+1);return count<perGroup;});
let next=0,failures=0,completed=0,scheduled=0,skippedPollingTicks=0,maxQueued=0;
function payload(actor){
  const common={access_token:actor.token};
  if(phase==='join')return {...common,action:'join',code:actor.code,alias:actor.alias};
  if(phase==='read'||phase==='steady')return {...common,action:'state',...(conditional&&actor.revision?{revision:actor.revision}:{})};
  if(phase==='publish')return {...common,action:'publish',app_id:'facebook',kind:'post',content:actor.alias+' load fixture',request_id:actor.publishRequestId};
  if(['react','comment','view','deny'].includes(phase)){
    const post=phase==='deny'?manifest.participants.find(peer=>peer.room_id!==actor.room_id&&peer.post_id)?.post_id:args.includes('--shared-post')?manifest.participants.find(peer=>peer.room_id===actor.room_id&&peer.post_id)?.post_id:actor.post_id;
    return {...common,action:phase==='deny'?'react':phase,post_id:post,...(phase==='react'||phase==='deny'?{reaction:'love'}:{}),...(phase==='comment'?{content:'Disposable fixture comment',request_id:actor.commentRequestId}:{})};
  }
  if(phase==='message')return {...common,action:'message',app_id:'whatsapp',content:'Disposable class message',request_id:actor.messageRequestId};
  return {...common,text:'A disposable classroom excerpt.',recaptcha_token:''};
}
async function perform(actor,start=performance.now()){
    try{
      const response=await fetch(manifest.baseUrl+'/functions/v1/'+(phase==='analyzer-deny'?'tavora-content-analyzer':'classroom'),{
        method:'POST',headers:{'Content-Type':'application/json',Origin:'https://budimse.online',apikey:manifest.publicKey,Authorization:'Bearer '+manifest.publicKey,'x-client-info':'budimse-load-fixture'},
        body:JSON.stringify(payload(actor)),signal:AbortSignal.timeout(20000),
      });
      const raw=await response.text(),body=JSON.parse(raw);
      const denied=phase==='deny'||phase==='analyzer-deny';
      if(response.status!==(denied?403:200))throw new Error('HTTP '+response.status);
      if(!denied){
        if(body.state?.access?.room.id!==actor.room_id)throw new Error('Room isolation failed');
        if(body.state.posts?.some(post=>!post.alias.startsWith(actor.group)))throw new Error('Foreign classroom content');
        if(body.state.unchanged!==true&&(phase==='read'||phase==='steady'))actor.revision=body.state.revision;
        if(phase==='join')actor.member_id=body.state.access.member_id;
        if(phase==='publish')actor.post_id=body.state.posts.find(post=>post.member_id===actor.member_id)?.id;
      }
      samples.push({ms:performance.now()-start,status:response.status,bytes:Buffer.byteLength(raw),unchanged:body.state?.unchanged===true});
    }catch(error){failures++;samples.push({ms:performance.now()-start,error:error.name==='TimeoutError'?'timeout':error.message});}
    completed++;if(completed%100===0)process.stdout.write(JSON.stringify({phase,completed,failures})+'\n');
}
async function worker(){while(next<participants.length&&failures<6)await perform(participants[next++]);}
if(phase==='steady'){
  const seconds=Number(option('--duration','60'));if(!Number.isInteger(seconds)||seconds<5||seconds>60)throw new Error('Steady duration must be 5–60 seconds.');
  const due=participants.map((actor,index)=>({actor,at:started+index*9000/participants.length,period:8000+(index*37%2000),pending:false}));
  const queue=[];let active=0;
  while(performance.now()<started+seconds*1000||queue.length||active){
    const now=performance.now();
    if(now<started+seconds*1000&&failures<6)for(const entry of due)if(now>=entry.at){
      entry.at+=entry.period;
      if(entry.pending){skippedPollingTicks++;continue;}
      entry.pending=true;scheduled++;queue.push({entry,start:now});
    }
    maxQueued=Math.max(maxQueued,queue.length);
    while(queue.length&&active<concurrency){
      const task=queue.shift();active++;
      void perform(task.entry.actor,task.start).finally(()=>{active--;task.entry.pending=false;});
    }
    await new Promise(resolve=>setTimeout(resolve,50));
  }
}else await Promise.all(Array.from({length:concurrency},worker));
await writeFile(manifestPath,JSON.stringify(manifest));
const latency=samples.map(sample=>sample.ms).sort((a,b)=>a-b),percentile=p=>Math.round(latency[Math.min(latency.length-1,Math.floor(latency.length*p))]??0);
const result={phase,conditional,participants:participants.length,concurrency,completed,failures,scheduled,skippedPollingTicks,maxQueued,seconds:Math.round((performance.now()-started)/100)/10,p50ms:percentile(.5),p95ms:percentile(.95),p99ms:percentile(.99),responseBytes:samples.reduce((sum,s)=>sum+(s.bytes??0),0),unchanged:samples.filter(s=>s.unchanged).length,errors:samples.filter(s=>s.error).slice(0,6).map(s=>s.error)};
console.log(JSON.stringify(result));
if(option('--output'))await writeFile(option('--output'),JSON.stringify(result,null,2)+'\n');
if(failures||(phase==='steady'?completed<participants.length:completed!==participants.length))process.exitCode=1;
