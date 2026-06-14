import { allWords } from './data'
import type { AnswerRecord, Question, QuestionType, ReviewPlan, SessionMode, SessionSummary, WordItem, WordMastery } from './types'

export const dayKey = (date = new Date()) => date.toISOString().slice(0, 10)
export const statusFor = (score: number): WordMastery['status'] => score >= 85 ? 'mastered' : score >= 60 ? 'review' : 'weak'

export function updateMastery(previous: WordMastery | undefined, correct: boolean, at: string): WordMastery {
  const base = previous ?? { word: '', correctCount: 0, wrongCount: 0, streak: 0, lastPracticedAt: at, masteryScore: 60, status: 'review' as const }
  const streak = correct ? base.streak + 1 : 0
  const bonus = correct && streak % 3 === 0 ? 10 : 0
  const masteryScore = Math.max(0, Math.min(100, base.masteryScore + (correct ? 8 : -12) + bonus))
  return { ...base, correctCount: base.correctCount + Number(correct), wrongCount: base.wrongCount + Number(!correct), streak, lastPracticedAt: at, masteryScore, status: statusFor(masteryScore) }
}

export const calculateScore = (firstTryCorrectCount:number,totalQuestions:number) => firstTryCorrectCount === totalQuestions ? 12 : Math.min(firstTryCorrectCount,10)
export function createSessionSummary(sessionId:string,mode:SessionMode,records:AnswerRecord[]):SessionSummary {
  const firstTryCorrectCount=records.filter(r=>r.firstTryCorrect).length
  const wrongWords=[...new Set(records.filter(r=>!r.firstTryCorrect).map(r=>r.word))]
  return {sessionId,mode,date:new Date().toISOString(),totalQuestions:records.length,firstTryCorrectCount,wrongCount:wrongWords.length,
    score:calculateScore(firstTryCorrectCount,records.length),perfect:firstTryCorrectCount===records.length,
    averageTimeSpent:records.length?records.reduce((a,r)=>a+r.timeSpent,0)/records.length:0,wrongWords}
}

const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - .5)

export function createReviewPlan(words:WordItem[]=allWords,cycleId:string=crypto.randomUUID(),startedAt=new Date().toISOString()):ReviewPlan {
  return {cycleId,startedAt,totalWords:words.length,reviewedWords:0,items:words.map(word=>({word:word.word,reviewedInCurrentCycle:false,wrongCountInCycle:0}))}
}
export function markWordReviewed(plan:ReviewPlan,word:string,firstTryCorrect:boolean,questionType:QuestionType,reviewedAt=new Date().toISOString()):ReviewPlan {
  const wasReviewed=plan.items.find(item=>item.word===word)?.reviewedInCurrentCycle??false
  const items=plan.items.map(item=>item.word===word?{...item,reviewedInCurrentCycle:true,reviewedAt,firstTryCorrect:wasReviewed?item.firstTryCorrect:firstTryCorrect,questionType,wrongCountInCycle:item.wrongCountInCycle+Number(!firstTryCorrect)}:item)
  const reviewedWords=plan.reviewedWords+Number(!wasReviewed)
  return {...plan,items,reviewedWords,completedAt:reviewedWords===plan.totalWords?(plan.completedAt??reviewedAt):undefined}
}
const toQuestions=(picked:WordItem[]):Question[]=>{
  const types: QuestionType[] = ['picture-to-word','word-to-picture','listen-to-picture']
  return picked.map((item, index) => {
    const others = shuffle(allWords.filter(w => w.word !== item.word && w.category === item.category)).slice(0,2)
    return { item, type: types[index % types.length], options: shuffle([item, ...others]) }
  })
}
export function getNextReviewQuestions(plan:ReviewPlan,mastery:Record<string,WordMastery>,records:AnswerRecord[],count=8):Question[] {
  const unreviewedWords=new Set(plan.items.filter(item=>!item.reviewedInCurrentCycle).map(item=>item.word))
  const unreviewed=allWords.filter(word=>unreviewedWords.has(word.word))
  const pools=[shuffle(unreviewed.filter(word=>word.category==='alphabet')),shuffle(unreviewed.filter(word=>word.category==='root')),shuffle(unreviewed.filter(word=>word.category==='above-ground'))]
  const balancedUnreviewed:WordItem[]=[]
  while(pools.some(pool=>pool.length))for(const pool of pools){const word=pool.shift();if(word)balancedUnreviewed.push(word)}
  const weak=allWords.filter(word=>mastery[word.word]?.status==='weak'||records.some(record=>record.word===word.word&&!record.firstTryCorrect))
  const confused=allWords.filter(word=>records.some(record=>record.word===word.word&&record.confusedWith))
  const old=allWords.filter(word=>!mastery[word.word]||Date.now()-new Date(mastery[word.word].lastPracticedAt).getTime()>7*86400000)
  const picked:WordItem[]=[]
  const add=(words:WordItem[],limit:number,randomize=true)=>{for(const word of randomize?shuffle(words):words){if(picked.length>=limit)break;if(!picked.some(item=>item.word===word.word))picked.push(word)}}
  add(balancedUnreviewed,Math.min(5,count),false); add(weak,Math.min(7,count)); add([...confused,...old],count); add(balancedUnreviewed,count,false); add(allWords,count)
  return toQuestions(picked.slice(0,count))
}
export function buildReviewQuestions(mastery:Record<string,WordMastery>,records:AnswerRecord[],count=8):Question[]{
  return getNextReviewQuestions(createReviewPlan(),mastery,records,count)
}

export function categoryAccuracy(records: AnswerRecord[], category: string) {
  const selected = records.filter(r => category === r.category || category === r.questionType)
  return selected.length ? Math.round(selected.filter(r => r.isCorrect).length / selected.length * 100) : 0
}
