export const analysisVectorNames = [
  'Емоционален език', 'Внушение за спешност', 'Социален натиск',
  'Поляризиращ език', 'Подтик към бърза реакция',
] as const;
export interface LanguageVector { vector: string; score: number; maxScore: number; description: string; evidence: string[] }
export interface LanguageAnalysis {
  vectorAnalysis: LanguageVector[]; cognitiveReaction: string; recommendation: string;
  source: string; methodVersion: string; limitations: string;
}
function boundedText(value: unknown, maximum: number): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= maximum;
}

// Fail closed on incomplete or stale schemas. An absent category is not a zero.
export function checkedLanguageAnalysis(value: unknown, excerpt: string): LanguageAnalysis {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Непълен отговор от анализатора. Опитай отново.');
  const result = value as Record<string, unknown>;
  if (result.methodVersion !== 'language-signals-v3' || !boundedText(result.source, 100) ||
    !boundedText(result.cognitiveReaction, 1500) || !boundedText(result.recommendation, 800) ||
    !boundedText(result.limitations, 1000) || !Array.isArray(result.vectorAnalysis) || result.vectorAnalysis.length !== 5) {
    throw new Error('Отговорът от анализатора не може да бъде проверен. Опитай отново.');
  }
  const rows = result.vectorAnalysis as unknown[];
  const vectorAnalysis = analysisVectorNames.map(name => {
    const matching = rows.filter(row => row && typeof row === 'object' && (row as Record<string, unknown>).vector === name);
    if (matching.length !== 1) throw new Error('Непълен анализ на категориите. Опитай отново.');
    const row = matching[0] as Record<string, unknown>;
    if (!Number.isInteger(row.score) || Number(row.score) < 0 || Number(row.score) > 40 || row.maxScore !== 40 ||
      !boundedText(row.description, 800) || !Array.isArray(row.evidence) || row.evidence.length > 3 ||
      row.evidence.some(quote => !boundedText(quote, 500) || quote.length < 3 || !excerpt.includes(quote)) ||
      (Number(row.score) > 0 && row.evidence.length === 0) || (row.score === 0 && row.evidence.length > 0)) {
      throw new Error('Непроверим цитат или категория в анализа. Опитай отново.');
    }
    return { vector: name, score: Number(row.score), maxScore: 40, description: row.description, evidence: [...row.evidence] as string[] };
  });
  return { vectorAnalysis, cognitiveReaction: result.cognitiveReaction, recommendation: result.recommendation,
    source: result.source, methodVersion: result.methodVersion, limitations: result.limitations };
}

export function highlightedExcerpt(excerpt: string, quotes: string[]): { text: string; highlighted: boolean }[] {
  const intervals: { start: number; end: number }[] = [];
  for (const quote of new Set(quotes)) {
    if (quote.length < 3) continue;
    for (let start = excerpt.indexOf(quote); start !== -1; start = excerpt.indexOf(quote, start + quote.length)) intervals.push({ start, end: start + quote.length });
  }
  intervals.sort((a, b) => a.start - b.start || a.end - b.end);
  const merged: typeof intervals = [];
  for (const interval of intervals) {
    const previous = merged[merged.length - 1];
    if (previous && interval.start <= previous.end) previous.end = Math.max(previous.end, interval.end);
    else merged.push({ ...interval });
  }
  const chunks: { text: string; highlighted: boolean }[] = [];
  let position = 0;
  for (const interval of merged) {
    if (interval.start > position) chunks.push({ text: excerpt.slice(position, interval.start), highlighted: false });
    chunks.push({ text: excerpt.slice(interval.start, interval.end), highlighted: true });
    position = interval.end;
  }
  if (position < excerpt.length) chunks.push({ text: excerpt.slice(position), highlighted: false });
  return chunks;
}
