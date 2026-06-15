const mandarinLocales=['zh-CN','zh-Hans-CN','cmn-CN','cmn-Hans-CN']

export const chooseMandarinVoice=(voices:SpeechSynthesisVoice[])=>{
  const normalized=(value:string)=>value.toLowerCase().replaceAll('_','-')
  return voices.find(voice=>mandarinLocales.some(locale=>normalized(voice.lang)===normalized(locale)))
    ??voices.find(voice=>/mandarin|putonghua|普通话|國語|国语/i.test(`${voice.name} ${voice.lang}`))
    ??voices.find(voice=>normalized(voice.lang).startsWith('zh-cn'))
    ??null
}

export const speakMandarin=(text:string)=>{
  if(!('speechSynthesis'in window))return
  let spoken=false
  const speak=()=>{
    if(spoken)return
    spoken=true
    window.speechSynthesis.cancel()
    const utterance=new SpeechSynthesisUtterance(text)
    utterance.lang='zh-CN'
    utterance.rate=.68
    utterance.pitch=1
    utterance.voice=chooseMandarinVoice(window.speechSynthesis.getVoices())
    window.speechSynthesis.speak(utterance)
  }
  if(window.speechSynthesis.getVoices().length)speak()
  else{
    window.speechSynthesis.addEventListener('voiceschanged',speak,{once:true})
    window.setTimeout(speak,500)
  }
}
