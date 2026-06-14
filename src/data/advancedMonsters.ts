export type AdvancedMonsterCategory = 'square' | 'pi' | 'mixed'

export type AdvancedMonsterDefinition = {
  id: string
  no: number
  category: AdvancedMonsterCategory
  name: string
  description: string
  threshold: number
  squareRoot?: number
  piValue?: number
  seed: number
}

export const advancedMonsterCategoryLabels: Record<AdvancedMonsterCategory, string> = {
  square: '平方数',
  pi: '3.14',
  mixed: 'ミックス',
}

const squareMonsters: AdvancedMonsterDefinition[] = Array.from({ length: 8 }, (_, index) => {
  const root = index + 2
  const value = root * root
  return {
    id: `square-${root}`,
    no: index + 1,
    category: 'square',
    name: `${value}ブロックン`,
    description: `${root}×${root}のしかくななかま`,
    threshold: [3, 6, 9, 12, 15, 20, 25, 30][index],
    squareRoot: root,
    seed: root * 19,
  }
})

const piSeeds: Array<[string, string, number, number]> = [
  ['pi-1', 'ワンリングパイ', 1, 3],
  ['pi-2', 'ツインリングパイ', 2, 6],
  ['pi-5', 'ファイブオービット', 5, 10],
  ['pi-10', 'テンパイプラネット', 10, 14],
  ['pi-25', 'クォーターパイ', 25, 20],
  ['pi-100', 'フルムーンパイ', 100, 25],
]

const piMonsters: AdvancedMonsterDefinition[] = piSeeds.map(([id, name, value, threshold], index) => ({
  id,
  no: squareMonsters.length + index + 1,
  category: 'pi',
  name,
  description: `3.14×${value}をまもるリングのなかま`,
  threshold,
  piValue: value,
  seed: value * 23 + index,
}))

const mixedNames = [
  ['mixed-rainbow-1', 'にじいろパッチ', 'いろんな段カラーがまざったなかま'],
  ['mixed-rainbow-2', 'しましまミックス', 'しまもようでちからをあわせるなかま'],
  ['mixed-rainbow-3', 'くくパレット', '9色のひかりをためるなかま'],
  ['mixed-rainbow-4', 'ギャラクシーミックス', 'むずかしい式をつなぐなかま'],
  ['mixed-rainbow-5', 'レインボーガード', 'みんなの色でまもるなかま'],
  ['mixed-rainbow-6', 'ぜんぶいろスター', 'ミックス計算のとくべつななかま'],
] as const

const mixedMonsters: AdvancedMonsterDefinition[] = mixedNames.map(([id, name, description], index) => ({
  id,
  no: squareMonsters.length + piMonsters.length + index + 1,
  category: 'mixed',
  name,
  description,
  threshold: [5, 10, 15, 20, 30, 40][index],
  seed: 101 + index * 17,
}))

export const advancedMonsterDefinitions: AdvancedMonsterDefinition[] = [
  ...squareMonsters,
  ...piMonsters,
  ...mixedMonsters,
]

export function advancedProgressForCategory(
  counts: Record<string, number>,
  category: AdvancedMonsterCategory,
): number {
  if (category === 'square') {
    return counts['multiplication-square'] ?? 0
  }
  if (category === 'pi') {
    return counts['pi-multiplication'] ?? 0
  }
  return (
    (counts['multiplication-square'] ?? 0) +
    (counts['pi-multiplication'] ?? 0) +
    (counts.development ?? 0)
  )
}

export function isAdvancedMonsterOwned(
  counts: Record<string, number>,
  monster: AdvancedMonsterDefinition,
): boolean {
  return advancedProgressForCategory(counts, monster.category) >= monster.threshold
}

export function newlyOwnedAdvancedMonsters(
  previousCounts: Record<string, number>,
  nextCounts: Record<string, number>,
): AdvancedMonsterDefinition[] {
  return advancedMonsterDefinitions.filter(
    (monster) =>
      !isAdvancedMonsterOwned(previousCounts, monster) &&
      isAdvancedMonsterOwned(nextCounts, monster),
  )
}
