import { verifyRecaptcha, rateLimit, readBody, publicRequestError } from '../_shared/security.ts';

const ALLOWED_ORIGINS = [
  'https://budimse.online',
  'https://www.budimse.online',
  'http://localhost:5173',
  'http://localhost:3000',
];

function getCorsHeaders(origin: string | null) {
  const corsOrigin = ALLOWED_ORIGINS.includes(origin ?? '') ? (origin ?? ALLOWED_ORIGINS[0]) : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
}

function getRiskLevel(total: number): string {
  if (total <= 24) return 'Ниско наличие на сигнали';
  if (total <= 49) return 'Умерено наличие на сигнали';
  if (total <= 74) return 'Повишено наличие на сигнали';
  return 'Силно наличие на сигнали';
}

function getRiskColor(total: number): string {
  if (total <= 24) return 'gray';
  if (total <= 49) return 'yellow';
  if (total <= 74) return 'orange';
  return 'red';
}

Deno.serve(async (req) => {
  const gate = publicRequestError(req);
  if (gate) return gate;
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (!await rateLimit(req, 'content-analyzer', 10)) {
    return new Response(
      JSON.stringify({ error: 'Too many requests. Please try again later.' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
    );
  }

  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    return new Response(
      JSON.stringify({ error: 'Invalid origin' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
    );
  }

  try {
    const { text, recaptcha_token } = await readBody(req);

    if (!recaptcha_token) {
      return new Response(
        JSON.stringify({ error: 'reCAPTCHA token is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const recaptchaValid = await verifyRecaptcha(recaptcha_token);
    if (!recaptchaValid) {
      return new Response(
        JSON.stringify({ error: 'reCAPTCHA validation failed. Please try again.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      throw new Error('Невалиден текст за анализ');
    }

    if (text.length > 1500) {
      throw new Error('Текстът е твърде дълъг (максимум 1500 символа)');
    }

    const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
    if (!GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY не е конфигуриран в Supabase Secrets');
    }

    const prompt = `Ти си опитен медиен анализатор и журналист. Задачата ти е да оцениш обективно какви езикови и структурни похвати използва даден текст.

ВАЖНИ ПРАВИЛА:
- Бъди честен и балансиран. Ако текстът е нормален и информативен — кажи го директно.
- Не търси въздействие там, където го няма. Повечето текстове са обикновени.
- Цитирай конкретни думи или изречения от текста като доказателство.
- Пиши като журналист: кратко, ясно, без научен жаргон.
- Ако дадена категория НЕ е засечена — score задължително е 0.
- Оценявай характеристиките на текста, БЕЗ да осъждаш съдържанието или автора.
- Отговаряй само на БЪЛГАРСКИ.
- Върни САМО валиден JSON без markdown.

ТЕКСТ ЗА АНАЛИЗ:
"""
${text}
"""

СКАЛА ЗА ОЦЕНКА:
- 0: Категорията напълно отсъства
- 1-10: Лека употреба, нормална за всяка комуникация
- 11-25: Забележима употреба, заслужава внимание
- 26+: Силна употреба

ФОРМАТ НА ОТГОВОРА:
{
  "emotional_pressure": { "score": 0-40, "description": "..." },
  "urgency_suggestion": { "score": 0-40, "description": "..." },
  "social_pressure": { "score": 0-40, "description": "..." },
  "polarizing_language": { "score": 0-40, "description": "..." },
  "auto_reaction_nudge": { "score": 0-40, "description": "..." },
  "total_risk": 0-100,
  "overall_assessment": "...",
  "positive_notes": "...",
  "recommendation": "...",
  "detected_patterns": ["..."]
}

ВАЖНО за total_risk:
- Обикновена новина или информативен текст: 0-20
- Текст с мнение или лека реторика: 20-40
- Текст с ясна цел за убеждаване: 40-65
- Текст с множество похвати за въздействие: 65-100
Не завишавай изкуствено — бъди честен.`;

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'Ти си обективен медиен анализатор. Оценяваш езиковите и структурни похвати в текстове честно и балансирано. Отговаряш само с валиден JSON на български език.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.1,
        max_tokens: 2048,
        response_format: { type: 'json_object' },
      }),
    });

    if (!groqResponse.ok) {
      const errorData = await groqResponse.text();
      console.error('Groq API error:', errorData);
      throw new Error(`Groq API грешка: ${groqResponse.status} — ${errorData.slice(0, 200)}`);
    }

    const groqData = await groqResponse.json();

    if (!groqData.choices?.[0]?.message?.content) {
      throw new Error('Невалиден отговор от Groq API');
    }

    const responseText = groqData.choices[0].message.content;

    let analysisData;
    try {
      const jsonMatch =
        responseText.match(/```json\s*([\s\S]*?)\s*```/) ||
        responseText.match(/```\s*([\s\S]*?)\s*```/) ||
        [null, responseText];
      const jsonText = jsonMatch[1] || responseText;
      analysisData = JSON.parse(jsonText.trim());
    } catch (parseError) {
      console.error('JSON parse error:', parseError, responseText);
      throw new Error('Невалиден JSON от Groq');
    }

    if (
      typeof analysisData.total_risk !== 'number' ||
      !analysisData.recommendation
    ) {
      throw new Error('Непълни данни от анализа');
    }

    analysisData.total_risk = Math.min(100, Math.max(0, Math.round(analysisData.total_risk)));

    const vectorDefs = [
      { key: 'emotional_pressure', label: 'Емоционален натиск', maxScore: 40 },
      { key: 'urgency_suggestion', label: 'Внушение за спешност', maxScore: 40 },
      { key: 'social_pressure', label: 'Социален натиск', maxScore: 40 },
      { key: 'polarizing_language', label: 'Поляризиращ език', maxScore: 40 },
      { key: 'auto_reaction_nudge', label: 'Подтик към автоматична реакция', maxScore: 40 },
    ];

    const vectorAnalysis = vectorDefs
      .filter((v) => analysisData[v.key] && analysisData[v.key].score > 0)
      .map((v) => ({
        vector: v.label,
        score: analysisData[v.key].score,
        maxScore: v.maxScore,
        description: analysisData[v.key].description,
      }))
      .sort((a, b) => b.score - a.score);

    const totalRisk = analysisData.total_risk;

    const result = {
      totalRisk,
      riskLevel: getRiskLevel(totalRisk),
      riskColor: getRiskColor(totalRisk),
      riskCategory: getRiskLevel(totalRisk),
      cognitiveReaction: analysisData.overall_assessment || '',
      positiveNotes: analysisData.positive_notes || null,
      auditExplanation: `Ориентировъчна оценка на сигналите за въздействие: ${totalRisk}%`,
      recommendation: analysisData.recommendation,
      vectorAnalysis,
      detectedPatterns: analysisData.detected_patterns || [],
      isDominant: false,
      dominantVector: '',
      socialBonus: 0,
      source: 'groq-llama-3.3-70b',
    };

    return new Response(JSON.stringify({ success: true, analysis: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Неуспешна обработка на анализа.',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
