import { divisionAreas, type DivisionAreaId } from './planets'
import type { RewardOrigin } from '../types/rewardOrigin'

export type DivisionMonsterDefinition = {
  id: string
  no: number
  areaId: DivisionAreaId
  areaNo: number
  variant: 1 | 2 | 3 | 4
  name: string
  description: string
  threshold: number
  motif: 'equal' | 'remainder' | 'large'
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

const thresholds = [5, 10, 15, 20] as const

const areaSeeds: Array<{
  areaId: DivisionAreaId
  baseName: string
  descriptions: [string, string, string, string]
  motif: DivisionMonsterDefinition['motif']
  colors: DivisionMonsterDefinition['colors']
}> = [
  {
    areaId: 'divide-no-remainder',
    baseName: 'わりっこ',
    descriptions: [
      'きれいに分けるわりざんのなかま',
      '同じ数ずつ配るのがとくいななかま',
      '九九のぎゃくを見つけるなかま',
      'あまりなしのわりざんを守るなかま',
    ],
    motif: 'equal',
    colors: {
      base: '#8fb7ff',
      outline: '#1b2f70',
      shadow: '#586fd4',
      highlight: '#dce8ff',
      glow: '#bdd2ff',
      accent: '#f3f0ff',
    },
  },
  {
    areaId: 'divide-with-remainder',
    baseName: 'あまりん',
    descriptions: [
      'ひとつはみ出たあまりを見つけるなかま',
      '商とあまりをセットで考えるなかま',
      'あまりがわる数より小さいか見はるなかま',
      '山場のあまりわりざんをこえるなかま',
    ],
    motif: 'remainder',
    colors: {
      base: '#a979ff',
      outline: '#33175f',
      shadow: '#6d4bd1',
      highlight: '#eadcff',
      glow: '#ccb2ff',
      accent: '#9ff3ff',
    },
  },
  {
    areaId: 'divide-large',
    baseName: 'おおわり',
    descriptions: [
      '大きい数をいくつかのグループに分けるなかま',
      '2けたのわりざんを落ち着いて見通すなかま',
      '大きな数でも商とあまりを整えるなかま',
      'わりざんのネビュラを堂々と進むなかま',
    ],
    motif: 'large',
    colors: {
      base: '#7868e6',
      outline: '#21164d',
      shadow: '#4e43a8',
      highlight: '#d9d2ff',
      glow: '#b5aaff',
      accent: '#ffd166',
    },
  },
]

export const divisionMonsterDefinitions: DivisionMonsterDefinition[] = areaSeeds.flatMap(
  (seed, areaIndex) =>
    thresholds.map((threshold, variantIndex) => ({
      id: `${seed.areaId}-monster-${variantIndex + 1}`,
      no: areaIndex * 4 + variantIndex + 1,
      areaId: seed.areaId,
      areaNo: areaIndex + 1,
      variant: (variantIndex + 1) as 1 | 2 | 3 | 4,
      name: `${seed.baseName}${variantIndex + 1}`,
      description: seed.descriptions[variantIndex],
      threshold,
      motif: seed.motif,
      colors: seed.colors,
      origin: 'divide',
    })),
)

export function divisionAreaCorrectKey(areaId: DivisionAreaId): string {
  return `division:${areaId}`
}

export function divisionCorrectForArea(
  categoryCorrect: Record<string, number>,
  areaId: DivisionAreaId,
): number {
  return categoryCorrect[divisionAreaCorrectKey(areaId)] ?? 0
}

export function isDivisionMonsterOwned(
  categoryCorrect: Record<string, number>,
  monster: DivisionMonsterDefinition,
): boolean {
  return divisionCorrectForArea(categoryCorrect, monster.areaId) >= monster.threshold
}

export function divisionAreaLabel(areaId: DivisionAreaId): string {
  return divisionAreas.find((area) => area.id === areaId)?.name ?? areaId
}

export function getDivisionMonsterById(
  id: string | null | undefined,
): DivisionMonsterDefinition | undefined {
  if (!id) {
    return undefined
  }
  return divisionMonsterDefinitions.find((monster) => monster.id === id)
}
