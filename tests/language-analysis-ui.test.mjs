import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validatedContentAnalysis } from '../supabase/functions/_shared/content-analysis.ts';
import { checkedLanguageAnalysis, highlightedExcerpt } from '../src/lib/content-analysis-result.ts';
const excerpt = 'Сподели веднага! Това е учебен пример, а не инструкция.';
const keys = ['emotional_pressure','urgency_suggestion','social_pressure','polarizing_language','auto_reaction_nudge'];
const output = () => ({ ...Object.fromEntries(keys.map(key => [key, { score: 0, description: 'Не е отчетен израз.', evidence: [] }])), overall_assessment: 'Учебният контекст има значение.', positive_notes: '', recommendation: 'Прочети контекста.', detected_patterns: [] });
test('a checked zero is an explicit row and all five categories reach the current UI', () => {
  const raw = output(); raw.urgency_suggestion = { score: 10, description: 'Възможен сигнал за спешност.', evidence: ['веднага'] };
  const response = validatedContentAnalysis(raw, excerpt), result = checkedLanguageAnalysis(response, excerpt);
  assert.equal(response.methodVersion, 'language-signals-v3'); assert.equal(result.vectorAnalysis.length, 5);
  assert.equal(result.vectorAnalysis[1].score, 10); assert.deepEqual(result.vectorAnalysis[1].evidence, ['веднага']);
  assert.equal(result.vectorAnalysis[0].score, 0); assert.equal('totalRisk' in result, false);
});
test('missing, duplicate, stale and malformed response rows cannot appear as reassuring zero scores', () => {
  const good = validatedContentAnalysis(output(), excerpt);
  for (const bad of [null, {}, { ...good, methodVersion: 'language-signals-v2' }, { ...good, source: '' }, { ...good, vectorAnalysis: [] }, { ...good, vectorAnalysis: good.vectorAnalysis.slice(1) }, { ...good, vectorAnalysis: Array(5).fill(good.vectorAnalysis[0]) }, { ...good, vectorAnalysis: good.vectorAnalysis.map((row, index) => index ? row : { ...row, score: '0' }) }]) assert.throws(() => checkedLanguageAnalysis(bad, excerpt));
});
test('the server and frontend reject unsupported or contradictory evidence', () => {
  const raw = output(); raw.urgency_suggestion.evidence = ['веднага']; assert.throws(() => validatedContentAnalysis(raw, excerpt));
  const good = validatedContentAnalysis(output(), excerpt);
  for (const change of [{ score: 10, evidence: [] }, { score: 10, evidence: ['несъществуващ цитат'] }, { score: 0, evidence: ['веднага'] }, { score: 41, evidence: ['веднага'] }, { maxScore: 100 }]) assert.throws(() => checkedLanguageAnalysis({ ...good, vectorAnalysis: good.vectorAnalysis.map((row, index) => index ? row : { ...row, ...change }) }, excerpt));
});
test('highlighting merges overlapping exact quotes, preserves all original text and treats HTML as text', () => {
  const input = '<script>пример</script> Сподели веднага! веднага';
  const parts = highlightedExcerpt(input, ['Сподели веднага', 'веднага', 'Сподели веднага', '', 'неприсъства']);
  assert.equal(parts.map(part => part.text).join(''), input);
  assert.deepEqual(parts.filter(part => part.highlighted).map(part => part.text), ['Сподели веднага', 'веднага']);
  assert.deepEqual(highlightedExcerpt(input, []), [{ text: input, highlighted: false }]);
});
