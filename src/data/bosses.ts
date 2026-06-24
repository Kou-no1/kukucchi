import type { BossDifficultyId } from '../types/save'
import { defaultMinDifficultyByBossDifficulty } from './factDifficulty'
import type { AdditionAreaId } from './planets'

export type BossGroup = 'basic' | 'advanced' | 'addition'
export type BossAdvancedCategory = 'square' | 'pi' | 'development'

export const advancedBossCategoryLabels: Record<BossAdvancedCategory, string> = {
  square: 'へいほうすう',
  pi: 'えんしゅうりつ',
  development: 'はってん',
}

export type BossReward = {
  itemId?: string
  ufoId?: string
  effectId?: string
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
  additionAreaId?: AdditionAreaId
  advancedCategory?: BossAdvancedCategory
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
    timeLimitSeconds: 1.8,
    questionCount: 10,
    hp: 10,
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

const additionBossSeeds: Array<{
  id: string
  no: number
  areaId: AdditionAreaId
  label: string
  shortLabel: string
  emoji: string
  description: string
  normalTitle: string
  normalUfoId?: string
  normalEffectId?: string
  difficultyOverrides?: Partial<Record<BossDifficultyId, Partial<BossDifficulty>>>
}> = [
  {
    id: 'boss-add-within-9',
    no: 13,
    areaId: 'add-within-9',
    label: 'たすたすきんぐ',
    shortLabel: 'たすたす',
    emoji: '+1',
    description: '1〜9のたしざんをみまもる、やさしいぷらすのおうさま。',
    normalTitle: 'たしざんびぎなー',
    difficultyOverrides: {
      normal: { hp: 6, questionCount: 8 },
      hard: { hp: 8, questionCount: 10, timeLimitSeconds: 7 },
      fast: { hp: 10, questionCount: 12, timeLimitSeconds: 4 },
      gekimuzu: { hp: 9, questionCount: 10, timeLimitSeconds: 2.4 },
    },
  },
  {
    id: 'boss-add-within-10',
    no: 14,
    areaId: 'add-within-10',
    label: 'とーたすぷりんす',
    shortLabel: 'とーたす',
    emoji: '+10',
    description: '10までのまとまりをまるくまとめる、たしざんのおうじ。',
    normalTitle: 'とーたすちゃれんじゃー',
    difficultyOverrides: {
      hard: { timeLimitSeconds: 7 },
      fast: { timeLimitSeconds: 4 },
      gekimuzu: { timeLimitSeconds: 2.2 },
    },
  },
  {
    id: 'boss-add-carry-basic',
    no: 15,
    areaId: 'add-carry-basic',
    label: 'くりあがりますたー',
    shortLabel: 'くりあがり',
    emoji: '+↑',
    description: 'くりあがりのやまをこえる、つよめのたしざんぼす。',
    normalTitle: 'くりあがりふぁいたー',
    normalUfoId: 'boss-add-carry-basic-ufo',
    difficultyOverrides: {
      normal: { hp: 9, questionCount: 12 },
      hard: { hp: 11, questionCount: 14, timeLimitSeconds: 6 },
      fast: { hp: 13, questionCount: 16, timeLimitSeconds: 3 },
      gekimuzu: { hp: 12, questionCount: 12, timeLimitSeconds: 1.8 },
    },
  },
  {
    id: 'boss-add-two-digit-no-carry',
    no: 16,
    areaId: 'add-two-digit-no-carry',
    label: 'にけたばろん',
    shortLabel: 'にけた',
    emoji: '+2',
    description: 'じゅうのくらいといちのくらいをならべてたたかう、2けたのぼす。',
    normalTitle: 'にけたたしざんないと',
    normalEffectId: 'add-plus-burst',
    difficultyOverrides: {
      hard: { timeLimitSeconds: 8 },
      fast: { timeLimitSeconds: 5 },
      gekimuzu: { timeLimitSeconds: 3.4 },
    },
  },
  {
    id: 'boss-add-two-digit-carry',
    no: 17,
    areaId: 'add-two-digit-carry',
    label: 'くりくりえんぺらー',
    shortLabel: 'くりくり',
    emoji: '++',
    description: '2けたのくりあがりをおおきくおしあげるつよめのぼす。',
    normalTitle: '2けたくりあがりがーど',
    normalUfoId: 'boss-add-two-digit-carry-ufo',
    difficultyOverrides: {
      normal: { hp: 9, questionCount: 12 },
      hard: { hp: 11, questionCount: 14, timeLimitSeconds: 7 },
      fast: { hp: 13, questionCount: 16, timeLimitSeconds: 4 },
      gekimuzu: { hp: 12, questionCount: 12, timeLimitSeconds: 2.8 },
    },
  },
  {
    id: 'boss-add-three-digit',
    no: 18,
    areaId: 'add-three-digit',
    label: 'おおたすじぇねらる',
    shortLabel: 'おおたす',
    emoji: '+3',
    description: '3けたのおおきなかずをどっしりうけとめる、たしざんさいきょうぼす。',
    normalTitle: 'おおきいかずこまんだー',
    normalUfoId: 'boss-add-three-digit-ufo',
    difficultyOverrides: {
      normal: { hp: 10, questionCount: 12 },
      hard: { hp: 12, questionCount: 14, timeLimitSeconds: 8 },
      fast: { hp: 14, questionCount: 16, timeLimitSeconds: 5 },
      gekimuzu: { hp: 12, questionCount: 12, timeLimitSeconds: 3.2 },
    },
  },
]

function createAdditionRewards(seed: (typeof additionBossSeeds)[number]): Record<BossDifficultyId, BossReward> {
  return {
    normal: {
      ufoId: seed.normalUfoId,
      effectId: seed.normalEffectId,
      title: seed.normalTitle,
    },
    hard: {
      title: `${seed.shortLabel}はーどすたー`,
    },
    fast: {
      title: `${seed.shortLabel}すぴーどすたー`,
    },
    gekimuzu: {
      title: `${seed.shortLabel}げきむずすたー`,
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
    label: 'クリスタルゴーレム',
    shortLabel: 'クリスタルゴーレム',
    emoji: '□',
    description: '平方数の星を守る結晶ゴーレム。',
    advancedCategory: 'square',
    difficultyOverrides: {
      hard: { timeLimitSeconds: 8 },
      fast: { timeLimitSeconds: 5 },
      gekimuzu: { timeLimitSeconds: 3.5, questionCount: 10, hp: 10 },
    },
    rewards: createRewards({ id: 'boss-square', shortLabel: 'クリスタルゴーレム' }),
  },
  {
    id: 'boss-pi',
    no: 11,
    group: 'advanced',
    label: 'リングプラネット',
    shortLabel: 'リングプラネット',
    emoji: 'π',
    description: '3.14計算を使いこなすと出会えるリング惑星。',
    advancedCategory: 'pi',
    difficultyOverrides: {
      hard: { timeLimitSeconds: 12 },
      fast: { timeLimitSeconds: 8 },
      gekimuzu: { timeLimitSeconds: 6, questionCount: 10, hp: 10 },
    },
    rewards: createRewards({ id: 'boss-pi', shortLabel: 'リングプラネット' }),
  },
  {
    id: 'boss-development',
    no: 12,
    group: 'advanced',
    label: 'にじいろキング',
    shortLabel: 'にじいろキング',
    emoji: '虹',
    description: 'ミックスと発展問題の力をあつめたにじいろボス。',
    advancedCategory: 'development',
    difficultyOverrides: {
      hard: { timeLimitSeconds: 8 },
      fast: { timeLimitSeconds: 5 },
      gekimuzu: { timeLimitSeconds: 1.8, questionCount: 10, hp: 10 },
    },
    rewards: createRewards({ id: 'boss-development', shortLabel: 'にじいろキング' }),
  },
  ...additionBossSeeds.map((seed) => ({
    id: seed.id,
    no: seed.no,
    group: 'addition' as const,
    label: seed.label,
    shortLabel: seed.shortLabel,
    emoji: seed.emoji,
    description: seed.description,
    additionAreaId: seed.areaId,
    difficultyOverrides: seed.difficultyOverrides,
    rewards: createAdditionRewards(seed),
  })),
]

const itemKinds: BossLimitedItem['kind'][] = ['wear', 'hat', 'furniture', 'background']

export const bossLimitedItems: BossLimitedItem[] = bosses
  .filter((boss) => boss.group !== 'addition')
  .flatMap((boss) =>
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

export const additionMasterTitle = 'たしざんますたー'
export const additionLegendTitle = 'たしざんれじぇんど'

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
