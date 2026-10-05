interface JsonObject {
  [key: string]: unknown;
}

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const text = body?.text;

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

    const MODEL = 'gemini-1.5-flash';

    const prompt = `Ти си аналитичен асистент за съдържание и комуникационни техники. Анализирай следния текст по 10-векторна система като САМО установяваш реторични/поведенчески механизми. Не прави медицински/диагностични твърдения. Не предлагай лечение.

ТЕКСТ:
"""
${text}
"""

ИНСТРУКЦИИ:
- За всеки вектор обясни КОНКРЕТНО КАК текста използва конкретна техника и КАКВО е очакваното въздействие върху читателя — без абстрактни общи фрази.
- Ако векторът не е засечен, score = 0, description = "Не е засечен"
- Препоръката трябва да е СПЕЦИФИЧНА за ТОЗИ конкретен текст: цитирай конкретна дума/фраза от него и обясни как читателят да я разпознае следващия път и как да провери/неутрализира ефекта.
- Върни изключително на БЪЛГАРСКИ.
- Върни САМО валиден JSON — без markdown, без обяснения преди или след.

ФОРМАТ НА ОТГОВОРА:
{
  "v1_emotional_provocation": { "score": 0-35, "description": "Конкретно: кои думи/фрази подсилват емоционален отговор и какво насочват (напр. яд/страх/тревожност/съчувствие), без медицински твърдения." },
  "v2_moral_pressure": { "score": 0-35, "description": "Конкретно: кои елементи апелират към групова идентичност/срам и как принуждават действие." },
  "v3_polarization": { "score": 0-35, "description": "Конкретно: как текстът разделя 'ние/те' и защо това намалява пространството за критично мислене." },
  "v4_urgency_hooks": { "score": 0-40, "description": "Конкретно: кои думи създават изкуствена спешност и защо това ускорява реакция преди проверка." },
  "v5_insinuations": { "score": 0-40, "description": "Конкретно: кои внушения/полуистини или неуказани факти карат читателя да запълва празнини и да стига до изводи сам (ако липсват данни, посочи това)." },
  "v6_cognitive_overload": { "score": 0-30, "description": "Конкретно: как структура/натрупване на твърдения претоварва вниманието и увеличава вероятността за повърхностно приемане." },
  "v7_sarcasm": { "score": 0-25, "description": "Конкретно: как сарказъм/ирония създава in-group/out-group динамика и движи избора на страна." },
  "v8_meme_pressure": { "score": 0-25, "description": "Конкретно: кои елементи използват кратки, мем-подобни формулировки или повторяеми слогани за да намалят Система 2 работа." },
  "v9_headline_mismatch": { "score": 0-30, "description": "Конкретно: каква е разликата между обещаното (заглавие/водеща фраза) и реалното съдържание — clickbait механизъм." },
  "v10_social_amplification": { "score": 0-40, "description": "Конкретно: кои елементи играят на социален натиск (напр. 'всички', 'сподели', 'не закъснявай') и как подсилват ефекта." },
  "total_risk": 0-100,
  "risk_level": "ИНФОРМАТИВНО|ЕМОЦИОНАЛНО ОФОРМЕНО|МАНИПУЛАТИВНО|ВИСОКОРИСКОВО",
  "risk_color": "gray|yellow|orange|red",
  "cognitive_reaction": "Едно изречение: какъв тип въздействие е вероятно да се получи при среден читател (без медицински/диагностични термини).",
  "recommendation": "2-3 изречения: конкретни стъпки за проверка и неутрализиране за ТОЗИ текст. Цитирай дума/фраза от него и кажи как да я провериш (източник, контекст, данни, предположения).",
  "detected_patterns": ["конкретен засечен шаблон 1", "конкретен засечен шаблон 2"],
  "dominant_vector": "V1|V2|V3|V4|V5|V6|V7|V8|V9|V10",
  "is_dominant": true
}`;

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`,
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
      console.error('Gemini API error:', errorData);
      throw new Error(`Грешка при комуникация с Gemini API (model=${MODEL})`);
    }

    const geminiData = await geminiResponse.json();
    const responseText: string | undefined =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      throw new Error('Невалиден отговор от Gemini API');
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

    analysisData.total_risk = Math.min(100, Math.max(0, Math.round(analysisData.total_risk)));

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
      .filter((v) => analysisData[v.key] && (analysisData as any)[v.key].score > 0)
      .map((v) => ({
        vector: v.label,
        score: (analysisData as any)[v.key].score,
        maxScore: v.maxScore,
        description: (analysisData as any)[v.key].description,
      }))
      .sort((a, b) => b.score - a.score);

    const result = {
      totalRisk: analysisData.total_risk,
      riskLevel: analysisData.risk_level,
      riskColor: analysisData.risk_color,
      riskCategory: analysisData.risk_level,
      cognitiveReaction: analysisData.cognitive_reaction,
      auditExplanation: `Индикатор за потенциално въздействащи техники: ${analysisData.total_risk}% (индикативно, не диагноза).`,
      recommendation: analysisData.recommendation,
      vectorAnalysis,
      detectedPatterns: analysisData.detected_patterns || [],
      isDominant: analysisData.is_dominant || false,
      dominantVector: analysisData.dominant_vector || '',
      socialBonus: 0,
      source: 'gemini-ai',
      modelUsed: MODEL,
    };

    return new Response(JSON.stringify({ success: true, analysis: result }), {
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
