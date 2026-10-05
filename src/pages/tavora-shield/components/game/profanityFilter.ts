// Profanity filter — Bulgarian + English bad words list
// This runs client-side BEFORE submission

const BAD_WORDS_BG = [
  'майка ти', 'майка му', 'майка й', 'майка ви',
  'путка', 'путки', 'путко',
  'курва', 'курви', 'курво',
  'педал', 'педали', 'педало',
  'педераст', 'педерасти',
  'копеле', 'копелета',
  'копеле',
  'мамка', 'мамка му', 'мамка ти',
  'ебаш', 'еба', 'ебал', 'ебала', 'ебали',
  'ебати', 'ебавам', 'ебавай',
  'пичка', 'пички',
  'гадняр', 'гадняри',
  'боклук', 'боклуци',
  'идиот', 'идиоти', 'идиотка',
  'кретен', 'кретени', 'кретенка',
  'дебил', 'дебили', 'дебилка',
  'тъпак', 'тъпаци', 'тъпачка',
  'тъпанар', 'тъпанари',
  'мутра', 'мутри',
  'простак', 'простаци',
  'простачка',
  'шибан', 'шибана', 'шибани',
  'шибаник',
  'задник', 'задници',
  'лайно', 'лайна',
  'говно', 'говна',
  'хуй', 'хуйове',
  'хуйня',
  'пиздец',
  'пизда',
  'ублюдок', 'ублюдоци',
  'мизерник', 'мизерници',
  'мизерница',
  'проститутка', 'проститутки',
  'шлейфа', 'шлейфи',
  'боза',
  'педо',
  'некрофил',
  'зоофил',
  'расист', 'расисти',
  'нацист', 'нацисти',
  'фашист', 'фашисти',
  'циганин', 'цигани',
  'евреин', 'евреи',
  'турчин', 'турци',
  'арабин', 'араби',
  'черен', 'черни',
  'маймуна', 'маймуни',
  'убий', 'убийте', 'убийство',
  'самоубийство', 'самоубий',
  'изнасили', 'изнасилване',
  'терорист', 'тероризъм',
  'бомба',
  'взривно',
  'наркотик', 'наркотици',
  'хероин', 'кокаин', 'метамфетамин',
];

const BAD_WORDS_EN = [
  'fuck', 'fucking', 'fucker', 'fucked', 'fucks',
  'shit', 'shits', 'shitting', 'shitty',
  'bitch', 'bitches', 'bitching',
  'asshole', 'assholes',
  'bastard', 'bastards',
  'cunt', 'cunts',
  'dick', 'dicks',
  'cock', 'cocks',
  'pussy', 'pussies',
  'whore', 'whores',
  'slut', 'sluts',
  'nigger', 'niggers', 'nigga',
  'faggot', 'faggots',
  'retard', 'retards',
  'idiot', 'idiots',
  'moron', 'morons',
  'kill yourself', 'kys',
  'rape', 'rapist',
  'pedophile', 'pedo',
  'nazi', 'nazis',
  'terrorist',
  'bomb',
  'heroin', 'cocaine', 'meth',
];

const ALL_BAD_WORDS = [...BAD_WORDS_BG, ...BAD_WORDS_EN];

export function containsProfanity(text: string): boolean {
  const lower = text.toLowerCase();
  return ALL_BAD_WORDS.some((word) => {
    // Check for word boundary match (simple approach)
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(^|[\\s,\\.!?;:'"()])${escaped}([\\s,\\.!?;:'"()]|$)`, 'i');
    return regex.test(lower) || lower.includes(word);
  });
}

export function censorText(text: string): string {
  let result = text;
  ALL_BAD_WORDS.forEach((word) => {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'gi');
    const censored = word[0] + '*'.repeat(Math.max(word.length - 2, 1)) + (word.length > 1 ? word[word.length - 1] : '');
    result = result.replace(regex, censored);
  });
  return result;
}

export function getProfanityMessage(): string {
  return 'Съдържанието съдържа неподходящи думи. Моля, изразявай се уважително — това е образователна платформа за деца и младежи.';
}
