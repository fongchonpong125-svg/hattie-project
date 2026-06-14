import type { Reward, WordItem } from './types'

const rawAlphabet = [
  ['daisy','d','雛菊'],['dates','d','棗'],['desk','d','書桌'],['durian','d','榴槤'],
  ['nature','n','自然'],['noodles','n','麵條'],['notes','n','筆記'],['nuts','n','堅果'],
  ['wagon','w','小貨車'],['water','w','水'],['wind','w','風'],['woods','w','樹林'],
  ['hamster','h','倉鼠'],['hive','h','蜂巢'],['horn','h','角／喇叭'],['horse','h','馬'],
  ['igloo','i','冰屋'],['iguana','i','鬣蜥'],['inchworm','i','尺蠖'],['insect','i','昆蟲'],
  ['yak','y','犛牛'],['yard','y','院子'],['yarn','y','毛線'],['yoke','y','軛'],
  ['zebra','z','斑馬'],['zero','z','零'],['zipper','z','拉鍊'],['zoo','z','動物園'],
  ['quarter','q','四分之一／硬幣'],['queen','q','女王'],['question','q','問題'],['quilt','q','被子'],
  ['vacuum','v','吸塵器'],['van','v','廂型車'],['vase','v','花瓶'],['violin','v','小提琴'],
  ['xebec','x','三桅小帆船'],['xerox','x','影印'],['x-ray','x','X 光'],['xylophone','x','木琴'],
  ['jacket','j','夾克'],['jackstone','j','抓子遊戲石子'],['jug','j','水壺'],['junk','j','垃圾'],
  ['kazoo','k','卡祖笛'],['key','k','鑰匙'],['kitchen','k','廚房'],['kite','k','風箏'],
  ['umbrella','u','雨傘'],['umpire','u','裁判'],['under','u','在下面'],['underwear','u','內衣'],
] as const

export const wordImageMap: Record<string,string> = Object.fromEntries([
  ...rawAlphabet.map(([word]) => word), 'beetroot','sweet potato','onion','potato','ginger',
  'watercress','asparagus','cucumber','tomato','bell pepper',
].map(word => [word, `/images/words/${word.replaceAll(' ','-')}.png`]))

export const alphabetWords: WordItem[] = rawAlphabet.map(([word,letter,chinese]) => ({ word,letter,chinese,category:'alphabet',image:wordImageMap[word] }))
const plant = (word:string,chinese:string,category:'root'|'above-ground'):WordItem => ({word,chinese,category,image:wordImageMap[word]})
export const rootItems = [plant('beetroot','甜菜根','root'),plant('sweet potato','番薯／地瓜','root'),plant('onion','洋蔥','root'),plant('potato','馬鈴薯','root'),plant('ginger','薑','root')]
export const aboveGroundItems = [plant('watercress','西洋菜','above-ground'),plant('asparagus','蘆筍','above-ground'),plant('cucumber','青瓜／黃瓜','above-ground'),plant('tomato','番茄','above-ground'),plant('bell pepper','甜椒／彩椒','above-ground')]
export const allWords=[...alphabetWords,...rootItems,...aboveGroundItems]
export const plantWords=[...rootItems,...aboveGroundItems]
export const defaultRewards:Reward[]=[
  ['小餅乾 1 片',10,'snack'],['小糖果 1 粒',12,'snack'],['小果凍 1 個',15,'snack'],['小包海苔',15,'snack'],
  ['小果汁 1 盒',20,'snack'],['小蛋糕 1 小份',30,'snack'],['多看 10 分鐘動畫片',15,'activity'],
  ['選一個睡前故事',10,'activity'],['去公園玩一次',40,'activity'],['週末大獎勵',50,'special'],
].map(([name,cost,type],i)=>({id:`reward-${i}`,name:String(name),cost:Number(cost),type:type as Reward['type'],enabled:true}))
