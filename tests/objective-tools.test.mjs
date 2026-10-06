import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validatedContentAnalysis} from '../supabase/functions/_shared/content-analysis.ts';
import {assessmentResult} from '../supabase/functions/_shared/assessment-result.ts';
const keys=['emotional_pressure','urgency_suggestion','social_pressure','polarizing_language','auto_reaction_nudge'];
const text='Сподели веднага! Това е цитат, който трябва да проверим.';
const output=()=>({...Object.fromEntries(keys.map(key=>[key,{score:0,description:'Не е отчетен израз.',evidence:[]}])),overall_assessment:'Липсва контекст.',positive_notes:'',recommendation:'Провери източника.',detected_patterns:[]});
test('the language index is derived from disclosed vector scores, not a provider probability',()=>{
  const data=output();data.total_risk=100;data.urgency_suggestion={score:10,description:'Израз за спешност.',evidence:['веднага']};
  const result=validatedContentAnalysis(data,text);assert.equal(result.totalRisk,5);assert.deepEqual(result.vectorAnalysis[0].evidence,['веднага']);assert.match(result.auditExplanation,/Не е вероятност/);
});
test('positive language claims require exact evidence in the supplied excerpt',()=>{
  for(const evidence of [[],['всички го правят'],['Сподели незабавно!']]) {const data=output();data.social_pressure={score:10,description:'Пример.',evidence};assert.throws(()=>validatedContentAnalysis(data,text));}
});
test('malformed, out-of-range and missing model output cannot become a normal zero score',()=>{
  for(const score of [-1,41,0.5,'5',NaN,Infinity]) {const data=output();data.emotional_pressure.score=score;assert.throws(()=>validatedContentAnalysis(data,text));}
  for(const change of [{detected_patterns:'not an array'},{recommendation:{}},{overall_assessment:''},{positive_notes:500},{emotional_pressure:null}]) assert.throws(()=>validatedContentAnalysis({...output(),...change},text));
});
const base=()=>Object.fromEntries(Array.from({length:35},(_,i)=>[`${Math.floor(i/7)}-${i%7}`,0]));
function extreme(high) {
  const answers=base();
  for(let part=0;part<5;part++)for(let q=0;q<7;q++) {
    if(part<2)answers[`${part}-${q}`]=high?6:0;
    else if(part===2)answers[`${part}-${q}`]=high?0:4;
    else if(part===3)answers[`${part}-${q}`]=[1,4].includes(q)?(high?0:4):(high?([2,5].includes(q)?6:4):0);
    else answers[`${part}-${q}`]=q===6?(high?0:8):(high?([0].includes(q)?8:[1,5].includes(q)?7:6):0);
  }
  return answers;
}
test('all permitted self-report extremes reach 0 and 100 without reversing protective answers',()=>{
  const low=assessmentResult(extreme(false)),high=assessmentResult(extreme(true));
  assert.equal(low.dependencyIndex,0);assert.equal(low.stepNumber,5);assert.equal(low.criNorm,100);
  assert.equal(high.dependencyIndex,100);assert.equal(high.stepNumber,1);assert.equal(high.criNorm,0);
  assert.equal(low.radarData.asi.label,'Трудности с дигиталната самостоятелност');
});
test('every valid neutral answer stays in bounds and invalid self-reports have no classification',()=>{
  const result=assessmentResult(base());assert.ok(result.dependencyIndex>=0&&result.dependencyIndex<=100);assert.match(result.methodology,/без психометрична валидация/);
  assert.throws(()=>assessmentResult({}));assert.throws(()=>assessmentResult({...base(),'4-0':100}));
});
