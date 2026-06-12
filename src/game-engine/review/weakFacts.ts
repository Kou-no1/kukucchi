import type { MultiplicationFactProgress } from '../../types/game'

function attemptsOf(fact: MultiplicationFactProgress): number {
  return fact.correctCount + fact.incorrectCount
}

function accuracyOf(fact: MultiplicationFactProgress): number {
  const attempts = attemptsOf(fact)
  return attempts === 0 ? 1 : fact.correctCount / attempts
}

export function getWeakFacts(
  facts: Record<string, MultiplicationFactProgress>,
  limit = 5,
): MultiplicationFactProgress[] {
  return Object.values(facts)
    .filter((fact) => attemptsOf(fact) > 0)
    .sort((left, right) => {
      const leftAccuracy = accuracyOf(left)
      const rightAccuracy = accuracyOf(right)
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

export function getDueReviewFacts(
  facts: Record<string, MultiplicationFactProgress>,
  now = new Date(),
  limit = 8,
): MultiplicationFactProgress[] {
  const time = now.getTime()
  return Object.values(facts)
    .filter((fact) => fact.nextReviewAt && new Date(fact.nextReviewAt).getTime() <= time)
    .sort((left, right) => {
      const leftTime = new Date(left.nextReviewAt ?? 0).getTime()
      const rightTime = new Date(right.nextReviewAt ?? 0).getTime()
      return leftTime - rightTime
    })
    .slice(0, limit)
}

export function isMonsterFact(fact: MultiplicationFactProgress): boolean {
  const attempts = attemptsOf(fact)
  const latestWrong = fact.recentResults[0]?.correct === false
  return (
    attempts >= 2 &&
    fact.masteryLevel < 4 &&
    (accuracyOf(fact) < 0.72 || fact.averageResponseTimeMs >= 4800 || latestWrong)
  )
}

export function getMonsterFacts(
  facts: Record<string, MultiplicationFactProgress>,
  limit = 12,
): MultiplicationFactProgress[] {
  return Object.values(facts)
    .filter(isMonsterFact)
    .sort((left, right) => {
      const leftPriority =
        (1 - accuracyOf(left)) * 100 + left.averageResponseTimeMs / 1000 - left.masteryLevel
      const rightPriority =
        (1 - accuracyOf(right)) * 100 + right.averageResponseTimeMs / 1000 - right.masteryLevel
      return rightPriority - leftPriority
    })
    .slice(0, limit)
}

export function getReviewQueue(
  facts: Record<string, MultiplicationFactProgress>,
  now = new Date(),
  limit = 8,
): MultiplicationFactProgress[] {
  const seen = new Set<string>()
  const queue = [...getWeakFacts(facts, limit), ...getDueReviewFacts(facts, now, limit)].filter(
    (fact) => {
      if (seen.has(fact.id)) {
        return false
      }
      seen.add(fact.id)
      return true
    },
  )
  return queue.slice(0, limit)
}
