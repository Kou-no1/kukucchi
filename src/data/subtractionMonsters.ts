import { subtractionAreas, type SubtractionAreaId } from './planets'
import type { RewardOrigin } from '../types/rewardOrigin'

export type SubtractionMonsterDefinition = {
  id: string
  no: number
  areaId: SubtractionAreaId
  areaNo: number
  variant: 1 | 2 | 3
  name: string
  description: string
  threshold: number
  motif: 'chip' | 'split' | 'down' | 'double' | 'borrow' | 'large'
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
  areaId: SubtractionAreaId
  baseName: string
  descriptions: [string, string, string]
  motif: SubtractionMonsterDefinition['motif']
  colors: SubtractionMonsterDefinition['colors']
}> = [
  {
    areaId: 'sub-within-9',
    baseName: 'ひきっこ',
    descriptions: [
      'ちいさくかけたまるで、ひくかずをみまもるなかま',
      '1けたのひきざんをそっとたすけるなかま',
      'こたえをのこしてぴょんとわかれるなかま',
    ],
    motif: 'chip',
    colors: {
      base: '#ffb26b',
      outline: '#6b2d12',
      shadow: '#d66d3f',
      highlight: '#ffe0b7',
      glow: '#ffd0a0',
      accent: '#fff0a6',
    },
  },
  {
    areaId: 'sub-within-10',
    baseName: 'てんから',
    descriptions: [
      '10までのかずから、ぽんとわかれるなかま',
      'まるいからだをふたつにわけてかんがえるなかま',
      '10からのひきざんをゆっくりほどくなかま',
    ],
    motif: 'split',
    colors: {
      base: '#ffcf73',
      outline: '#6f4218',
      shadow: '#d9943b',
      highlight: '#fff2bf',
      glow: '#ffdf9d',
      accent: '#f06f59',
    },
  },
  {
    areaId: 'sub-borrow-basic',
    baseName: 'くりさがりん',
    descriptions: [
      'したむきのやじるしでくりさがりをしらせるなかま',
      '10をかりて、やまばをいっしょにおりるなかま',
      'くりさがりのひきざんをこわがらないなかま',
    ],
    motif: 'down',
    colors: {
      base: '#ff7a59',
      outline: '#742514',
      shadow: '#cc4933',
      highlight: '#ffc7b6',
      glow: '#ffb19b',
      accent: '#ffe66b',
    },
  },
  {
    areaId: 'sub-two-digit-no-borrow',
    baseName: 'にけたひき',
    descriptions: [
      '2だんのからだをけずって、けたをわけるなかま',
      'くりさがりなしの2けたをおちついてひくなかま',
      'じゅうのくらいといちのくらいをならべるなかま',
    ],
    motif: 'double',
    colors: {
      base: '#c782ff',
      outline: '#48205e',
      shadow: '#8b4ec7',
      highlight: '#efd8ff',
      glow: '#d8adff',
      accent: '#ffb26b',
    },
  },
  {
    areaId: 'sub-two-digit-borrow',
    baseName: 'さがりん',
    descriptions: [
      'おおきな - で2けたのくりさがりをささえるなかま',
      'いちのくらいでかりるときにそばにいるなかま',
      'むずかしい2けたをいっしょにほどくなかま',
    ],
    motif: 'borrow',
    colors: {
      base: '#ff6682',
      outline: '#702033',
      shadow: '#cc3657',
      highlight: '#ffd3dc',
      glow: '#ffafc0',
      accent: '#ffd166',
    },
  },
  {
    areaId: 'sub-three-digit',
    baseName: 'おおひき',
    descriptions: [
      'おおきなかずをどっしりけずる、ゆうやけのなかま',
      '3けたどうしをおちついてひくなかま',
      'ひきざんのほしのおおきなごーるをみまもるなかま',
    ],
    motif: 'large',
    colors: {
      base: '#f8a64f',
      outline: '#6e3218',
      shadow: '#bf6330',
      highlight: '#ffe1b6',
      glow: '#ffc078',
      accent: '#ff6b6b',
    },
  },
]

export const subtractionMonsterDefinitions: SubtractionMonsterDefinition[] = areaSeeds.flatMap(
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
      origin: 'sub',
    })),
)

export function subtractionAreaCorrectKey(areaId: SubtractionAreaId): string {
  return `subtraction:${areaId}`
}

export function subtractionCorrectForArea(
  categoryCorrect: Record<string, number>,
  areaId: SubtractionAreaId,
): number {
  return categoryCorrect[subtractionAreaCorrectKey(areaId)] ?? 0
}

export function isSubtractionMonsterOwned(
  categoryCorrect: Record<string, number>,
  monster: SubtractionMonsterDefinition,
): boolean {
  return subtractionCorrectForArea(categoryCorrect, monster.areaId) >= monster.threshold
}

export function subtractionAreaLabel(areaId: SubtractionAreaId): string {
  return subtractionAreas.find((area) => area.id === areaId)?.name ?? areaId
}

export function getSubtractionMonsterById(
  id: string | null | undefined,
): SubtractionMonsterDefinition | undefined {
  if (!id) {
    return undefined
  }
  return subtractionMonsterDefinitions.find((monster) => monster.id === id)
}
