export type LearningLevel =
  | 'first'
  | 'practicing'
  | 'challenge'
  | 'advanced'

export type QuestionCategory =
  | 'multiplication-basic'
  | 'multiplication-square'
  | 'pi-multiplication'
  | 'two-digit-times-one-digit'
  | 'two-digit-times-two-digit'
  | 'divisors'
  | 'multiples'
  | 'prime'
  | 'gcd'
  | 'lcm'

export type AnswerMode = 'choice' | 'input'
export type GameMode =
  | 'learn'
  | 'speed'
  | 'review'
  | 'battle'
  | 'boss'
  | 'treasure'
  | 'rocket'
  | 'advanced'

export type Question = {
  id: string
  category: QuestionCategory
  prompt: string
  answer: number | string
  choices?: Array<number | string>
  explanation?: string
  difficulty: number
  metadata?: Record<string, unknown>
}

export type AnswerResult = {
  questionId: string
  prompt: string
  expectedAnswer: number | string
  givenAnswer: number | string
  correct: boolean
  responseTimeMs: number
  answeredAt: string
}

export type MultiplicationFactProgress = {
  id: string
  left: number
  right: number
  correctCount: number
  incorrectCount: number
  consecutiveCorrect: number
  averageResponseTimeMs: number
  bestResponseTimeMs: number | null
  lastAnsweredAt: string | null
  nextReviewAt: string | null
  masteryLevel: 0 | 1 | 2 | 3 | 4 | 5
  recentResults: AnswerResult[]
}

export type GameSessionSummary = {
  id: string
  mode: GameMode
  totalQuestions: number
  correctCount: number
  accuracy: number
  averageResponseTimeMs: number
  maxCombo: number
  score: number
  earnedCoins: number
  earnedExp: number
  newTitles: string[]
  bestUpdated: boolean
  weakFacts: MultiplicationFactProgress[]
  masteredFacts: MultiplicationFactProgress[]
  results: AnswerResult[]
  finishedAt: string
}

export type ScoreState = {
  score: number
  combo: number
  maxCombo: number
}

export type DailyMission = {
  id: string
  label: string
  kind: 'correct-count' | 'stage-practice' | 'combo' | 'speed-play'
  target: number
  progress: number
  completed: boolean
}
