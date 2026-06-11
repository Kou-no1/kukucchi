import type { ScoreState } from '../../types/game'

export function calculateSpeedBonus(responseTimeMs: number): number {
  if (responseTimeMs < 400) {
    return 0
  }
  const capped = Math.min(responseTimeMs, 5000)
  return Math.max(0, Math.round(50 * (1 - (capped - 400) / 4600)))
}

export function calculateComboMultiplier(combo: number): number {
  return 1 + Math.floor(combo / 5) * 0.1
}

export function applyAnswerToScore(
  state: ScoreState,
  correct: boolean,
  responseTimeMs: number,
): ScoreState {
  if (!correct) {
    return { ...state, combo: 0 }
  }

  const nextCombo = state.combo + 1
  const gained = Math.round(
    (100 + calculateSpeedBonus(responseTimeMs)) *
      calculateComboMultiplier(nextCombo),
  )

  return {
    score: state.score + gained,
    combo: nextCombo,
    maxCombo: Math.max(state.maxCombo, nextCombo),
  }
}
