import type { AnswerResult, GameSessionSummary } from '../../types/game'

export function calculateCoins(results: AnswerResult[], maxCombo: number): number {
  const correctCount = results.filter((result) => result.correct).length
  const baseCoins = correctCount * 3
  const comboBonus = Math.min(12, Math.floor(maxCombo / 5) * 3)
  return Math.min(80, baseCoins + comboBonus)
}

export function calculateExp(results: AnswerResult[], modeBonus = 0): number {
  const difficultyExp = results
    .filter((result) => result.correct)
    .reduce((sum, result) => sum + Math.max(1, result.difficulty ?? 1) * (8 / 3), 0)
  const attemptBonus = Math.ceil(results.length * 2)
  return Math.round(difficultyExp) + attemptBonus + modeBonus
}

export function expToLevel(exp: number): number {
  return Math.max(1, Math.floor(Math.sqrt(exp / 80)) + 1)
}

export function expRequiredForLevel(level: number): number {
  return Math.max(0, (level - 1) ** 2 * 80)
}

export function expProgressToNextLevel(exp: number): {
  level: number
  currentLevelExp: number
  nextLevelExp: number
  gainedInLevel: number
  remainingExp: number
  percent: number
} {
  const level = expToLevel(exp)
  const currentLevelExp = expRequiredForLevel(level)
  const nextLevelExp = expRequiredForLevel(level + 1)
  const levelSpan = Math.max(1, nextLevelExp - currentLevelExp)
  const gainedInLevel = Math.max(0, exp - currentLevelExp)
  const remainingExp = Math.max(0, nextLevelExp - exp)
  return {
    level,
    currentLevelExp,
    nextLevelExp,
    gainedInLevel,
    remainingExp,
    percent: Math.min(100, Math.round((gainedInLevel / levelSpan) * 100)),
  }
}

export type ExpProgressAnimationStep = {
  level: number
  fromPercent: number
  toPercent: number
  fromExp: number
  toExp: number
  levelSpan: number
  leveledUp: boolean
}

function expPercentWithinLevel(exp: number, level: number): number {
  const currentLevelExp = expRequiredForLevel(level)
  const nextLevelExp = expRequiredForLevel(level + 1)
  const levelSpan = Math.max(1, nextLevelExp - currentLevelExp)
  return Math.min(100, Math.round(((exp - currentLevelExp) / levelSpan) * 100))
}

export function buildExpProgressAnimationSteps(
  previousExp: number,
  earnedExp: number,
): ExpProgressAnimationStep[] {
  const startExp = Math.max(0, previousExp)
  const endExp = Math.max(startExp, startExp + Math.max(0, earnedExp))

  if (startExp === endExp) {
    const level = expToLevel(startExp)
    const currentLevelExp = expRequiredForLevel(level)
    const nextLevelExp = expRequiredForLevel(level + 1)
    return [
      {
        level,
        fromPercent: expPercentWithinLevel(startExp, level),
        toPercent: expPercentWithinLevel(startExp, level),
        fromExp: startExp - currentLevelExp,
        toExp: startExp - currentLevelExp,
        levelSpan: nextLevelExp - currentLevelExp,
        leveledUp: false,
      },
    ]
  }

  const steps: ExpProgressAnimationStep[] = []
  let cursor = startExp

  while (cursor < endExp) {
    const level = expToLevel(cursor)
    const currentLevelExp = expRequiredForLevel(level)
    const nextLevelExp = expRequiredForLevel(level + 1)
    const levelSpan = Math.max(1, nextLevelExp - currentLevelExp)
    const segmentEnd = Math.min(endExp, nextLevelExp)

    steps.push({
      level,
      fromPercent: expPercentWithinLevel(cursor, level),
      toPercent: segmentEnd >= nextLevelExp ? 100 : expPercentWithinLevel(segmentEnd, level),
      fromExp: Math.max(0, cursor - currentLevelExp),
      toExp: Math.min(levelSpan, Math.max(0, segmentEnd - currentLevelExp)),
      levelSpan,
      leveledUp: segmentEnd >= nextLevelExp,
    })

    cursor = segmentEnd
  }

  return steps
}

function modeExpBonus(mode: GameSessionSummary['mode']): number {
  if (mode === 'speed') {
    return 10
  }
  if (mode === 'review') {
    return 8
  }
  if (mode === 'advanced' || mode === 'battle' || mode === 'treasure' || mode === 'rocket') {
    return 14
  }
  return 4
}

export function buildSessionSummary(
  partial: Omit<
    GameSessionSummary,
    | 'totalQuestions'
    | 'correctCount'
    | 'accuracy'
    | 'averageResponseTimeMs'
    | 'earnedCoins'
    | 'earnedExp'
    | 'newTitles'
    | 'bestUpdated'
    | 'weakFacts'
    | 'masteredFacts'
  >,
): GameSessionSummary {
  const total = partial.results.length
  const correctCount = partial.results.filter((result) => result.correct).length
  const totalTime = partial.results.reduce(
    (sum, result) => sum + result.responseTimeMs,
    0,
  )

  return {
    ...partial,
    totalQuestions: total,
    correctCount,
    accuracy: total === 0 ? 0 : Math.round((correctCount / total) * 100),
    averageResponseTimeMs: total === 0 ? 0 : Math.round(totalTime / total),
    earnedCoins: calculateCoins(partial.results, partial.maxCombo),
    earnedExp: calculateExp(partial.results, modeExpBonus(partial.mode)),
    newTitles: [],
    bestUpdated: false,
    weakFacts: [],
    masteredFacts: [],
  }
}
