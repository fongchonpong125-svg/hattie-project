import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

type GeminiResult = { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>; error?: { message?: string } }
const parseImage=(dataUrl:string)=>{const match=dataUrl.match(/^data:(image\/[\w.+-]+);base64,(.+)$/);if(!match)throw new Error('图片格式无效');return{mimeType:match[1],data:match[2]}}

const handwritingApi = (env: Record<string,string>): Plugin => ({
  name: 'handwriting-api',
  configureServer(server) {
    server.middlewares.use('/api/handwriting/check', async (request, response) => {
      response.setHeader('Content-Type','application/json')
      if (request.method !== 'POST') { response.statusCode=405;return response.end(JSON.stringify({error:'仅支持 POST'})) }
      const chunks:Buffer[]=[];for await(const chunk of request)chunks.push(Buffer.from(chunk))
      const {targetChar,imageBase64}=JSON.parse(Buffer.concat(chunks).toString())
      if(!targetChar||!imageBase64){response.statusCode=400;return response.end(JSON.stringify({error:'缺少目标字或书写图片'}))}
      try{
        const image=parseImage(imageBase64),model=env.GEMINI_MODEL||'gemini-2.5-flash-lite'
        const upstream=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
          contents:[{parts:[{inlineData:image},{text:`你是儿童中文书写识别评估助手。目标汉字是「${targetChar}」。判断图片中的手写字与目标字相似度。轻微歪斜或大小不均不要过度扣分，明显不同的字要低分。请使用繁体中文反馈。`}]}],
          generationConfig:{responseMimeType:'application/json',responseSchema:{type:'OBJECT',properties:{recognizedChar:{type:'STRING'},similarity:{type:'NUMBER'},feedback:{type:'STRING'}},required:['similarity','feedback']}},
        })})
        const payload=await upstream.json() as GeminiResult;if(!upstream.ok)throw new Error(payload.error?.message||`模型请求失败 (${upstream.status})`)
        const parsed=JSON.parse(payload.candidates?.[0]?.content?.parts?.[0]?.text||'{}') as {recognizedChar?:string;similarity?:number;feedback?:string}
        const similarity=Math.max(0,Math.min(100,Number(parsed.similarity)||0))
        response.end(JSON.stringify({recognizedChar:parsed.recognizedChar,similarity,isCorrect:similarity>=80,feedback:parsed.feedback||(similarity>=80?'寫得很好！':'再試一次！')}))
      }catch{response.statusCode=502;response.end(JSON.stringify({similarity:0,isCorrect:false,feedback:'圖像識別暫時不可用，請稍後再試。'}))}
    })
  },
})

export default defineConfig(({mode})=>{const env=loadEnv(mode,'.','');return{plugins:[react(),handwritingApi(env)],server:{host:true,allowedHosts:['.trycloudflare.com']}}})
