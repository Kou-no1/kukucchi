import type { AnswerResult, GameSessionSummary } from '../../types/game'

export function calculateCoins(results: AnswerResult[], maxCombo: number): number {
  const correctCount = results.filter((result) => result.correct).length
  const baseCoins = correctCount * 3
  const comboBonus = Math.min(12, Math.floor(maxCombo / 5) * 3)
  return Math.min(80, baseCoins + comboBonus)
}

export function calculateExp(results: AnswerResult[], modeBonus = 0): number {
  const correctCount = results.filter((result) => result.correct).length
  const attemptBonus = Math.ceil(results.length * 2)
  return correctCount * 8 + attemptBonus + modeBonus
}

export function expToLevel(exp: number): number {
  return Math.max(1, Math.floor(Math.sqrt(exp / 80)) + 1)
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
    earnedExp: calculateExp(partial.results, partial.mode === 'speed' ? 10 : 4),
    newTitles: [],
    bestUpdated: false,
    weakFacts: [],
    masteredFacts: [],
  }
}
