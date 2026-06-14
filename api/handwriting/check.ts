type HandwritingCheckRequest = { targetChar?: string; imageBase64?: string }
type GeminiResult = { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>; error?: { message?: string } }

const parseImage = (dataUrl: string) => {
  const match = dataUrl.match(/^data:(image\/[\w.+-]+);base64,(.+)$/)
  if (!match) throw new Error('书写图片格式无效')
  return { mimeType: match[1], data: match[2] }
}

export default async function handler(request: Request) {
  if (request.method !== 'POST') return Response.json({ error: '仅支持 POST' }, { status: 405 })
  const { targetChar, imageBase64 } = await request.json() as HandwritingCheckRequest
  if (!targetChar || !imageBase64) return Response.json({ error: '缺少目标字或书写图片' }, { status: 400 })
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return Response.json({ similarity: 0, isCorrect: false, feedback: '尚未接入识别模型' }, { status: 503 })

  try {
    const image = parseImage(imageBase64)
    const model = process.env.GEMINI_MODEL ?? 'gemini-2.5-flash-lite'
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [
          { inlineData: image },
          { text: `你是儿童中文书写识别评估助手。目标汉字是「${targetChar}」。判断图片中的手写字与目标字相似度。轻微歪斜或大小不均不要过度扣分，明显不同的字要低分。请使用繁体中文反馈。` },
        ] }],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: { type: 'OBJECT', properties: { recognizedChar: { type: 'STRING' }, similarity: { type: 'NUMBER' }, feedback: { type: 'STRING' } }, required: ['similarity','feedback'] },
        },
      }),
    })
    const payload = await response.json() as GeminiResult
    if (!response.ok) throw new Error(payload.error?.message ?? `模型请求失败 (${response.status})`)
    const parsed = JSON.parse(payload.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}') as { recognizedChar?: string; similarity?: number; feedback?: string }
    const similarity = Math.max(0, Math.min(100, Number(parsed.similarity) || 0))
    return Response.json({ recognizedChar: parsed.recognizedChar, similarity, isCorrect: similarity >= 80, feedback: parsed.feedback ?? (similarity >= 80 ? '寫得很好！' : '再試一次！') })
  } catch {
    return Response.json({ similarity: 0, isCorrect: false, feedback: '圖像識別暫時不可用，請稍後再試。' }, { status: 502 })
  }
}
