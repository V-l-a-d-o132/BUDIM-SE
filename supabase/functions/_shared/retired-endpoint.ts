import { corsHeaders } from './security.ts';

// These unused routes must not read a body, call an AI provider or write data.
export function retiredEndpoint(req: Request): Response {
  const headers = corsHeaders(req);
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers });
  return Response.json({ success: false, error: 'Тази операция вече не е налична. Използвай актуалните инструменти в сайта.' }, { status: 410, headers });
}
