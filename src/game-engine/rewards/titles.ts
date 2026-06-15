import type { GameSessionSummary } from '../../types/game'
import type { SaveData } from '../../types/save'
import { allGekimuzuTitle, bosses, legendaryBossTitle } from '../../data/bosses'

type TitleRule = {
  id: string
  label: string
  description: string
  canEarn: (summary: GameSessionSummary, save: SaveData) => boolean
}

export type TitleDefinition = {
  id: string
  label: string
  description: string
  method: string
}

export const titleRules: TitleRule[] = [
  {
    id: 'first-step',
    label: 'はじめのいっぽ',
    description: 'くくっちといっしょに学びはじめたしるし',
    canEarn: (summary) => summary.totalQuestions > 0,
  },
  {
    id: 'no-miss-10',
    label: 'れんぞくせいかい',
    description: '10もん以上をまちがえずにこたえたしるし',
    canEarn: (summary) => summary.totalQuestions >= 10 && summary.accuracy === 100,
  },
  {
    id: 'speed-beginner',
    label: 'かけざんビギナー',
    description: 'テンポよく正解できたしるし',
    canEarn: (summary) =>
      summary.totalQuestions >= 5 &&
      summary.accuracy >= 80 &&
      summary.averageResponseTimeMs <= 5000,
  },
  {
    id: 'kuku-fighter',
    label: 'くくファイター',
    description: 'すばやく正解をかさねたしるし',
    canEarn: (summary) =>
      summary.totalQuestions >= 8 &&
      summary.accuracy >= 80 &&
      summary.averageResponseTimeMs <= 4000,
  },
  {
    id: 'combo-5',
    label: 'ごれんぞくスター',
    description: '5れんぞく正解をきめたしるし',
    canEarn: (summary) => summary.maxCombo >= 5,
  },
]

function uniqueTitleDefinitions(definitions: TitleDefinition[]): TitleDefinition[] {
  const seen = new Set<string>()
  return definitions.filter((definition) => {
    if (seen.has(definition.id)) {
      return false
    }
    seen.add(definition.id)
    return true
  })
}

export function titleRecordId(title: string): string {
  return title
}

export function getTitleDefinitions(): TitleDefinition[] {
  const ruleDefinitions = titleRules.map((rule) => ({
    id: titleRecordId(rule.label),
    label: rule.label,
    description: rule.description,
    method: 'がくしゅうリザルト',
  }))
  const bossDefinitions = bosses.flatMap((boss) =>
    Object.values(boss.rewards).map((reward) => ({
      id: titleRecordId(reward.title),
      label: reward.title,
      description: `${boss.label}にいどんだしるし`,
      method: `${boss.label} ボスバトル`,
    })),
  )
  return uniqueTitleDefinitions([
    ...ruleDefinitions,
    ...bossDefinitions,
    {
      id: titleRecordId(legendaryBossTitle),
      label: legendaryBossTitle,
      description: 'すべてのボスをマスターしたしるし',
      method: '全ボスさいそく',
    },
    {
      id: titleRecordId(allGekimuzuTitle),
      label: allGekimuzuTitle,
      description: 'すべてのげきムズをこえたしるし',
      method: '全ボスげきムズ',
    },
  ])
}

export function judgeNewTitles(
  summary: GameSessionSummary,
  save: SaveData,
): string[] {
  const owned = new Set(save.player?.titles ?? [])
  return titleRules
    .filter((rule) => !owned.has(rule.label) && rule.canEarn(summary, save))
    .map((rule) => rule.label)
}
