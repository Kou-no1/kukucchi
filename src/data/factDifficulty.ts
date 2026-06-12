export const factDifficultyWeights: Record<number, number> = {
  2: 1,
  5: 1,
  3: 2,
  4: 2,
  6: 3,
  9: 3,
  7: 4,
  8: 4,
}

export const factDifficultyRawMap: Record<number, 2 | 3 | 4 | 5> = {
  2: 2,
  3: 2,
  4: 3,
  5: 3,
  6: 4,
  7: 5,
  8: 5,
}

export const defaultMinDifficultyByBossDifficulty = {
  normal: 1,
  hard: 2,
  fast: 2,
  gekimuzu: 3,
} as const

export const miniGameMinDifficulty = 2

export const speedDurations = [30, 60] as const

export const defaultSpeedStages = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const
