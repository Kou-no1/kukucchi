import { additionAreas, type AdditionAreaId } from './planets'
import type { RewardOrigin } from '../types/rewardOrigin'

export type AdditionMonsterDefinition = {
  id: string
  no: number
  areaId: AdditionAreaId
  areaNo: number
  variant: 1 | 2 | 3
  name: string
  description: string
  threshold: number
  motif: 'plus' | 'arrow' | 'double' | 'burst' | 'large'
  colors: {
    base: string
    outline: string
    shadow: string
    highlight: string
    glow: string
    accent: string
  }
  origin: RewardOrigin
}

const thresholds = [5, 10, 20] as const

const areaSeeds: Array<{
  areaId: AdditionAreaId
  baseName: string
  descriptions: [string, string, string]
  motif: AdditionMonsterDefinition['motif']
  colors: AdditionMonsterDefinition['colors']
}> = [
  {
    areaId: 'add-within-9',
    baseName: 'たすくん',
    descriptions: [
      'ちいさな + をあつめる、たしざんの入門なかま',
      'やさしい数をぴょんぴょん足して進むなかま',
      '9までの答えをまもる丸いなかま',
    ],
    motif: 'plus',
    colors: {
      base: '#ffe98a',
      outline: '#6c5411',
      shadow: '#d7b942',
      highlight: '#fff7c7',
      glow: '#fef3a8',
      accent: '#58c97a',
    },
  },
  {
    areaId: 'add-within-10',
    baseName: 'とーたす',
    descriptions: [
      '10までの数をくるっとまとめるなかま',
      'まるい体で10のまとまりを運ぶなかま',
      'ぴったり10もこわくない水色のなかま',
    ],
    motif: 'plus',
    colors: {
      base: '#78d9ff',
      outline: '#16446a',
      shadow: '#36a8d6',
      highlight: '#d6fbff',
      glow: '#b8ecff',
      accent: '#f9d85d',
    },
  },
  {
    areaId: 'add-carry-basic',
    baseName: 'くりあがりん',
    descriptions: [
      '上向き矢印でくりあがりを知らせるなかま',
      '10をこえたら元気にジャンプするなかま',
      '山場のたしざんを一緒にこえるなかま',
    ],
    motif: 'arrow',
    colors: {
      base: '#ff9f54',
      outline: '#7a3412',
      shadow: '#d86b2f',
      highlight: '#ffd2a3',
      glow: '#ffd1a8',
      accent: '#fff06a',
    },
  },
  {
    areaId: 'add-two-digit-no-carry',
    baseName: 'にけたん',
    descriptions: [
      '十の位と一の位をならべて考えるなかま',
      '2段の体でけたを分けて足すなかま',
      'くりあがらない2けたを落ちついて解くなかま',
    ],
    motif: 'double',
    colors: {
      base: '#b79cff',
      outline: '#3e2675',
      shadow: '#7f61cf',
      highlight: '#eee7ff',
      glow: '#d6c9ff',
      accent: '#7de0ff',
    },
  },
  {
    areaId: 'add-two-digit-carry',
    baseName: 'くりくり',
    descriptions: [
      '大きな + で2けたのくりあがりを押し上げるなかま',
      '赤いひかりで十の位へ力を送るなかま',
      'むずかしい2けたを一緒にのりこえるなかま',
    ],
    motif: 'burst',
    colors: {
      base: '#ff77aa',
      outline: '#7a1e46',
      shadow: '#d94375',
      highlight: '#ffd7e8',
      glow: '#ffc1dc',
      accent: '#ffe76e',
    },
  },
  {
    areaId: 'add-three-digit',
    baseName: 'おおたす',
    descriptions: [
      '大きな数をどっしり受けとめる金色のなかま',
      '3けたどうしを堂々と足すなかま',
      'たしざんの星の大きなゴールを見守るなかま',
    ],
    motif: 'large',
    colors: {
      base: '#ffd35c',
      outline: '#725019',
      shadow: '#c98d2d',
      highlight: '#fff2b6',
      glow: '#ffe28d',
      accent: '#ff8f5f',
    },
  },
]

export const additionMonsterDefinitions: AdditionMonsterDefinition[] = areaSeeds.flatMap(
  (seed, areaIndex) =>
    thresholds.map((threshold, variantIndex) => ({
      id: `${seed.areaId}-monster-${variantIndex + 1}`,
      no: areaIndex * 3 + variantIndex + 1,
      areaId: seed.areaId,
      areaNo: areaIndex + 1,
      variant: (variantIndex + 1) as 1 | 2 | 3,
      name: `${seed.baseName}${variantIndex + 1}`,
      description: seed.descriptions[variantIndex],
      threshold,
      motif: seed.motif,
      colors: seed.colors,
      origin: 'add',
    })),
)

export function additionAreaCorrectKey(areaId: AdditionAreaId): string {
  return `addition:${areaId}`
}

export function additionCorrectForArea(
  categoryCorrect: Record<string, number>,
  areaId: AdditionAreaId,
): number {
  return categoryCorrect[additionAreaCorrectKey(areaId)] ?? 0
}

export function isAdditionMonsterOwned(
  categoryCorrect: Record<string, number>,
  monster: AdditionMonsterDefinition,
): boolean {
  return additionCorrectForArea(categoryCorrect, monster.areaId) >= monster.threshold
}

export function additionAreaLabel(areaId: AdditionAreaId): string {
  return additionAreas.find((area) => area.id === areaId)?.name ?? areaId
}

export function getAdditionMonsterById(
  id: string | null | undefined,
): AdditionMonsterDefinition | undefined {
  if (!id) {
    return undefined
  }
  return additionMonsterDefinitions.find((monster) => monster.id === id)
}
