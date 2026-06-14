import localforage from 'localforage'
import { create } from 'zustand'
import { defaultRewards } from './data'
import { createReviewPlan, createSessionSummary, dayKey, markWordReviewed, updateMastery } from './logic'
import type { AnswerRecord, QuestionType, ReviewPlan, Reward, SessionMode, SessionSummary, StarHistory, StarWallet, WordItem, WordMastery } from './types'

type Store = {
  hydrated:boolean; records:AnswerRecord[]; sessions:SessionSummary[]; mastery:Record<string,WordMastery>
  wallet:StarWallet; starHistory:StarHistory[]; rewards:Reward[]; reviewPlan:ReviewPlan; parentAuthed:boolean; soundEnabled:boolean; showPlantWord:boolean
  hydrate:()=>Promise<void>
  answer:(item:WordItem,type:QuestionType,selected:string,seconds:number,sessionId:string,mode:SessionMode)=>AnswerRecord
  completeSession:(sessionId:string,mode:SessionMode,sessionRecords:AnswerRecord[])=>SessionSummary
  startNewReviewCycle:()=>void
  login:(password:string)=>boolean; logout:()=>void; redeem:(reward:Reward)=>boolean
  adjustStars:(amount:number,reason:string)=>void; setDailyLimit:(limit:number)=>void; setSound:(enabled:boolean)=>void
  setShowPlantWord:(enabled:boolean)=>void; addReward:(name:string,cost:number)=>void; toggleReward:(id:string)=>void; clearData:()=>Promise<void>
}
const initialWallet=():StarWallet=>({currentStars:0,todayEarned:0,dailyLimit:100,totalEarned:0,totalRedeemed:0,lastUpdated:new Date().toISOString()})
const storage=localforage.createInstance({name:'hatties-word-garden',storeName:'learning'})
const persist=(s:Store)=>storage.setItem('state',{records:s.records,sessions:s.sessions,mastery:s.mastery,wallet:s.wallet,starHistory:s.starHistory,rewards:s.rewards,reviewPlan:s.reviewPlan,soundEnabled:s.soundEnabled,showPlantWord:s.showPlantWord})
const id=()=>crypto.randomUUID()
const resetDay=(w:StarWallet):StarWallet=>w.lastUpdated.startsWith(dayKey())?w:{...w,todayEarned:0,lastUpdated:new Date().toISOString()}

export const useGardenStore=create<Store>((set,get)=>({
  hydrated:false,records:[],sessions:[],mastery:{},wallet:initialWallet(),starHistory:[],rewards:defaultRewards,reviewPlan:createReviewPlan(),
  parentAuthed:sessionStorage.getItem('hattie-parent')==='yes',soundEnabled:true,showPlantWord:false,
  hydrate:async()=>{try{const saved=await storage.getItem<Partial<Store>>('state');if(saved)set({...saved,records:(saved.records??[]).filter(r=>r.sessionId),sessions:saved.sessions??[],reviewPlan:saved.reviewPlan??createReviewPlan(),wallet:resetDay(saved.wallet??initialWallet()),hydrated:true});else set({hydrated:true})}catch{await storage.clear();set({hydrated:true})}},
  answer:(item,type,selected,seconds,sessionId,mode)=>{
    const state=get(), correct=selected===(type==='plant-category'?item.category:item.word), now=new Date().toISOString()
    const record:AnswerRecord={id:id(),word:item.word,questionType:type,correctAnswer:type==='plant-category'?item.category:item.word,selectedAnswer:selected,isCorrect:correct,firstTryCorrect:correct,timeSpent:seconds,date:now,sessionId,mode,category:item.category,confusedWith:correct?undefined:selected}
    const reviewPlan=mode==='review'?markWordReviewed(state.reviewPlan,item.word,correct,type,now):state.reviewPlan
    set({records:[...state.records,record],reviewPlan,mastery:{...state.mastery,[item.word]:{...updateMastery(state.mastery[item.word],correct,now),word:item.word}}});persist(get());return record
  },
  startNewReviewCycle:()=>{set({reviewPlan:createReviewPlan()});persist(get())},
  completeSession:(sessionId,mode,sessionRecords)=>{
    const state=get(); const summary=createSessionSummary(sessionId,mode,sessionRecords); const wallet=resetDay(state.wallet),score=summary.score,now=new Date().toISOString()
    set({sessions:[...state.sessions,summary],wallet:{...wallet,currentStars:wallet.currentStars+score,todayEarned:wallet.todayEarned+score,totalEarned:wallet.totalEarned+score,lastUpdated:now},starHistory:score?[...state.starHistory,{id:id(),type:'earned',amount:score,reason:summary.perfect?'全對完成獎勵':'完成練習得分',date:now}]:state.starHistory});persist(get());return summary
  },
  login:p=>{const ok=p==='1202';if(ok){sessionStorage.setItem('hattie-parent','yes');set({parentAuthed:true})}return ok},logout:()=>{sessionStorage.removeItem('hattie-parent');set({parentAuthed:false})},
  redeem:r=>{const s=get();if(s.wallet.currentStars<r.cost||!r.enabled)return false;const now=new Date().toISOString();set({wallet:{...s.wallet,currentStars:s.wallet.currentStars-r.cost,totalRedeemed:s.wallet.totalRedeemed+r.cost,lastUpdated:now},starHistory:[...s.starHistory,{id:id(),type:'redeemed',amount:-r.cost,reason:'兌換獎勵',rewardName:r.name,date:now}]});persist(get());return true},
  adjustStars:(amount,reason)=>{const s=get(),actual=Math.max(-s.wallet.currentStars,amount),now=new Date().toISOString();set({wallet:{...s.wallet,currentStars:s.wallet.currentStars+actual,totalEarned:s.wallet.totalEarned+Math.max(0,actual),lastUpdated:now},starHistory:[...s.starHistory,{id:id(),type:actual>=0?'manual-add':'manual-deduct',amount:actual,reason,date:now}]});persist(get())},
  setDailyLimit:n=>{set(s=>({wallet:{...s.wallet,dailyLimit:Math.max(20,n)}}));persist(get())},setSound:v=>{set({soundEnabled:v});persist(get())},setShowPlantWord:v=>{set({showPlantWord:v});persist(get())},
  addReward:(name,cost)=>{set(s=>({rewards:[...s.rewards,{id:id(),name,cost,type:'special',enabled:true}]}));persist(get())},toggleReward:rid=>{set(s=>({rewards:s.rewards.map(r=>r.id===rid?{...r,enabled:!r.enabled}:r)}));persist(get())},
  clearData:async()=>{await storage.clear();set({records:[],sessions:[],mastery:{},wallet:initialWallet(),starHistory:[],rewards:defaultRewards,reviewPlan:createReviewPlan()})},
}))
