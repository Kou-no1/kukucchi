import type { MultiplicationFactProgress } from '../../types/game'

export function getWeakFacts(
  facts: Record<string, MultiplicationFactProgress>,
  limit = 5,
): MultiplicationFactProgress[] {
  return Object.values(facts)
    .filter((fact) => fact.correctCount + fact.incorrectCount > 0)
    .sort((left, right) => {
      const leftAttempts = left.correctCount + left.incorrectCount
      const rightAttempts = right.correctCount + right.incorrectCount
      const leftAccuracy = left.correctCount / leftAttempts
      const rightAccuracy = right.correctCount / rightAttempts
      if (leftAccuracy !== rightAccuracy) {
        return leftAccuracy - rightAccuracy
      }
      return right.averageResponseTimeMs - left.averageResponseTimeMs
    })
    .slice(0, limit)
}

export function getMasteredFacts(
  facts: Record<string, MultiplicationFactProgress>,
): MultiplicationFactProgress[] {
  return Object.values(facts).filter((fact) => fact.masteryLevel >= 4)
}
