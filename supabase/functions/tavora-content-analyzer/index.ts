import { verifyRecaptcha, rateLimit, readBody, publicRequestError, corsHeaders } from '../_shared/security.ts';
import { ANALYSIS_MODEL, ANALYSIS_INSTRUCTIONS, validatedContentAnalysis } from '../_shared/content-analysis.ts';

Deno.serve(async (req: Request) => {
  const rejected = publicRequestError(req); if (rejected) return rejected;
  const headers = corsHeaders(req);
  if (!await rateLimit(req, 'content-analyzer', 10)) return Response.json({ error:'Твърде много заявки. Опитай след малко.' }, { status:429, headers });
  let body;
  try { body = await readBody(req); } catch { return Response.json({error:'Невалидна заявка.'},{status:400,headers}); }
  if (typeof body.text !== 'string' || body.text.trim().length < 10 || body.text.length > 1500) return Response.json({ error:'Въведи текст от 10 до 1500 символа.' }, { status:400, headers });
  if (!await verifyRecaptcha(body.recaptcha_token)) return Response.json({ error:'Проверката за изпращане не е успешна. Опитай отново.' }, { status:403, headers });
  try {
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
  } catch {
    // Neither user text, generated content nor raw provider errors enter logs.
    console.error('Content analysis unavailable or invalid');
    return Response.json({ success:false,error:'Анализът временно не е достъпен или не може да бъде проверен. Опитай отново.' }, { status:503, headers });
  }
});
