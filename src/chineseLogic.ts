import type { ChineseWordItem } from './chineseData'

export type ChineseQuestionType='zh-picture-to-word'|'zh-word-to-picture'|'zh-listen-to-picture'
export type ChineseQuestion={item:ChineseWordItem;type:ChineseQuestionType;options:ChineseWordItem[]}
export type ChineseRecord={id:string;word:string;questionType:ChineseQuestionType|'zh-dictation';correctAnswer:string;selectedAnswer:string;isCorrect:boolean;firstTryCorrect:boolean;date:string;similarity?:number}
export type ChineseProgress={reviewedWordIds:string[];currentLevel:number;records:ChineseRecord[]}

const shuffle=<T,>(items:T[])=>[...items].sort(()=>Math.random()-.5)
export const createChineseLevels=(words:ChineseWordItem[],size=10)=>Array.from({length:Math.ceil(words.length/size)},(_,i)=>words.slice(i*size,(i+1)*size))
export const createChineseQuestions=(level:ChineseWordItem[],type:ChineseQuestionType,all:ChineseWordItem[]):ChineseQuestion[]=>level.map(item=>({item,type,options:shuffle([item,...shuffle(all.filter(word=>word.id!==item.id&&word.category===item.category)).slice(0,2)])}))
export const initialChineseProgress=():ChineseProgress=>({reviewedWordIds:[],currentLevel:0,records:[]})
