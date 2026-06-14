import type { BossDifficultyId } from '../types/save'
import { defaultMinDifficultyByBossDifficulty } from './factDifficulty'

export type BossGroup = 'basic' | 'advanced'

export type BossReward = {
  itemId?: string
  ufoId?: string
  title: string
}

export type BossDifficulty = {
  id: BossDifficultyId
  label: string
  stars: 1 | 2 | 3 | 4
  timeLimitSeconds: number | null
  questionCount: number
  hp: number
  minDifficulty: number
}

export type BossDefinition = {
  id: string
  no: number
  group: BossGroup
  label: string
  shortLabel: string
  emoji: string
  description: string
  stages?: number[]
  advancedCategory?: 'square' | 'pi'
  difficultyOverrides?: Partial<Record<BossDifficultyId, Partial<BossDifficulty>>>
  rewards: Record<BossDifficultyId, BossReward>
}

export type BossLimitedItem = {
  id: string
  bossId: string
  difficulty: BossDifficultyId
  no: number
  name: string
  description: string
  kind: 'wear' | 'hat' | 'furniture' | 'background'
  tag: 'ボスげんてい'
}

export const bossDifficultyIds = ['normal', 'hard', 'fast', 'gekimuzu'] as const
export const bossItemDifficultyIds = ['normal', 'hard', 'fast'] as const

export const bossDifficulties: Record<BossDifficultyId, BossDifficulty> = {
  normal: {
    id: 'normal',
    label: 'ノーマル ★',
    stars: 1,
    timeLimitSeconds: null,
    questionCount: 10,
    hp: 7,
    minDifficulty: defaultMinDifficultyByBossDifficulty.normal,
  },
  hard: {
    id: 'hard',
    label: 'ハード ★★',
    stars: 2,
    timeLimitSeconds: 6,
    questionCount: 12,
    hp: 9,
    minDifficulty: defaultMinDifficultyByBossDifficulty.hard,
  },
  fast: {
    id: 'fast',
    label: 'さいそく ★★★',
    stars: 3,
    timeLimitSeconds: 3,
    questionCount: 15,
    hp: 11,
    minDifficulty: defaultMinDifficultyByBossDifficulty.fast,
  },
  gekimuzu: {
    id: 'gekimuzu',
    label: 'げきムズ 🛸★★★★',
    stars: 4,
    timeLimitSeconds: 2.5,
    questionCount: 18,
    hp: 14,
    minDifficulty: defaultMinDifficultyByBossDifficulty.gekimuzu,
  },
}

const basicBossSeeds = [
  { id: 'boss-stage-2', no: 1, label: '1・2のだんボス', shortLabel: '1・2のだん', stages: [1, 2], emoji: '🛡️' },
  { id: 'boss-stage-3', no: 2, label: '3のだんボス', shortLabel: '3のだん', stages: [3], emoji: '🌙' },
  { id: 'boss-stage-4', no: 3, label: '4のだんボス', shortLabel: '4のだん', stages: [4], emoji: '💫' },
  { id: 'boss-stage-5', no: 4, label: '5のだんボス', shortLabel: '5のだん', stages: [5], emoji: '⭐' },
  { id: 'boss-stage-6', no: 5, label: '6のだんボス', shortLabel: '6のだん', stages: [6], emoji: '🪐' },
  { id: 'boss-stage-7', no: 6, label: '7のだんボス', shortLabel: '7のだん', stages: [7], emoji: '☄️' },
  { id: 'boss-stage-8', no: 7, label: '8のだんボス', shortLabel: '8のだん', stages: [8], emoji: '🌌' },
  { id: 'boss-stage-9', no: 8, label: '9のだんボス', shortLabel: '9のだん', stages: [9], emoji: '🚀' },
]

function createRewards(seed: { id: string; shortLabel: string }): Record<BossDifficultyId, BossReward> {
  return {
    normal: {
      itemId: `${seed.id}-normal-item`,
      title: `${seed.shortLabel}ボスをたおした！`,
    },
    hard: {
      itemId: `${seed.id}-hard-item`,
      title: `${seed.shortLabel}ボスチャレンジャー`,
    },
    fast: {
      itemId: `${seed.id}-fast-item`,
      title: `${seed.shortLabel}ボスマスター`,
    },
    gekimuzu: {
      ufoId: `${seed.id}-ufo`,
      title: `${seed.shortLabel}の ちょうじん`,
    },
  }
}

export const bosses: BossDefinition[] = [
  ...basicBossSeeds.map((seed) => ({
    ...seed,
    group: 'basic' as const,
    description: `${seed.shortLabel}の力をためたボス。20もん正解で挑戦できます。`,
    rewards: createRewards(seed),
  })),
  {
    id: 'boss-all-kuku',
    no: 9,
    group: 'basic',
    label: '全九九ボス',
    shortLabel: '全九九',
    emoji: '👑',
    description: '段ボス8体をこえた先にいる、くくっち号の大ボス。',
    stages: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    rewards: createRewards({ id: 'boss-all-kuku', shortLabel: '全九九' }),
  },
  {
    id: 'boss-square',
    no: 10,
    group: 'advanced',
    label: '平方数ボス',
    shortLabel: '平方数',
    emoji: '□',
    description: '11×11から20×20までの星を守る高学年ボス。',
    advancedCategory: 'square',
    difficultyOverrides: {
      hard: { timeLimitSeconds: 8 },
      fast: { timeLimitSeconds: 5 },
      gekimuzu: { timeLimitSeconds: 3.5, questionCount: 15, hp: 12 },
    },
    rewards: createRewards({ id: 'boss-square', shortLabel: '平方数' }),
  },
  {
    id: 'boss-pi',
    no: 11,
    group: 'advanced',
    label: '円周率ボス',
    shortLabel: '3.14',
    emoji: 'π',
    description: '3.14計算を使いこなすと出会える高学年ボス。',
    advancedCategory: 'pi',
    difficultyOverrides: {
      hard: { timeLimitSeconds: 12 },
      fast: { timeLimitSeconds: 8 },
      gekimuzu: { timeLimitSeconds: 6, questionCount: 15, hp: 12 },
    },
    rewards: createRewards({ id: 'boss-pi', shortLabel: '3.14' }),
  },
]

const itemKinds: BossLimitedItem['kind'][] = ['wear', 'hat', 'furniture', 'background']

export const bossLimitedItems: BossLimitedItem[] = bosses.flatMap((boss) =>
  bossItemDifficultyIds.map((difficulty, difficultyIndex) => ({
    id: boss.rewards[difficulty].itemId ?? `${boss.id}-${difficulty}-item`,
    bossId: boss.id,
    difficulty,
    no: (boss.no - 1) * 3 + difficultyIndex + 1,
    name: `${boss.shortLabel} ${getBossDifficulty(boss, difficulty).label}トロフィー`,
    description: `${boss.label}を${getBossDifficulty(boss, difficulty).label}でクリアした証です。`,
    kind: itemKinds[(boss.no + difficultyIndex) % itemKinds.length],
    tag: 'ボスげんてい',
  })),
)

export const legendaryBossTitle = 'でんせつのくくチャンピオン'
export const allGekimuzuTitle = 'すべてをしるもの'

export function getBossDifficulty(
  boss: BossDefinition,
  difficultyId: BossDifficultyId,
): BossDifficulty {
  return {
    ...bossDifficulties[difficultyId],
    ...boss.difficultyOverrides?.[difficultyId],
    id: difficultyId,
  }
}

export function getBossById(bossId: string): BossDefinition | undefined {
  return bosses.find((boss) => boss.id === bossId)
}

export function getBossLimitedItem(itemId: string): BossLimitedItem | undefined {
  return bossLimitedItems.find((item) => item.id === itemId)
}
