interface JsonObject {
  [key: string]: unknown;
}

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// IMPORTANT: Your project clearly cannot use gemini-2.0-flash (404 for new users).
// So we must NOT try it at all, to prevent failing after fallbacks.
const MODEL_CANDIDATES = [
  'gemini-1.5-flash',
  'gemini-1.5-pro',
];

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { text } = (await req.json()) as { text?: unknown };

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      throw new Error('Невалиден текст за анализ');
    }

    if (text.length > 1500) {
      throw new Error('Текстът е твърде дълъг (максимум 1500 символа)');
    }

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API ключът не е конфигуриран');
    }

    const prompt = `Ти си невролог и специалист по поведенчески дизайн. Анализирай следния текст по 10-векторна система.

ТЕКСТ:\n"""\n${text}\n"""\n
ИНСТРУКЦИИ:
- За всеки вектор: обясни КОНКРЕТНО какъв психологически механизъм използва ТОЗИ текст — не говори абстрактно
- Ако векторът не е засечен, score = 0, description = "Не е засечен"
- Препоръката трябва да е СПЕЦИФИЧНА за ТОЗИ конкретен текст — цитирай конкретна дума/фраза и обясни как работи
- Отговаряй изключително на БЪЛГАРСКИ
- Върни САМО валиден JSON — без markdown, без обяснения преди или след

ФОРМАТ НА ОТГОВОРА:
{
  "v1_emotional_provocation": {"score": 0-35,"description": "..."},
  "v2_moral_pressure": {"score": 0-35,"description": "..."},
  "v3_polarization": {"score": 0-35,"description": "..."},
  "v4_urgency_hooks": {"score": 0-40,"description": "..."},
  "v5_insinuations": {"score": 0-40,"description": "..."},
  "v6_cognitive_overload": {"score": 0-30,"description": "..."},
  "v7_sarcasm": {"score": 0-25,"description": "..."},
  "v8_meme_pressure": {"score": 0-25,"description": "..."},
  "v9_headline_mismatch": {"score": 0-30,"description": "..."},
  "v10_social_amplification": {"score": 0-40,"description": "..."},
  "total_risk": 0-100,
  "risk_level": "ИНФОРМАТИВНО|ЕМОЦИОНАЛНО ОФОРМЕНО|МАНИПУЛАТИВНО|ВИСОКОРИСКОВО",
  "risk_color": "gray|yellow|orange|red",
  "cognitive_reaction": "Едно изречение: ...",
  "recommendation": "2-3 изречения, ...",
  "detected_patterns": ["..."],
  "dominant_vector": "V1|V2|V3|V4|V5|V6|V7|V8|V9|V10",
  "is_dominant": true
}`;

    let lastModelError: unknown = null;
    let usedModel = '';
    let geminiData: { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };

    for (const candidateModel of MODEL_CANDIDATES) {
      try {
        usedModel = candidateModel;
        console.log('Trying Gemini model:', usedModel);

        const geminiResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${usedModel}:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.2,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 2048,
              },
            }),
          }
        );

        if (!geminiResponse.ok) {
          const errorData = await geminiResponse.text();
          console.warn('Gemini API error:', { model: usedModel, errorData });
          throw new Error(`Gemini API error (model=${usedModel})`);
        }

        geminiData = (await geminiResponse.json()) as {
          candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
        };

        break;
      } catch (e) {
        lastModelError = e;
      }
    }

    const responseText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!responseText) {
      throw new Error(
        `Невалиден отговор от Gemini API (model=${usedModel}).` +
          (lastModelError ? ` Last error: ${String(lastModelError)}` : '')
      );
    }

    let analysisData: any;
    try {
      const jsonMatch =
        responseText.match(/```json\s*([\s\S]*?)\s*```/) ||
        responseText.match(/```\s*([\s\S]*?)\s*```/) ||
        [null, responseText];

      const jsonText = jsonMatch[1] || responseText;
      analysisData = JSON.parse(jsonText.trim()) as JsonObject;
    } catch (parseError) {
      console.error('JSON parse error:', parseError, responseText);
      throw new Error('Невалиден JSON от Gemini');
    }

    if (
      typeof analysisData.total_risk !== 'number' ||
      !analysisData.risk_level ||
      !analysisData.recommendation
    ) {
      throw new Error('Непълни данни от анализа');
    }

    analysisData.total_risk = Math.min(
      100,
      Math.max(0, Math.round(analysisData.total_risk))
    );

    const vectorDefs = [
      { key: 'v1_emotional_provocation', label: 'V1 · Емоционална провокация', maxScore: 35 },
      { key: 'v2_moral_pressure', label: 'V2 · Морален натиск и срам', maxScore: 35 },
      { key: 'v3_polarization', label: 'V3 · Поляризация "Ние срещу Тях"', maxScore: 35 },
      { key: 'v4_urgency_hooks', label: 'V4 · Изкуствена спешност', maxScore: 40 },
      { key: 'v5_insinuations', label: 'V5 · Инсинуации и полуистини', maxScore: 40 },
      { key: 'v6_cognitive_overload', label: 'V6 · Когнитивно претоварване', maxScore: 30 },
      { key: 'v7_sarcasm', label: 'V7 · Сарказъм и ирония', maxScore: 25 },
      { key: 'v8_meme_pressure', label: 'V8 · Мем и краткоформен натиск', maxScore: 25 },
      { key: 'v9_headline_mismatch', label: 'V9 · Clickbait несъответствие', maxScore: 30 },
      { key: 'v10_social_amplification', label: 'V10 · Социално усилване', maxScore: 40 },
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

    const result = {
      totalRisk: analysisData.total_risk,
      riskLevel: analysisData.risk_level,
      riskColor: analysisData.risk_color,
      riskCategory: analysisData.risk_level,
      cognitiveReaction: analysisData.cognitive_reaction,
      auditExplanation: `Засечена ${analysisData.total_risk}% вероятност за манипулативно оформление.`,
      recommendation: analysisData.recommendation,
      vectorAnalysis,
      detectedPatterns: analysisData.detected_patterns || [],
      isDominant: analysisData.is_dominant || false,
      dominantVector: analysisData.dominant_vector || '',
      source: 'gemini-ai',
    };

    return new Response(JSON.stringify({ success: true, analysis: result, modelUsed: usedModel }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Грешка при анализа';
    console.error('Error:', error);
    return new Response(JSON.stringify({ success: false, error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
