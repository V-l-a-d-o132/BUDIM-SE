import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  assessmentParts, assessmentQuestions, assessmentScales, assessmentAnswerLabel,
  validCurrentAssessmentAnswers, hasAssessmentAnswer, calculateSelfAssessment,
} from '../src/lib/self-assessment.ts';
import { demoApps, initialFocusSettings, visibleDemoBadge, appIsPaused } from '../src/pages/tavora-shield/components/focus/model.ts';

const answers = value => Object.fromEntries(assessmentQuestions.map(question => [question.id, value]));
test('all original 35 questions are preserved verbatim and in their original order', () => {
  const original = JSON.parse(readFileSync(new URL('./fixtures/original-assessment-questions.json', import.meta.url), 'utf8'));
  assert.deepEqual(assessmentQuestions.map(question => question.text), original);
  assert.equal(assessmentQuestions.length, 35); assert.equal(new Set(assessmentQuestions.map(question => question.id)).size, 35);
  assert.deepEqual(assessmentParts.map(part => part.questions.length), [7, 7, 7, 7, 7]);
});
test('unanswered is distinct from a deliberate zero or an inapplicable answer', () => {
  const question = assessmentQuestions[0];
  assert.equal(hasAssessmentAnswer({}, question), false);
  assert.equal(hasAssessmentAnswer({ [question.id]: 0 }, question), true);
  assert.equal(hasAssessmentAnswer({ [question.id]: null }, question), true);
  assert.equal(validCurrentAssessmentAnswers(answers(null)), true);
  assert.throws(() => calculateSelfAssessment({}));
});
test('each legitimate answer changes its own scale count without reversing or cross-scoring other themes', () => {
  const baseline = answers(0), base = calculateSelfAssessment(baseline);
  for (const [partIndex, part] of assessmentParts.entries()) for (const question of part.questions) {
    for (const option of assessmentScales[question.kind].options) {
      const result = calculateSelfAssessment({ ...baseline, [question.id]: option.value });
      assert.equal(result.answeredCount, 35);
      for (let other = 0; other < 5; other++) if (other !== partIndex) assert.deepEqual(result.parts[other], base.parts[other]);
      const group = result.parts[partIndex].groups.find(group => group.kind === question.kind);
      const previous = base.parts[partIndex].groups.find(group => group.kind === question.kind);
      for (const choice of group.choices) assert.equal(choice.count, previous.choices.find(row => row.value === choice.value).count + (choice.value === option.value ? 1 : 0) - (choice.value === 0 ? 1 : 0));
    }
  }
});
test('mixed scales remain separate and apparently conflicting first and fifth part answers coexist', () => {
  const input = { ...answers(0), '0-0': 4, '2-0': 4, '3-0': 4, '3-1': 0, '4-6': 4 };
  const result = calculateSelfAssessment(input);
  assert.equal(assessmentAnswerLabel(assessmentQuestions.find(q => q.id === '0-0'), input['0-0']), 'Почти винаги');
  assert.equal(assessmentAnswerLabel(assessmentQuestions.find(q => q.id === '4-6'), input['4-6']), 'Напълно');
  assert.deepEqual(result.parts[3].groups.map(group => group.kind), ['degree', 'event', 'frequency']);
  assert.deepEqual(result.parts[4].groups.map(group => group.kind), ['degree', 'intensity', 'frequency']);
  for (const key of ['dependencyIndex', 'stepNumber', 'risk', 'score', 'classification']) assert.equal(key in result, false);
});
test('all skipped and partially skipped inventories show missing information rather than a favorable zero', () => {
  const empty = calculateSelfAssessment(answers(null));
  assert.equal(empty.answeredCount, 0); assert.equal(empty.skippedCount, 35);
  for (const part of empty.parts) for (const group of part.groups) { assert.equal(group.answeredCount, 0); assert.ok(group.choices.every(choice => choice.count === 0)); }
  const partial = calculateSelfAssessment({ ...answers(null), '0-0': 4, '3-1': 1 });
  assert.equal(partial.answeredCount, 2); assert.equal(partial.skippedCount, 33);
  assert.equal(partial.parts[0].groups[0].choices.find(choice => choice.value === 4).count, 1);
  assert.equal(partial.parts[3].groups.find(group => group.kind === 'event').choices.find(choice => choice.value === 1).count, 1);
});
test('malformed, extra, missing, legacy weighted and non-numeric answers cannot be silently interpreted', () => {
  const valid = answers(0), missing = { ...valid }; delete missing['0-0'];
  for (const input of [null, [], {}, missing, { ...valid, extra: 0 }, { ...valid, '0-0': '0' }, { ...valid, '0-0': -1 }, { ...valid, '0-0': 0.5 }, { ...valid, '0-0': 6 }, { ...valid, '3-1': 4 }, { ...valid, '4-6': 8 }, { ...valid, '1-1': undefined }, { ...valid, '0-0': NaN }, { ...valid, '0-0': Infinity }]) {
    assert.equal(validCurrentAssessmentAnswers(input), false); assert.throws(() => calculateSelfAssessment(input));
  }
});
test('grayscale, notification quieting and application pausing are independent for every app', () => {
  for (let grayscale = 0; grayscale < 2; grayscale++) for (let quiet = 0; quiet < 2; quiet++) for (let pause = 0; pause < 2; pause++) {
    const settings = { grayscale: Boolean(grayscale), quietNotifications: Boolean(quiet), pauseSocial: Boolean(pause) };
    for (const app of demoApps) { assert.equal(visibleDemoBadge(app.id, settings), quiet ? 0 : app.badge); assert.equal(appIsPaused(app.id, settings), Boolean(pause) && app.social); }
  }
  assert.equal(demoApps.filter(app => app.social).length, 6);
  assert.deepEqual(initialFocusSettings, { grayscale: false, quietNotifications: false, pauseSocial: false });
});
