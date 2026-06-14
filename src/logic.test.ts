import { describe, expect, it } from 'vitest'
import { allWords, wordImageMap } from './data'
import { calculateScore, createMissingFirstLetterQuestion, createMissingLetterLevels, createMissingLetterQuestions, createReviewPlan, createSessionSummary, getNextReviewQuestions, markWordReviewed, statusFor, updateMastery } from './logic'
import type { AnswerRecord } from './types'

describe('learning rules', () => {
  it('adds streak bonus on the third correct answer', () => {
    let mastery = updateMastery(undefined, true, '2026-06-14T00:00:00Z')
    mastery.word = 'potato'
    mastery = updateMastery(mastery, true, '2026-06-14T00:00:01Z')
    mastery = updateMastery(mastery, true, '2026-06-14T00:00:02Z')
    expect(mastery.masteryScore).toBe(94)
    expect(statusFor(mastery.masteryScore)).toBe('mastered')
  })

  it('awards 12 only for a perfect round and otherwise caps at 10', () => {
    expect(calculateScore(8, 8)).toBe(12)
    expect(calculateScore(7, 8)).toBe(7)
    expect(calculateScore(18, 20)).toBe(10)
  })

  it('summarizes first attempts and preserves wrong words', () => {
    const records = [
      { word: 'potato', firstTryCorrect: true, timeSpent: 2 },
      { word: 'tomato', firstTryCorrect: false, timeSpent: 4 },
    ] as AnswerRecord[]
    const summary = createSessionSummary('session-1', 'review', records)
    expect(summary.firstTryCorrectCount).toBe(1)
    expect(summary.wrongWords).toEqual(['tomato'])
    expect(summary.score).toBe(1)
    expect(summary.perfect).toBe(false)
  })

  it('maps every word to one independent png asset', () => {
    expect(allWords).toHaveLength(62)
    expect(new Set(allWords.map(word => word.image)).size).toBe(62)
    expect(allWords.every(word => wordImageMap[word.word]?.endsWith('.png'))).toBe(true)
  })

  it('creates a complete review plan and marks progress once per word', () => {
    const plan = createReviewPlan(allWords, 'cycle-1', '2026-06-14T00:00:00Z')
    expect(plan.totalWords).toBe(62)
    expect(plan.reviewedWords).toBe(0)
    const updated = markWordReviewed(plan, 'daisy', true, 'picture-to-word', '2026-06-14T01:00:00Z')
    const repeated = markWordReviewed(updated, 'daisy', false, 'picture-to-word', '2026-06-14T02:00:00Z')
    expect(repeated.reviewedWords).toBe(1)
    expect(repeated.items.find(item => item.word === 'daisy')?.wrongCountInCycle).toBe(1)
  })

  it('guarantees five unreviewed words in the next eight-question review while available', () => {
    let plan = createReviewPlan(allWords, 'cycle-1', '2026-06-14T00:00:00Z')
    for (const word of allWords.slice(0, 12)) plan = markWordReviewed(plan, word.word, true, 'picture-to-word')
    const records = [{ word: 'potato', firstTryCorrect: false, isCorrect: false, date: '2026-06-13T00:00:00Z' }] as AnswerRecord[]
    const questions = getNextReviewQuestions(plan, {}, records, 8)
    const unreviewed = new Set(plan.items.filter(item => !item.reviewedInCurrentCycle).map(item => item.word))
    expect(questions).toHaveLength(8)
    expect(questions.filter(question => unreviewed.has(question.item.word)).length).toBeGreaterThanOrEqual(5)
    expect(new Set(questions.map(question => question.item.word)).size).toBe(8)
  })

  it('creates a missing-first-letter question with three unique lowercase choices', () => {
    const ginger = allWords.find(word => word.word === 'ginger')!
    const question = createMissingFirstLetterQuestion(ginger, ['p', 'b'])
    expect(question.type).toBe('missing-first-letter')
    expect(question.missingWord).toBe('_inger')
    expect(question.correctAnswer).toBe('g')
    expect(question.letterOptions).toHaveLength(3)
    expect(new Set(question.letterOptions).size).toBe(3)
    expect(question.letterOptions).toContain('g')
    expect(question.letterOptions!.every(letter => letter === letter.toLowerCase())).toBe(true)
  })

  it('handles multi-word and hyphenated missing-first-letter prompts', () => {
    const questions = createMissingLetterQuestions(allWords, 62)
    expect(questions).toHaveLength(62)
    expect(questions.find(question => question.item.word === 'sweet potato')?.missingWord).toBe('_weet potato')
    expect(questions.find(question => question.item.word === 'bell pepper')?.missingWord).toBe('_ell pepper')
    expect(questions.find(question => question.item.word === 'x-ray')?.missingWord).toBe('_-ray')
    expect(new Set(questions.map(question => question.item.word)).size).toBe(62)
  })

  it('splits every missing-letter word into ordered eight-question levels without omissions', () => {
    const levels = createMissingLetterLevels(allWords, 8)
    expect(levels).toHaveLength(8)
    expect(levels.slice(0, 7).every(level => level.length === 8)).toBe(true)
    expect(levels.at(-1)).toHaveLength(6)
    const questions = levels.flat()
    expect(questions).toHaveLength(62)
    expect(new Set(questions.map(question => question.item.word)).size).toBe(62)
  })
})
