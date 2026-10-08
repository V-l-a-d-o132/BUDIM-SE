import { corsHeaders, ownerHash, publicRequestError, rateLimit, rateLimitResponse, readBody,
  requestBodyErrorResponse, serviceClient, sha256 } from '../_shared/security.ts';

const operations = ['state','join','prepare_upload','publish','react','comment','save','share','view',
  'follow','message','read_notifications','delete_post'];
const payloadFields = ['post_id','app_id','kind','content','media_id','reaction','active',
  'target_id','recipient_id','subject','mime_type','size','request_id'];

// Cache file URLs only after authorized snapshots, never data or permissions.
const mediaUrls=new Map<string,{url:string;expires:number}>();

async function signedState(client: any, state: any) {
  const media = (state.posts ?? []).map((post: any) => post.media).filter(Boolean);
  const paths = [...new Set<string>(media.map((file: any) => file.path))];
  const missing=paths.filter(path=>(mediaUrls.get(path)?.expires??0)<Date.now()+60000);
  if (missing.length) {
    const signed = await client.storage.from('classroom-media').createSignedUrls(missing, 300);
    if (signed.error) throw new Error('Media service unavailable');
    for(const item of signed.data??[])if(item.signedUrl){
      mediaUrls.delete(item.path);mediaUrls.set(item.path,{url:item.signedUrl,expires:Date.now()+300000});
    }
    while(mediaUrls.size>1000)mediaUrls.delete(mediaUrls.keys().next().value!);
  }
  for(const file of media){const cached=mediaUrls.get(file.path);file.url=cached?.url??null;file.url_expires_at=cached?.expires??0;delete file.path;}
  return state;
}

Deno.serve(async (req: Request) => {
  const rejected = publicRequestError(req); if (rejected) return rejected;
  const headers = corsHeaders(req);
  try {
    const body = await readBody(req, 16000);
    if (!operations.includes(body.action)) return Response.json({error:'Непознато действие.'},{status:400,headers});
    let hash: string;
    try { hash = await ownerHash(body.access_token); }
    catch { return Response.json({error:'Влез в занимание и заяви достъп от водещия.'},{status:403,headers}); }
    const client = serviceClient();
    if (!await rateLimit(req, 'classroom-' + (body.action === 'join' ? 'join' : 'activity'), body.action === 'join' ? 1000 : 10000)) return rateLimitResponse(headers);
    const limit = await client.rpc('consume_rate_limit', {
      bucket_key: await sha256(hash + ':classroom:' + Math.floor(Date.now()/60000)), max_requests: 120,
    });
    if (limit.error) throw new Error('Limit unavailable');
    if (!limit.data) return rateLimitResponse(headers);
    let result;
    if (body.action === 'state') result = await client.rpc('lab_sync',{actor_hash:hash,known_revision:typeof body.revision==='string'&&body.revision.length<30?body.revision:null});
    else if (body.action === 'join') {
      if (typeof body.code !== 'string' || !/^[A-Z0-9]{8,12}$/.test(body.code)
        || typeof body.alias !== 'string' || body.alias.trim().length<2 || body.alias.length>40)
        return Response.json({error:'Провери кода и псевдонима.'},{status:400,headers});
      result = await client.rpc('lab_join',{actor_hash:hash,room_code:body.code,participant_alias:body.alias});
    } else {
      const details = Object.fromEntries(payloadFields.filter(key => body[key] !== undefined).map(key => [key,body[key]]));
      if (body.action === 'publish' && body.media_id) {
        const info = await client.rpc('lab_command',{actor_hash:hash,operation:'media_info',details:{media_id:body.media_id}});
        if (info.error) return Response.json({error:'Файлът не е достъпен за публикуване.'},{status:403,headers});
        const file = info.data;
        const separator = file.path.lastIndexOf('/');
        const listed = await client.storage.from('classroom-media').list(file.path.slice(0,separator), {search:file.path.slice(separator+1),limit:1});
        const stored = listed.data?.find((item: any) => item.name===file.path.slice(separator+1));
        if (listed.error || !stored || stored.metadata?.size !== file.size || stored.metadata?.mimetype !== file.mime_type)
          return Response.json({error:'Качването не е завършило или файлът е с различен формат.'},{status:400,headers});
        const confirmed = await client.rpc('lab_command',{actor_hash:hash,operation:'confirm_media',details:{media_id:body.media_id}});
        if (confirmed.error) throw new Error('Media confirmation failed');
      }
      result = await client.rpc('lab_command',{actor_hash:hash,operation:body.action,details});
      if (!result.error && body.action === 'prepare_upload') {
        const signed = await client.storage.from('classroom-media').createSignedUploadUrl(result.data.path);
        if (signed.error || !signed.data?.token) throw new Error('Upload service unavailable');
        return Response.json({success:true,upload:{media_id:result.data.id,path:result.data.path,token:signed.data.token}},{headers});
      }
    }
    if (result.error) {
      const status = result.error.code==='42501' ? 403 : ['22023','22P02','23514','23503'].includes(result.error.code) ? 400 : 503;
      const message = status<500 && typeof result.error.message==='string' && /[А-Яа-я]/.test(result.error.message)
        ? result.error.message : status===403 ? 'Действието не е разрешено от водещия.' : status===400 ? 'Провери въведените данни.' : 'Заниманието временно не е достъпно.';
      return Response.json({error:message},{status,headers});
    }
    return Response.json({success:true,state:await signedState(client,result.data)},{headers});
  } catch (error) {
    const rejectedBody=requestBodyErrorResponse(error,headers); if(rejectedBody) return rejectedBody;
    console.error('Classroom operation unavailable');
    return Response.json({error:'Действието не е завършено. Опитай отново.'},{status:503,headers});
  }
});
