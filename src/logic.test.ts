import { describe, expect, it } from 'vitest'
import { allWords, wordImageMap } from './data'
import { calculateScore, createReviewPlan, createSessionSummary, getNextReviewQuestions, markWordReviewed, statusFor, updateMastery } from './logic'
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
})
