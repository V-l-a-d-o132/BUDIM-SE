import { verifyRecaptcha, rateLimit, readBody, publicRequestError, corsHeaders, requestBodyErrorResponse, rateLimitResponse, ownerHash, serviceClient, sha256 } from '../_shared/security.ts';
import { ANALYSIS_MODEL, ANALYSIS_INSTRUCTIONS, validatedContentAnalysis } from '../_shared/content-analysis.ts';

Deno.serve(async (req: Request) => {
  const rejected = publicRequestError(req); if (rejected) return rejected;
  const headers = corsHeaders(req);
  try {
  if (!await rateLimit(req, 'content-analyzer-network', 120)) return rateLimitResponse(headers);
  const body = await readBody(req, 12000);
  let actor: string;
  try { actor = await ownerHash(body.access_token); }
  catch { return Response.json({error:'Анализаторът изисква разрешение от водещия.'},{status:403,headers}); }
  const access = await serviceClient().rpc('lab_check_access',{actor_hash:actor,required_scope:'analyzer'});
  if (access.error) throw new Error('Access service unavailable');
  if (!access.data) return Response.json({error:'Анализаторът не е разрешен за това занимание.'},{status:403,headers});
  const budget=await serviceClient().rpc('consume_rate_limit',{bucket_key:await sha256(actor+':analysis:'+Math.floor(Date.now()/60000)),max_requests:6});
  if(budget.error) throw new Error('Analysis budget unavailable');
  if(!budget.data) return rateLimitResponse(headers);
  if (typeof body.text !== 'string' || body.text.trim().length < 10 || body.text.length > 1500) return Response.json({ error:'Въведи текст от 10 до 1500 символа.' }, { status:400, headers });
  if (!await verifyRecaptcha(body.recaptcha_token)) return Response.json({ error:'Проверката за изпращане не е успешна. Опитай отново.' }, { status:403, headers });
    const key = Deno.env.get('GROQ_API_KEY');
    if (!key) throw new Error('Provider unavailable');
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method:'POST', headers:{'Content-Type':'application/json',Authorization:`Bearer ${key}`},
      signal:AbortSignal.timeout(20000),
      body:JSON.stringify({ model:ANALYSIS_MODEL, messages:[
        {role:'system',content:ANALYSIS_INSTRUCTIONS},
        {role:'user',content:JSON.stringify({text:body.text})},
      ], temperature:0.1,max_tokens:2400,response_format:{type:'json_object'} }),
    });
    if (!response.ok) throw new Error('Provider unavailable');
    const data = await response.json();
    const analysis = validatedContentAnalysis(JSON.parse(data.choices?.[0]?.message?.content),body.text);
    return Response.json({ success:true,analysis }, { headers });
  } catch (error) {
    const bodyError = requestBodyErrorResponse(error, headers); if (bodyError) return bodyError;
    // Neither user text, generated content nor raw provider errors enter logs.
    console.error('Content analysis unavailable or invalid');
    return Response.json({ success:false,error:'Анализът временно не е достъпен или не може да бъде проверен. Опитай отново.' }, { status:503, headers });
  }
});

