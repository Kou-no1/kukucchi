import { factDifficultyRawMap, factDifficultyWeights } from '../../data/factDifficulty'

export type MultiplicationFactPair = {
  left: number
  right: number
  difficulty: number
}

function clampFactValue(value: number): number {
  return Math.min(9, Math.max(1, Math.round(value)))
}

export function factDifficulty(left: number, right: number): 1 | 2 | 3 | 4 | 5 {
  const safeLeft = clampFactValue(left)
  const safeRight = clampFactValue(right)
  if (safeLeft === 1 || safeRight === 1) {
    return 1
  }
  const raw = (factDifficultyWeights[safeLeft] ?? 1) + (factDifficultyWeights[safeRight] ?? 1)
  return factDifficultyRawMap[raw] ?? 5
}

export function createMultiplicationFactPool({
  stages = [1, 2, 3, 4, 5, 6, 7, 8, 9],
  minDifficulty = 1,
}: {
  stages?: number[]
  minDifficulty?: number
} = {}): MultiplicationFactPair[] {
  const safeStages = Array.from(
    new Set(stages.map(clampFactValue).filter((stage) => stage >= 1 && stage <= 9)),
  )
  const stagePool = safeStages.length > 0 ? safeStages : [1, 2, 3, 4, 5, 6, 7, 8, 9]
  const allPairs = stagePool.flatMap((left) =>
    Array.from({ length: 9 }, (_, index) => {
      const right = index + 1
      return {
        left,
        right,
        difficulty: factDifficulty(left, right),
      }
    }),
  )

  for (let threshold = Math.min(5, Math.max(1, Math.round(minDifficulty))); threshold >= 1; threshold -= 1) {
    const filtered = allPairs.filter((pair) => pair.difficulty >= threshold)
    if (filtered.length > 0) {
      return filtered
    }
  }
  return allPairs
}

export function averageStageDifficulty(stage: number): number {
  const pool = createMultiplicationFactPool({ stages: [stage], minDifficulty: 1 })
  return pool.reduce((sum, pair) => sum + pair.difficulty, 0) / pool.length
}
