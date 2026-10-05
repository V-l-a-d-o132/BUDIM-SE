export function validAssessmentAnswers(answers: unknown): answers is Record<string, number> {
  if (!answers || typeof answers !== 'object' || Array.isArray(answers)) return false;
  const values = answers as Record<string, unknown>;
  if (Object.keys(values).length !== 35) return false;
  for (let part = 0; part < 5; part++) {
    for (let question = 0; question < 7; question++) {
      const value = values[`${part}-${question}`];
      const allowed = part < 2 || (part === 3 && [2, 5].includes(question)) || (part === 4 && [2, 3, 4].includes(question))
        ? [0, 1, 2, 4, 6] : part < 4 ? [0, 1, 2, 3, 4]
        : [0, 6].includes(question) ? [0, 2, 4, 6, 8] : [0, 1, 3, 5, 7];
      if (typeof value !== 'number' || !allowed.includes(value)) return false;
    }
  }
  return true;
}
