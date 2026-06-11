import type { GameSessionSummary } from '../../types/game'
import type { SaveData } from '../../types/save'

type TitleRule = {
  id: string
  label: string
  canEarn: (summary: GameSessionSummary, save: SaveData) => boolean
}

export const titleRules: TitleRule[] = [
  {
    id: 'first-step',
    label: 'はじめのいっぽ',
    canEarn: (summary) => summary.totalQuestions > 0,
  },
  {
    id: 'no-miss-10',
    label: 'れんぞくせいかい',
    canEarn: (summary) => summary.totalQuestions >= 10 && summary.accuracy === 100,
  },
  {
    id: 'speed-beginner',
    label: 'かけざんビギナー',
    canEarn: (summary) =>
      summary.totalQuestions >= 5 &&
      summary.accuracy >= 80 &&
      summary.averageResponseTimeMs <= 5000,
  },
  {
    id: 'kuku-fighter',
    label: 'くくファイター',
    canEarn: (summary) =>
      summary.totalQuestions >= 8 &&
      summary.accuracy >= 80 &&
      summary.averageResponseTimeMs <= 4000,
  },
  {
    id: 'combo-5',
    label: 'ごれんぞくスター',
    canEarn: (summary) => summary.maxCombo >= 5,
  },
]

export function judgeNewTitles(
  summary: GameSessionSummary,
  save: SaveData,
): string[] {
  const owned = new Set(save.player?.titles ?? [])
  return titleRules
    .filter((rule) => !owned.has(rule.label) && rule.canEarn(summary, save))
    .map((rule) => rule.label)
}
