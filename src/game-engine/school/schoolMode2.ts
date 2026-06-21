import type { AnswerResult, GameMode, GameSessionSummary, MultiplicationFactProgress } from '../../types/game'
import type { AdditionAreaId } from '../../data/planets'
import type { AdditionFactPair } from '../questions/addition'
import { createAdditionFactPool } from '../questions/addition'
import type { MultiplicationFactPair } from '../questions/factDifficulty'
import { createMultiplicationFactPool } from '../questions/factDifficulty'
import {
  factFromResult,
  factIdFromResult,
  makeAdditionFactId,
  makeMultiplicationFactId,
  parseFactId,
} from '../questions/factIds'
import type { RandomSource } from '../questions/questionGenerator'
import { isMonsterOvercome } from '../review/weakFacts'

export const DEFAULT_SCHOOL_MODE_2_ENABLED = true

export type SchoolMasteryBand = 'beginner' | 'developing' | 'mastered'

export const schoolRewardScales: Record<SchoolMasteryBand, number> = {
  beginner: 1,
  developing: 0.7,
  mastered: 0.2,
}

const rewardTaperModes = new Set<GameMode>(['learn', 'review'])

function attemptsOf(fact: MultiplicationFactProgress): number {
  return fact.correctCount + fact.incorrectCount
}

function accuracyOf(fact: MultiplicationFactProgress): number {
  const attempts = attemptsOf(fact)
  return attempts === 0 ? 0 : fact.correctCount / attempts
}

export function isTokuiFact(fact: MultiplicationFactProgress | undefined): boolean {
  return Boolean(fact && fact.masteryLevel >= 4)
}

export function classifySchoolMastery(
  fact: MultiplicationFactProgress | undefined,
): SchoolMasteryBand {
  if (!fact || attemptsOf(fact) === 0) {
    return 'beginner'
  }
  if (fact.incorrectCount > 0 && !isMonsterOvercome(fact)) {
    return 'beginner'
  }
  if (isTokuiFact(fact)) {
    return 'mastered'
  }
  if (fact.masteryLevel >= 2 || fact.correctCount >= 2 || accuracyOf(fact) >= 0.7) {
    return 'developing'
  }
  return 'beginner'
}

export function rewardScaleForFact(
  fact: MultiplicationFactProgress | undefined,
): number {
  return schoolRewardScales[classifySchoolMastery(fact)]
}

function scaledReward(value: number, scale: number): number {
  if (value <= 0 || scale >= 1) {
    return value
  }
  return Math.max(1, Math.round(value * scale))
}

export function calculateSchoolRewardScale(
  results: AnswerResult[],
  facts: Record<string, MultiplicationFactProgress>,
): number {
  const scalableResults = results.filter((result) => factIdFromResult(result) !== null)
  if (scalableResults.length === 0) {
    return 1
  }
  const totalScale = scalableResults.reduce((sum, result) => {
    const fact = factIdFromResult(result)
    return sum + rewardScaleForFact(fact ? facts[fact] : undefined)
  }, 0)
  return totalScale / scalableResults.length
}

export function applySchoolRewardTaperingToSummary(
  summary: GameSessionSummary,
  facts: Record<string, MultiplicationFactProgress>,
  enabled = DEFAULT_SCHOOL_MODE_2_ENABLED,
): GameSessionSummary {
  if (!enabled || !rewardTaperModes.has(summary.mode)) {
    return summary
  }
  const scale = calculateSchoolRewardScale(summary.results, facts)
  return {
    ...summary,
    earnedCoins: scaledReward(summary.earnedCoins, scale),
    earnedExp: scaledReward(summary.earnedExp, scale),
    details: {
      ...summary.details,
      schoolMode2Enabled: true,
      schoolRewardScalePercent: Math.round(scale * 100),
    },
  }
}

function recentIncorrectStreakOf(fact: MultiplicationFactProgress | undefined): number {
  if (!fact) {
    return 0
  }
  let streak = 0
  for (const result of fact.recentResults) {
    if (result.correct) {
      break
    }
    streak += 1
  }
  return streak
}

function adaptiveWeight(
  pair: MultiplicationFactPair | AdditionFactPair,
  fact: MultiplicationFactProgress | undefined,
  recentIncorrectCount: number,
): number {
  if (recentIncorrectCount >= 2) {
    if (pair.difficulty <= 2 || (fact && fact.masteryLevel >= 2 && pair.difficulty <= 3)) {
      return 4
    }
    return 0.25
  }

  const band = classifySchoolMastery(fact)
  if (band === 'mastered') {
    return 0.2
  }
  const weakBoost = fact && fact.incorrectCount > 0 && !isMonsterOvercome(fact) ? 2.2 : 1
  const recentMissBoost = Math.min(2.5, 1 + recentIncorrectStreakOf(fact) * 0.6)
  const difficultyBoost = 1 + pair.difficulty * 0.14
  const bandBoost = band === 'beginner' ? 1.35 : 1
  return weakBoost * recentMissBoost * difficultyBoost * bandBoost
}

export function selectAdaptiveMultiplicationFact({
  facts,
  stages,
  minDifficulty = 1,
  rng = Math.random,
  recentIncorrectCount = 0,
}: {
  facts: Record<string, MultiplicationFactProgress>
  stages?: number[]
  minDifficulty?: number
  rng?: RandomSource
  recentIncorrectCount?: number
}): MultiplicationFactPair {
  const pool = createMultiplicationFactPool({ stages, minDifficulty })
  const weighted = pool.map((pair) => ({
    pair,
    weight: adaptiveWeight(
      pair,
      facts[makeMultiplicationFactId(pair.left, pair.right)],
      recentIncorrectCount,
    ),
  }))
  const totalWeight = weighted.reduce((sum, item) => sum + item.weight, 0)
  if (totalWeight <= 0) {
    return pool[0]
  }
  let cursor = rng() * totalWeight
  for (const item of weighted) {
    cursor -= item.weight
    if (cursor <= 0) {
      return item.pair
    }
  }
  return weighted.at(-1)?.pair ?? pool[0]
}

export function selectAdaptiveAdditionFact({
  facts,
  areaId,
  rng = Math.random,
  recentIncorrectCount = 0,
}: {
  facts: Record<string, MultiplicationFactProgress>
  areaId: AdditionAreaId
  rng?: RandomSource
  recentIncorrectCount?: number
}): AdditionFactPair {
  const poolById = new Map<string, AdditionFactPair>()
  for (const pair of createAdditionFactPool({ areaId })) {
    poolById.set(makeAdditionFactId(areaId, pair.left, pair.right), pair)
  }
  for (const fact of Object.values(facts)) {
    const parsed = parseFactId(fact.id)
    if (parsed?.operation === 'addition' && parsed.areaId === areaId) {
      poolById.set(parsed.id, {
        areaId,
        left: parsed.left,
        right: parsed.right,
        difficulty: Math.max(1, Math.min(5, Math.round(fact.masteryLevel || 1))),
      })
    }
  }

  const pool = [...poolById.values()]
  const weighted = pool.map((pair) => ({
    pair,
    weight: adaptiveWeight(pair, facts[makeAdditionFactId(areaId, pair.left, pair.right)], recentIncorrectCount),
  }))
  const totalWeight = weighted.reduce((sum, item) => sum + item.weight, 0)
  if (totalWeight <= 0) {
    return pool[0]
  }
  let cursor = rng() * totalWeight
  for (const item of weighted) {
    cursor -= item.weight
    if (cursor <= 0) {
      return item.pair
    }
  }
  return weighted.at(-1)?.pair ?? pool[0]
}

export function resultIncorrectStreak(results: AnswerResult[]): number {
  let streak = 0
  for (let index = results.length - 1; index >= 0; index -= 1) {
    const result = results[index]
    if (result.correct) {
      break
    }
    if (factFromResult(result)) {
      streak += 1
    }
  }
  return streak
}
