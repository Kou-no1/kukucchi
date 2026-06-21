import type {
  ArithmeticOperation,
  AnswerResult,
  MultiplicationFactProgress,
} from '../../types/game'
import { addDays, isDifferentLocalDay } from '../../utils/date'
import { makeMultiplicationFactId } from '../questions/factIds'

export function createFactProgress(
  left: number,
  right: number,
  options: {
    id?: string
    operation?: ArithmeticOperation
    areaId?: string
  } = {},
): MultiplicationFactProgress {
  return {
    id: options.id ?? makeMultiplicationFactId(left, right),
    operation: options.operation ?? 'multiplication',
    areaId: options.areaId,
    left,
    right,
    correctCount: 0,
    incorrectCount: 0,
    consecutiveCorrect: 0,
    averageResponseTimeMs: 0,
    bestResponseTimeMs: null,
    lastAnsweredAt: null,
    nextReviewAt: null,
    masteryLevel: 0,
    recentResults: [],
  }
}

function calculateMastery(
  progress: MultiplicationFactProgress,
  answeredDifferentDay: boolean,
): MultiplicationFactProgress['masteryLevel'] {
  const attempts = progress.correctCount + progress.incorrectCount
  const accuracy = attempts === 0 ? 0 : progress.correctCount / attempts

  if (
    progress.correctCount >= 7 &&
    progress.consecutiveCorrect >= 4 &&
    progress.averageResponseTimeMs <= 3000 &&
    answeredDifferentDay
  ) {
    return 5
  }
  if (progress.correctCount >= 5 && accuracy >= 0.85) {
    return 4
  }
  if (progress.correctCount >= 3 && accuracy >= 0.7) {
    return 3
  }
  if (progress.correctCount >= 1) {
    return 2
  }
  if (attempts > 0) {
    return 1
  }
  return 0
}

export function calculateNextReviewAt(
  masteryLevel: MultiplicationFactProgress['masteryLevel'],
  correct: boolean,
  from = new Date(),
): string {
  if (!correct) {
    return addDays(from, 1)
  }
  const intervals = [1, 1, 3, 7, 14, 30]
  return addDays(from, intervals[masteryLevel] ?? 1)
}

export function updateFactProgress(
  current: MultiplicationFactProgress,
  result: AnswerResult,
): MultiplicationFactProgress {
  const attempts = current.correctCount + current.incorrectCount
  const averageResponseTimeMs =
    attempts === 0
      ? result.responseTimeMs
      : Math.round(
          (current.averageResponseTimeMs * attempts + result.responseTimeMs) /
            (attempts + 1),
        )
  const answeredDifferentDay = isDifferentLocalDay(
    current.lastAnsweredAt,
    result.answeredAt,
  )
  const next = {
    ...current,
    correctCount: current.correctCount + (result.correct ? 1 : 0),
    incorrectCount: current.incorrectCount + (result.correct ? 0 : 1),
    consecutiveCorrect: result.correct ? current.consecutiveCorrect + 1 : 0,
    averageResponseTimeMs,
    bestResponseTimeMs: result.correct
      ? Math.min(current.bestResponseTimeMs ?? Infinity, result.responseTimeMs)
      : current.bestResponseTimeMs,
    lastAnsweredAt: result.answeredAt,
    nextReviewAt: calculateNextReviewAt(
      current.masteryLevel,
      result.correct,
      new Date(result.answeredAt),
    ),
    recentResults: [result, ...current.recentResults].slice(0, 8),
  }
  return {
    ...next,
    masteryLevel: calculateMastery(next, answeredDifferentDay),
  }
}
