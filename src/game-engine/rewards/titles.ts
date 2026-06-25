import type { GameSessionSummary } from '../../types/game'
import type { SaveData } from '../../types/save'
import {
  allGekimuzuTitle,
  additionLegendTitle,
  additionMasterTitle,
  bosses,
  legendaryBossTitle,
  subtractionLegendTitle,
  subtractionMasterTitle,
} from '../../data/bosses'
import { additionRocketDifficulties } from '../../data/additionRocket'
import { subtractionRocketDifficulties } from '../../data/subtractionRocket'
import type { RewardOrigin } from '../../types/rewardOrigin'

type TitleRule = {
  id: string
  label: string
  description: string
  origin?: RewardOrigin
  canEarn: (summary: GameSessionSummary, save: SaveData) => boolean
}

export type TitleDefinition = {
  id: string
  label: string
  description: string
  method: string
  origin?: RewardOrigin
}

export type TitleEmblemRarity = 'common' | 'rare' | 'epic' | 'legendary'

export type TitleEmblemFamily =
  | 'starter'
  | 'streak'
  | 'boss-basic'
  | 'boss-advanced'
  | 'boss-addition'
  | 'boss-subtraction'
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

function hasAdditionResult(summary: GameSessionSummary): boolean {
  return summary.results.some((result) => result.questionId.startsWith('add:'))
}

function hasSubtractionResult(summary: GameSessionSummary): boolean {
  return summary.results.some((result) => result.questionId.startsWith('sub:'))
}

function maxCorrectComboForAdditionArea(summary: GameSessionSummary, areaId: string): number {
  let combo = 0
  let maxCombo = 0
  for (const result of summary.results) {
    if (result.correct && result.questionId.startsWith(`add:${areaId}:`)) {
      combo += 1
      maxCombo = Math.max(maxCombo, combo)
    } else {
      combo = 0
    }
  }
  return maxCombo
}

function maxCorrectComboForSubtractionArea(summary: GameSessionSummary, areaId: string): number {
  let combo = 0
  let maxCombo = 0
  for (const result of summary.results) {
    if (result.correct && result.questionId.startsWith(`sub:${areaId}:`)) {
      combo += 1
      maxCombo = Math.max(maxCombo, combo)
    } else {
      combo = 0
    }
  }
  return maxCombo
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
  {
    id: 'addition-first-step',
    label: 'たしざんのたまご',
    description: 'たしざんのほしではじめてもんだいをといたしるし',
    origin: 'add',
    canEarn: (summary) => hasAdditionResult(summary),
  },
  {
    id: 'addition-carry-30-combo',
    label: 'くりあがりちょうじん',
    description: 'くりあがりのたしざんを30もんれんぞくでせいかいしたしるし',
    origin: 'add',
    canEarn: (summary) => maxCorrectComboForAdditionArea(summary, 'add-carry-basic') >= 30,
  },
  ...additionRocketDifficulties.map((difficulty) => ({
    id: `addition-rocket-${difficulty.id}`,
    label: difficulty.title,
    description: `${difficulty.label}のろけっとをくりあしたしるし`,
    origin: 'add' as const,
    canEarn: (summary: GameSessionSummary) =>
      summary.mode === 'rocket' &&
      summary.details?.planet === 'add' &&
      summary.details?.additionRocketDifficulty === difficulty.id &&
      summary.totalQuestions >= 14,
  })),
  {
    id: 'subtraction-first-step',
    label: 'ひきざんのたまご',
    description: 'ひきざんのほしではじめてもんだいをといたしるし',
    origin: 'sub',
    canEarn: (summary) => hasSubtractionResult(summary),
  },
  {
    id: 'subtraction-borrow-30-combo',
    label: 'くりさがりちょうじん',
    description: 'くりさがりのひきざんを30もんれんぞくでせいかいしたしるし',
    origin: 'sub',
    canEarn: (summary) => maxCorrectComboForSubtractionArea(summary, 'sub-borrow-basic') >= 30,
  },
  ...subtractionRocketDifficulties.map((difficulty) => ({
    id: `subtraction-rocket-${difficulty.id}`,
    label: difficulty.title,
    description: `${difficulty.label}のろけっとをくりあしたしるし`,
    origin: 'sub' as const,
    canEarn: (summary: GameSessionSummary) =>
      summary.mode === 'rocket' &&
      summary.details?.planet === 'subtract' &&
      summary.details?.subtractionRocketDifficulty === difficulty.id &&
      summary.totalQuestions >= 14,
  })),
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
    origin: rule.origin,
    method: 'がくしゅうリザルト',
  }))
  const bossDefinitions = bosses.flatMap((boss) =>
    Object.values(boss.rewards).map((reward) => ({
      id: titleRecordId(reward.title),
      label: reward.title,
      origin: boss.group === 'addition' ? ('add' as const) : boss.group === 'subtraction' ? ('sub' as const) : ('multiply' as const),
      description: `${boss.label}にいどんだしるし`,
      method:
        boss.group === 'addition' || boss.group === 'subtraction'
          ? `${boss.label} ぼすばとる`
          : `${boss.label} ボスバトル`,
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
    {
      id: titleRecordId(additionMasterTitle),
      label: additionMasterTitle,
      description: 'たしざんの6えりあぼすをすべてたおしたしるし',
      method: 'たしざんぜんえりあぼす',
      origin: 'add' as const,
    },
    {
      id: titleRecordId(additionLegendTitle),
      label: additionLegendTitle,
      description: 'たしざんの6えりあをげきむずでこえたしるし',
      method: 'たしざんぜんえりあげきむず',
      origin: 'add' as const,
    },
    {
      id: titleRecordId(subtractionMasterTitle),
      label: subtractionMasterTitle,
      description: 'ひきざんの6えりあぼすをすべてたおしたしるし',
      method: 'ひきざんぜんえりあぼす',
      origin: 'sub' as const,
    },
    {
      id: titleRecordId(subtractionLegendTitle),
      label: subtractionLegendTitle,
      description: 'ひきざんの6えりあをげきむずでこえたしるし',
      method: 'ひきざんぜんえりあげきむず',
      origin: 'sub' as const,
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

  if (title === additionMasterTitle || title === additionLegendTitle) {
    return {
      family: title === additionLegendTitle ? 'legendary' : 'master',
      rarity: title === additionLegendTitle ? 'legendary' : 'epic',
      motif: '+',
      primary: '#ffd35c',
      secondary: '#34d399',
      accent: title === additionLegendTitle ? '#ff7aa8' : '#ffffff',
    }
  }

  if (title === subtractionMasterTitle || title === subtractionLegendTitle) {
    return {
      family: title === subtractionLegendTitle ? 'legendary' : 'master',
      rarity: title === subtractionLegendTitle ? 'legendary' : 'epic',
      motif: '-',
      primary: '#ff9f5f',
      secondary: '#a8552a',
      accent: title === subtractionLegendTitle ? '#ffd166' : '#ffffff',
    }
  }

  const bossReward = bossRewardTitleMap.get(title)
  if (bossReward) {
    const isAdvanced = bossReward.bossGroup === 'advanced'
    const isAddition = bossReward.bossGroup === 'addition'
    const isSubtraction = bossReward.bossGroup === 'subtraction'
    const rarityByDifficulty: Record<string, TitleEmblemRarity> = {
      normal: 'common',
      hard: 'rare',
      fast: 'epic',
      gekimuzu: 'epic',
    }
    return {
      family: isAddition
        ? 'boss-addition'
        : isSubtraction
          ? 'boss-subtraction'
          : isAdvanced
            ? 'boss-advanced'
            : 'boss-basic',
      rarity: rarityByDifficulty[bossReward.difficultyId] ?? 'rare',
      motif: isAddition ? '+' : isSubtraction ? '-' : bossReward.difficultyId === 'gekimuzu' ? '★' : isAdvanced ? '◇' : '×',
      primary: isAddition ? '#ffd35c' : isSubtraction ? '#ff9f5f' : isAdvanced ? '#a78bfa' : '#5be9f4',
      secondary: isAddition ? '#34d399' : isSubtraction ? '#a8552a' : isAdvanced ? '#22d3ee' : '#4d75ff',
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
  if (rule?.origin === 'add') {
    return {
      family: 'streak',
      rarity: rule.id === 'addition-carry-30-combo' ? 'epic' : 'common',
      motif: '+',
      primary: '#ffd35c',
      secondary: '#16a34a',
      accent: '#ffffff',
    }
  }
  if (rule?.origin === 'sub') {
    return {
      family: 'streak',
      rarity: rule.id === 'subtraction-borrow-30-combo' ? 'epic' : 'common',
      motif: '-',
      primary: '#ff9f5f',
      secondary: '#a8552a',
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
