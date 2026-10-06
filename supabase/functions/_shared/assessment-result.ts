import { validAssessmentAnswers } from './assessment-validation.ts';
export const ASSESSMENT_METHOD = 'self-report-v2';
export function assessmentResult(answers: Record<string,number>) {
  if (!validAssessmentAnswers(answers)) throw new Error('Invalid assessment');
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


  const stepNumber = dependencyIndex >= 80 ? 1 : dependencyIndex >= 60 ? 2 : dependencyIndex >= 40 ? 3 : dependencyIndex >= 20 ? 4 : 5;
  const profiles: Record<number,{profileName:string;stepName:string;stepDescription:string}> = {
    1:{profileName:'Често съобщавани автоматични навици',stepName:'Биологичният автоматизъм',stepDescription:'Отговорите ти дават висок сбор по избраните авторски показатели. Това е повод да разгледаш кои ситуации описват навик, умора или затруднение. Сборът не установява зависимост или състояние на нервната система.'},
    2:{profileName:'По-често съобщавани затруднения',stepName:'Алгоритмичният прицел',stepDescription:'В отговорите присъстват по-чести затруднения с някои дигитални навици. Избери конкретен отговор, който ти се струва полезно да обсъдиш или проследиш; категорията не определя личността ти.'},
    3:{profileName:'Смесена картина в отговорите',stepName:'Когнитивна свобода',stepDescription:'Сборът е в средния диапазон на тази авторска скала. Различни комбинации от отговори могат да дадат еднакъв индекс, затова прегледай отделните въпроси, вместо да приемаш обща оценка за себе си.'},
    4:{profileName:'По-рядко съобщавани затруднения',stepName:'Завръщане и реинтеграция',stepDescription:'По избраните въпроси съобщаваш по-рядко някои затруднения. Това не доказва възстановен фокус или устойчивост. Полезно е да сравниш отговорите с конкретни наблюдения от ежедневието.'},
    5:{profileName:'Рядко съобщавани автоматични навици',stepName:'Съзнателна свобода',stepDescription:'Отговорите дават нисък сбор по избраните показатели. Това не е сертификат за когнитивна свобода и не изключва други трудности, които въпросникът не разглежда.'},
  };
  const profile = profiles[stepNumber];
  const criProtectiveNorm = Math.round((criRaw / 28) * 100);
  const signals = [{value:pciNorm,label:'автоматични реакции'},{value:eeiNorm,label:'дигитална умора'},{value:criNorm,label:'по-рядко съобщавани офлайн навици'},{value:asiNorm,label:'затруднения с дигиталната самостоятелност'}].sort((a,b)=>b.value-a.value);
  return {
    dependencyIndex,stepNumber,...profile,stepSubtitle:'Ориентир в авторската рамка',
    stepAction:'Избери един отговор и наблюдавай съответната ситуация през следващите дни. Това е упражнение за размисъл, без обещан резултат.',
    dominantWeaknessLabel:signals[0].value>50?`Най-високият относителен сбор в отговорите е за ${signals[0].label}. Това не установява причина или диагноза.`:'Няма висок сбор по тези четири авторски показателя. Разгледай отделните отговори, ако някой от тях те тревожи.',
    resilienceLevel:`Отговорите за офлайн навици дават ${criRaw} от 28 точки. Това описва съобщената честота, без сравнение с други хора.`,
    radarData:{
      pci:{value:pciRaw,max:42,percentage:pciNorm,label:'Съобщена автоматична реактивност',short:'АР'},
      eei:{value:eeiRaw,max:42,percentage:eeiNorm,label:'Съобщена дигитална умора',short:'ДУ'},
      cri:{value:criRaw,max:28,percentage:criProtectiveNorm,label:'Съобщени офлайн навици',short:'ОН'},
      asi:{value:asiRaw,max:32,percentage:asiNorm,label:'Трудности с дигиталната самостоятелност',short:'ДС'},
    },pciNorm,eeiNorm,criNorm:criProtectiveNorm,asiNorm,p5Norm,methodVersion:ASSESSMENT_METHOD,
    methodology:'Индекс 0–100: 25% реактивност + 25% умора + 20% обърнат сбор за офлайн навици + 15% трудности със самостоятелност + 15% обща картина. Категории: 80–100, 60–79, 40–59, 20–39 и 0–19. Тежестите и границите са авторски избор без психометрична валидация.',
  };
}
