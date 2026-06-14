export type QuestionType = 'picture-to-word' | 'word-to-picture' | 'listen-to-picture' | 'plant-category'
export type Category = 'root' | 'above-ground' | 'alphabet'
export type SessionMode = 'review' | 'plants' | 'wrong-redo'

export type WordItem = { word: string; chinese: string; category: Category; letter?: string; image: string }
export type Question = { item: WordItem; type: QuestionType; options: WordItem[] }

export type AnswerRecord = {
  id: string; word: string; questionType: QuestionType; correctAnswer: string; selectedAnswer: string
  isCorrect: boolean; firstTryCorrect: boolean; timeSpent: number; date: string
  sessionId: string; mode: SessionMode; category?: Category; confusedWith?: string
}

export type SessionSummary = {
  sessionId: string; mode: SessionMode; date: string; totalQuestions: number; firstTryCorrectCount: number
  wrongCount: number; score: number; perfect: boolean; averageTimeSpent: number; wrongWords: string[]
}
export type ReviewPlanItem = {
  word: string; reviewedInCurrentCycle: boolean; reviewedAt?: string; firstTryCorrect?: boolean
  wrongCountInCycle: number; questionType?: QuestionType
}
export type ReviewPlan = {
  cycleId: string; startedAt: string; completedAt?: string; totalWords: number; reviewedWords: number; items: ReviewPlanItem[]
}

export type WordMastery = {
  word: string; correctCount: number; wrongCount: number; streak: number; lastPracticedAt: string
  masteryScore: number; status: 'mastered' | 'review' | 'weak'
}
export type StarWallet = { currentStars: number; todayEarned: number; dailyLimit: number; totalEarned: number; totalRedeemed: number; lastUpdated: string }
export type StarHistory = { id: string; type: 'earned' | 'redeemed' | 'manual-add' | 'manual-deduct'; amount: number; reason: string; rewardName?: string; date: string }
export type Reward = { id: string; name: string; cost: number; type: 'snack' | 'activity' | 'special'; enabled: boolean }
