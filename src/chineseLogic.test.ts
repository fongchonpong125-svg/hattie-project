import { describe,expect,it } from 'vitest'
import { chineseWords } from './chineseData'
import { createChineseLevels,createChineseQuestions } from './chineseLogic'

describe('Chinese learning rules',()=>{
  it('contains 60 words in six stable ten-word levels without repeats',()=>{
    const levels=createChineseLevels(chineseWords)
    expect(levels).toHaveLength(6)
    expect(levels.every(level=>level.length===10)).toBe(true)
    expect(new Set(levels.flat().map(word=>word.id)).size).toBe(60)
  })

  it('creates three unique options with the correct word',()=>{
    const questions=createChineseQuestions(createChineseLevels(chineseWords)[0],'zh-picture-to-word',chineseWords)
    expect(questions).toHaveLength(10)
    expect(questions.every(question=>question.options.length===3)).toBe(true)
    expect(questions.every(question=>question.options.some(option=>option.id===question.item.id))).toBe(true)
    expect(questions.every(question=>new Set(question.options.map(option=>option.id)).size===3)).toBe(true)
  })
})
