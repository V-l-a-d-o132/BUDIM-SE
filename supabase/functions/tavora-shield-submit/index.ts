import { verifyRecaptcha, rateLimit, readBody, publicRequestError, corsHeaders, requestBodyErrorResponse, rateLimitResponse } from '../_shared/security.ts';
import { validAssessmentAnswers } from '../_shared/assessment-validation.ts';
import { assessmentResult } from '../_shared/assessment-result.ts';

Deno.serve(async (req: Request) => {
  const rejected = publicRequestError(req); if (rejected) return rejected;
  const headers = corsHeaders(req);
  try {
  if (!await rateLimit(req,'assessment',10)) return rateLimitResponse(headers);
  const body = await readBody(req, 12000);
  if (!validAssessmentAnswers(body.answers)) return Response.json({error:'Необходими са 35 валидни отговора.'},{status:400,headers});
  if (!await verifyRecaptcha(body.recaptcha_token)) return Response.json({error:'Проверката за изпращане не е успешна. Опитай отново.'},{status:403,headers});
  // Raw self-reports and results are calculated for this response only. They
  // are not inserted into the database or written to application logs.
  return Response.json({success:true,result:{id:crypto.randomUUID(),...assessmentResult(body.answers),notSaved:true}},{headers});
  } catch (error) {
    return requestBodyErrorResponse(error, headers) ?? Response.json({error:'Изчислението временно не е достъпно. Опитай отново.'},{status:503,headers});
  }
});
