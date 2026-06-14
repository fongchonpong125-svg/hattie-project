export type ChineseCategory='動物與動作'|'環保與生活'|'交通與規則'|'植物與食物'
export type ChineseWordItem={id:string;text:string;pinyin:string;category:ChineseCategory;image:string;audioText:string}
const words=(category:ChineseCategory,items:Array<[string,string,string]>)=>items.map(([id,text,pinyin])=>({id,text,pinyin,category,image:`/images/chinese/${id}.png`,audioText:text}))

export const chineseWords:ChineseWordItem[]=[
  ...words('動物與動作',[['niu','牛','niú'],['yang','羊','yáng'],['ma','馬','mǎ'],['laohu','老虎','lǎo hǔ'],['daxiang','大象','dà xiàng'],['shuimu','水母','shuǐ mǔ'],['haixing','海星','hǎi xīng'],['zhangyu','章魚','zhāng yú'],['huolieniao','火烈鳥','huǒ liè niǎo'],['ying','鷹','yīng'],['zhao','爪','zhǎo'],['ya','牙','yá'],['jiao','角','jiǎo'],['you','游','yóu'],['pao','跑','pǎo']]),
  ...words('環保與生活',[['aihu','愛護','ài hù'],['qingli','清理','qīng lǐ'],['wuran','污染','wū rǎn'],['paifang','排放','pái fàng'],['laji','垃圾','lā jī'],['gongyuan','公園','gōng yuán'],['shumu','樹木','shù mù'],['caodi','草地','cǎo dì'],['dian','電','diàn'],['zhi','紙','zhǐ'],['kai','開','kāi'],['guan','關','guān'],['keyi','可以','kě yǐ'],['bukeyi','不可以','bù kě yǐ'],['yiqi','一起','yì qǐ']]),
  ...words('交通與規則',[['jiaotonggongju','交通工具','jiāo tōng gōng jù'],['gongjiaoche','公交車','gōng jiāo chē'],['qiche','汽車','qì chē'],['saiche','賽車','sài chē'],['honglvdeng','紅綠燈','hóng lǜ dēng'],['xingren','行人','xíng rén'],['dengdai','等待','děng dài'],['feiji','飛機','fēi jī'],['zhishengji','直升機','zhí shēng jī'],['lunchuan','輪船','lún chuán'],['zuo','坐','zuò'],['zhan','站','zhàn'],['ting','停','tíng'],['paidui','排隊','pái duì'],['guize','規則','guī zé']]),
  ...words('植物與食物',[['gen','根','gēn'],['jing','莖','jīng'],['hua','花','huā'],['ye','葉','yè'],['nongtian','農田','nóng tián'],['shuiguo','水果','shuǐ guǒ'],['longyan','龍眼','lóng yǎn'],['mugua','木瓜','mù guā'],['qiyiguo','奇異果','qí yì guǒ'],['shucai','蔬菜','shū cài'],['tudou','土豆','tǔ dòu'],['shengcai','生菜','shēng cài'],['yumi','玉米','yù mǐ'],['xihuan','喜歡','xǐ huān'],['qie','切','qiē']]),
]

export type DictationCharItem={id:string;char:string;pinyin:string;audioText:string;type:'basic'|'number'}
const basic='牛母白牙爪火水角去公交大巴小手工天木山日月上下土中人地'.split('')
const numbers='一二三四五六七八九十'.split('')
export const chineseDictationChars:DictationCharItem[]=[...basic.map((char,index)=>({id:`basic-${index}`,char,pinyin:'',audioText:char,type:'basic' as const})),...numbers.map((char,index)=>({id:`number-${index}`,char,pinyin:'',audioText:char,type:'number' as const}))]
