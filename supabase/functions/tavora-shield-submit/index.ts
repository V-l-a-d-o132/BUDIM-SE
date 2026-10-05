import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const ALLOWED_ORIGINS = [
  'https://budimse.online',
  'https://www.budimse.online',
  'http://localhost:5173',
  'http://localhost:3000',
];

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string, maxRequests = 10, windowMs = 60000): boolean {
  const now = Date.now();
  const key = `${ip}:${Math.floor(now / windowMs)}`;
  const entry = rateLimitMap.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= maxRequests) return false;
  entry.count++;
  return true;
}

function getCorsHeaders(origin: string | null) {
  const corsOrigin = ALLOWED_ORIGINS.includes(origin ?? '') ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
}

async function verifyRecaptcha(token: string): Promise<boolean> {
  const secretKey = Deno.env.get('RECAPTCHA_SECRET_KEY');
  if (!secretKey) {
    console.warn('RECAPTCHA_SECRET_KEY not configured, skipping validation');
    return true;
  }
  try {
    const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${encodeURIComponent(secretKey)}&response=${encodeURIComponent(token)}`,
    });
    const data = await res.json();
    return data.success === true;
  } catch (e) {
    console.error('reCAPTCHA verification error:', e);
    return false;
  }
}

const PROFILE_NAMES: Record<number, string> = {
  1: 'Начало на осъзнаването',
  2: 'Изграждане на дистанция',
  3: 'Развиваща се устойчивост',
  4: 'Осъзната самостоятелност',
  5: 'Устойчив дигитален баланс',
};

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!checkRateLimit(clientIp, 10, 60000)) {
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
    const bodyText = await req.text();
    if (bodyText.length > 50000) {
      return new Response(
        JSON.stringify({ error: 'Payload too large (max 50KB)' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 413 }
      );
    }

    const { answers, recaptcha_token } = JSON.parse(bodyText);

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

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    if (!answers || typeof answers !== 'object' || Array.isArray(answers)) {
      return new Response(
        JSON.stringify({ error: 'Невалидни отговори' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const answerKeys = Object.keys(answers);
    if (answerKeys.length > 40) {
      return new Response(
        JSON.stringify({ error: 'Твърде много отговори' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    for (const key of answerKeys) {
      const val = answers[key];
      if (typeof val !== 'number' || !Number.isInteger(val) || val < 0 || val > 8) {
        return new Response(
          JSON.stringify({ error: `Невалидна стойност за ${key}` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
    }

    // ─── ЧАСТ 1: АВТОМАТИЧНА РЕАКТИВНОСТ ───────────
    const pciRaw = Array.from({ length: 7 }, (_, i) => answers[`0-${i}`] ?? 0)
      .reduce((a: number, b: number) => a + b, 0);
    const pciNorm = Math.round((pciRaw / 42) * 100);

    // ─── ЧАСТ 2: ДИГИТАЛНА УМОРА ─────────────
    const eeiRaw = Array.from({ length: 7 }, (_, i) => answers[`1-${i}`] ?? 0)
      .reduce((a: number, b: number) => a + b, 0);
    const eeiNorm = Math.round((eeiRaw / 42) * 100);

    // ─── ЧАСТ 3: КРИТИЧНА УСТОЙЧИВОСТ ─────────────
    const criRaw = Array.from({ length: 7 }, (_, i) => answers[`2-${i}`] ?? 0)
      .reduce((a: number, b: number) => a + b, 0);
    const criInverted = 28 - criRaw;
    const criNorm = Math.round((criInverted / 28) * 100);

    // ─── ЧАСТ 4: ДИГИТАЛНА САМОСТОЯТЕЛНОСТ ──────────────────────
    const asiQ036 = [0, 3, 6].reduce((sum: number, i: number) => sum + (answers[`3-${i}`] ?? 0), 0);
    const asiQ14 = [1, 4].reduce((sum: number, i: number) => sum + (4 - (answers[`3-${i}`] ?? 0)), 0);
    const asiQ25 = [2, 5].reduce((sum: number, i: number) => sum + (answers[`3-${i}`] ?? 0), 0);
    const asiRaw = asiQ036 + asiQ14 + asiQ25;
    const asiNorm = Math.round((asiRaw / 32) * 100);

    // ─── ЧАСТ 5: ОБЩА КАРТИНА ────────────────────
    const p5Q0 = answers['4-0'] ?? 0;
    const p5Q1 = answers['4-1'] ?? 0;
    const p5Q2 = answers['4-2'] ?? 0;
    const p5Q3 = answers['4-3'] ?? 0;
    const p5Q4 = answers['4-4'] ?? 0;
    const p5Q5 = answers['4-5'] ?? 0;
    const p5Q6inv = 8 - (answers['4-6'] ?? 0);
    const p5Raw = p5Q0 + p5Q1 + p5Q2 + p5Q3 + p5Q4 + p5Q5 + p5Q6inv;
    const p5Norm = Math.round((p5Raw / 48) * 100);

    // ─── ОБЩ ДИГИТАЛЕН БАЛАНС ───────────────────────────────────────────────
    const dependencyIndex = Math.round(
      pciNorm * 0.25 +
      eeiNorm * 0.25 +
      criNorm * 0.20 +
      asiNorm * 0.15 +
      p5Norm  * 0.15
    );

    // ─── КЛАСИФИКАЦИЯ ─────────────────────────────────────────────────
    let stepNumber: number;
    let stepName: string;
    let stepSubtitle: string;
    let stepDescription: string;
    let stepAction: string;

    if (dependencyIndex >= 80) {
      stepNumber = 1;
      stepName = 'Разпознаване на стимула';
      stepSubtitle = 'Автоматични реакции';
      stepDescription = 'При много хора устройството е първото нещо, до което посягат сутрин и последното вечер — не по решение, а по навик. Скролването става без ясна причина, а гледаните видеа не се помнят минути по-късно. Това е състояние на автоматични реакции, което методологията разпознава като отправна точка.';
      stepAction = 'Разпознаването на този автоматизъм вече е първа стъпка. Методологията започва точно оттук.';
    } else if (dependencyIndex >= 60) {
      stepNumber = 2;
      stepName = 'Пауза и осъзнатост';
      stepSubtitle = 'Осъзнаване на цената';
      stepDescription = 'При много хора се появява усещане за изтощение след скролване — не отмора, а умора. Времето минава незабелязано, а приложението се затваря и отваря отново без ясна причина. Това е моментът на осъзнаване на цената, при който навикът е по-силен от намерението.';
      stepAction = 'Тази умора е сигнал, не слабост. Методологията показва как да се използва като отправна точка.';
    } else if (dependencyIndex >= 40) {
      stepNumber = 3;
      stepName = 'Избор и самоконтрол';
      stepSubtitle = 'Инхибиторен контрол';
      stepDescription = 'Устройството се оставя в другата стая, но след минути се появява импулс да се вземе без причина. Дискомфортът офлайн е реален, но вече има осъзнат избор. Всяка минута, в която се издържа без да се посегне към екрана, изгражда способността за пауза.';
      stepAction = 'Тази степен често е най-трудна за преминаване, но и най-важна. Ако се изтрае тук, следващите стъпки са по-лесни.';
    } else if (dependencyIndex >= 20) {
      stepNumber = 4;
      stepName = 'Дълбоко внимание';
      stepSubtitle = 'Възстановяване на фокус';
      stepDescription = 'Вече е възможно четене по 20 минути без посягане към телефона. Скуката не напряга — понякога дори е приятна. Появяват се собствени мисли, не само ехо от гледаното онлайн. Технологиите са налице, но изборът кога и как се използват е съзнателен.';
      stepAction = 'Възстановеното внимание е ценен ресурс. Пази се — лесно се губи, ако престане да се поддържа.';
    } else {
      stepNumber = 5;
      stepName = 'Дигитален суверенитет';
      stepSubtitle = 'Когнитивна свобода';
      stepDescription = 'Телефонът е инструмент, а не продължение на ръката. Приложенията се отварят с конкретна цел и се затварят, когато свършат. Известията не се проверяват по навик. Човек може да бъде сам, без дискомфорт, и да присъства в реалния живот.';
      stepAction = 'Суверенитетът не се постига веднъж. Той е навик, поддържан всеки ден.';
    }

    const profileName = PROFILE_NAMES[stepNumber] ?? 'Устойчив дигитален баланс';

    // ─── Кое заслужава внимание ──────────────────────────────
    let dominantWeaknessLabel = '';
    const maxNorm = Math.max(pciNorm, eeiNorm, criNorm, asiNorm);
    if (pciNorm === maxNorm && pciNorm > 50) {
      dominantWeaknessLabel = 'Автоматичните реакции са по-изразени — посяга се към телефона без съзнателно решение. Малки промени в средата помагат повече от силата на волята.';
    } else if (eeiNorm === maxNorm && eeiNorm > 50) {
      dominantWeaknessLabel = 'Дигиталната умора е по-забележима — скролването изтощава, но трудно спира. Нужна е пауза, а не повече самодисциплина.';
    } else if (criNorm === maxNorm && criNorm > 50) {
      dominantWeaknessLabel = 'Има място за по-стабилни офлайн навици — моменти в деня, в които съзнателно си изключен. Те са основата на всичко останало.';
    } else if (asiNorm > 50) {
      dominantWeaknessLabel = 'Има място за по-ясно разграничаване на собствените мисли от това, което алгоритъмът показва. Нужна е тишина — буквална, не метафорична.';
    } else {
      dominantWeaknessLabel = 'Няма един доминиращ момент за внимание — профилът е относително балансиран. Работи се върху всичко равномерно.';
    }

    // ─── Офлайн време ─────────────────────
    const criProtectiveNorm = Math.round((criRaw / 28) * 100);
    let resilienceLevel = '';
    if (criProtectiveNorm >= 70) {
      resilienceLevel = 'Има изградени моменти в деня, в които умишлено се изключва. Това е рядко и ценно — пазете го.';
    } else if (criProtectiveNorm >= 40) {
      resilienceLevel = 'Понякога се успява да бъдете офлайн, но не е навик. Малко повече структура тук ще промени много.';
    } else {
      resilienceLevel = 'Почти няма моменти без екран. Дори 20 минути на ден без телефон ще покажат разлика.';
    }

    // ─── Radar data ────────────────────────────────────────
    const radarData = {
      pci: { value: pciRaw, max: 42, percentage: pciNorm, label: 'Автоматична реактивност', short: 'АР' },
      eei: { value: eeiRaw, max: 42, percentage: eeiNorm, label: 'Дигитална умора', short: 'ДУ' },
      cri: { value: criRaw, max: 28, percentage: criProtectiveNorm, label: 'Критична устойчивост', short: 'КУ' },
      asi: { value: asiRaw, max: 32, percentage: asiNorm, label: 'Дигитална самостоятелност', short: 'ДС' },
    };

    // ─── Запазване в базата ─────────────────────────────────────
    const { data, error } = await supabaseClient
      .from('tavora_shield_results')
      .insert({
        answers,
        pci_score: pciRaw,
        eei_score: eeiRaw,
        cri_score: criRaw,
        asi_score: asiRaw,
        total_score: dependencyIndex,
        domination_score: Math.round(pciNorm * 0.25 + eeiNorm * 0.25 + asiNorm * 0.15 + p5Norm * 0.15),
        resilience_score: Math.round(criProtectiveNorm),
        classification: `Степен ${stepNumber}: ${stepName}`,
        classification_details: {
          step_number: stepNumber,
          step_name: stepName,
          step_subtitle: stepSubtitle,
          step_description: stepDescription,
          step_action: stepAction,
          profile_name: profileName,
          dominant_weakness_label: dominantWeaknessLabel,
          resilience_level: resilienceLevel,
          dependency_index: dependencyIndex,
          pci_norm: pciNorm,
          eei_norm: eeiNorm,
          cri_norm: criNorm,
          asi_norm: asiNorm,
          p5_norm: p5Norm,
        },
        radar_data: radarData,
        user_agent: req.headers.get('user-agent'),
        ip_address: req.headers.get('x-forwarded-for'),
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({
        success: true,
        result: {
          id: data.id,
          dependencyIndex,
          profileName,
          stepNumber,
          stepName,
          stepSubtitle,
          stepDescription,
          stepAction,
          dominantWeaknessLabel,
          resilienceLevel,
          radarData,
          pciNorm,
          eeiNorm,
          criNorm: criProtectiveNorm,
          asiNorm,
          p5Norm,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
