import { describe,expect,it } from 'vitest'
import { chooseMandarinVoice } from './mandarinSpeech'

const voice=(lang:string,name:string)=>({lang,name} as SpeechSynthesisVoice)

describe('Mandarin speech selection',()=>{
  it('prefers mainland Mandarin instead of Cantonese',()=>{
    expect(chooseMandarinVoice([
      voice('zh-HK','Sin-Ji Cantonese'),
      voice('zh-CN','Ting-Ting Mandarin'),
    ])?.lang).toBe('zh-CN')
  })

  it('does not fall back to Cantonese when Mandarin is unavailable',()=>{
    expect(chooseMandarinVoice([voice('zh-HK','Cantonese')])).toBeNull()
  })
})
