import type {
  DailyMission,
  LearningLevel,
  MultiplicationFactProgress,
} from './game'

export type PlayerData = {
  nickname: string
  icon: string
  learningLevel: LearningLevel
  level: number
  exp: number
  coins: number
  titles: string[]
  currentTitle: string
  createdAt: string
  lastPlayedAt: string | null
}

export type SettingsData = {
  soundEnabled: boolean
  speechEnabled: boolean
  reduceMotion: boolean
}

export type BestRecord = {
  score: number
  averageResponseTimeMs: number
  accuracy: number
  achievedAt: string
}

export type GameHistoryEntry = {
  id: string
  mode: string
  correctCount: number
  totalQuestions: number
  averageResponseTimeMs: number
  score: number
  playedAt: string
}

export type BossDifficultyId = 'normal' | 'hard' | 'fast'

export type BossDifficultyProgress = {
  cleared: boolean
  clearCount: number
  firstClearedAt: string | null
  bestTimeMs: number | null
}

export type BossProgress = {
  bossId: string
  difficulties: Partial<Record<BossDifficultyId, BossDifficultyProgress>>
}

export type ProgressData = {
  facts: Record<string, MultiplicationFactProgress>
  history: GameHistoryEntry[]
  bests: Record<string, BestRecord>
  missions: DailyMission[]
  missionDate: string | null
  monsterBook: string[]
  categoryCorrect: Record<string, number>
  bossProgress: Record<string, BossProgress>
  bossItems: string[]
  ownedItems: string[]
  equippedItems: string[]
}

export type TutorialData = {
  homeSeen: boolean
  modeTipsSeen: string[]
}

export type SaveData = {
  version: number
  player: PlayerData | null
  progress: ProgressData
  settings: SettingsData
  tutorial: TutorialData
}

export type OnboardingInput = {
  nickname: string
  icon: string
  learningLevel: LearningLevel
  soundEnabled: boolean
}
