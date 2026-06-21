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

export type TitleEmblemRarity = 'common' | 'rare' | 'epic' | 'legendary'

export type TitleEmblemFamily =
  | 'starter'
  | 'streak'
  | 'boss-basic'
  | 'boss-advanced'
  | 'master'
  | 'legendary'

export type TitleEmblemDefinition = {
  family: TitleEmblemFamily
  rarity: TitleEmblemRarity
  motif: string
  primary: string
  secondary: string
  accent: string
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

const bossRewardTitleMap = new Map(
  bosses.flatMap((boss) =>
    Object.entries(boss.rewards).map(([difficultyId, reward]) => [
      reward.title,
      {
        bossGroup: boss.group,
        difficultyId,
      },
    ]),
  ),
)

export function getTitleEmblemDefinition(title: string | null | undefined): TitleEmblemDefinition {
  if (!title) {
    return {
      family: 'starter',
      rarity: 'common',
      motif: '?',
      primary: '#5b6f8e',
      secondary: '#1d314f',
      accent: '#dffcff',
    }
  }

  if (title === allGekimuzuTitle) {
    return {
      family: 'legendary',
      rarity: 'legendary',
      motif: '∞',
      primary: '#ffd86a',
      secondary: '#7c3aed',
      accent: '#68f4ff',
    }
  }

  if (title === legendaryBossTitle) {
    return {
      family: 'master',
      rarity: 'epic',
      motif: '王',
      primary: '#ffd86a',
      secondary: '#ff7ac8',
      accent: '#ffffff',
    }
  }

  const bossReward = bossRewardTitleMap.get(title)
  if (bossReward) {
    const isAdvanced = bossReward.bossGroup === 'advanced'
    const rarityByDifficulty: Record<string, TitleEmblemRarity> = {
      normal: 'common',
      hard: 'rare',
      fast: 'epic',
      gekimuzu: 'epic',
    }
    return {
      family: isAdvanced ? 'boss-advanced' : 'boss-basic',
      rarity: rarityByDifficulty[bossReward.difficultyId] ?? 'rare',
      motif: bossReward.difficultyId === 'gekimuzu' ? '★' : isAdvanced ? '◇' : '×',
      primary: isAdvanced ? '#a78bfa' : '#5be9f4',
      secondary: isAdvanced ? '#22d3ee' : '#4d75ff',
      accent: bossReward.difficultyId === 'normal' ? '#e8fbff' : '#ffd86a',
    }
  }

  const rule = titleRules.find((candidate) => candidate.label === title)
  if (rule?.id === 'first-step') {
    return {
      family: 'starter',
      rarity: 'common',
      motif: '✦',
      primary: '#5be9f4',
      secondary: '#1d4ed8',
      accent: '#ffffff',
    }
  }
  if (rule?.id === 'combo-5' || rule?.id === 'speed-beginner') {
    return {
      family: 'streak',
      rarity: 'rare',
      motif: '⚡',
      primary: '#7dd3fc',
      secondary: '#6366f1',
      accent: '#fff7a8',
    }
  }

  return {
    family: 'streak',
    rarity: 'rare',
    motif: '★',
    primary: '#34d399',
    secondary: '#0f766e',
    accent: '#ffffff',
  }
}
