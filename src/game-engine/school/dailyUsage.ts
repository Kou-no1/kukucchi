import type { GameSessionSummary } from '../../types/game'

export const DAILY_USAGE_STORAGE_KEY = 'kukucchi_dailyUsage'
export const DEFAULT_DAILY_BUDGET_MINUTES = 10
export const DAILY_BUDGET_OPTIONS = [0, 10, 15, 20] as const
export const DAILY_IDLE_TIMEOUT_MS = 55_000

export type DailyBudgetMinutes = (typeof DAILY_BUDGET_OPTIONS)[number]

export type DailyUsageState = {
  date: string
  usedMs: number
  noticeShownDate: string | null
}

export function localDateKey(date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function createDailyUsageState(now = new Date()): DailyUsageState {
  return {
    date: localDateKey(now),
    usedMs: 0,
    noticeShownDate: null,
  }
}

export function normalizeDailyUsageState(
  state: Partial<DailyUsageState> | null | undefined,
  now = new Date(),
): DailyUsageState {
  const today = localDateKey(now)
  if (!state?.date) {
    return createDailyUsageState(now)
  }
  const usedMs = Number.isFinite(state.usedMs) ? Math.max(0, Math.floor(state.usedMs ?? 0)) : 0
  if (state.date < today) {
    return createDailyUsageState(now)
  }
  return {
    date: state.date,
    usedMs,
    noticeShownDate: state.noticeShownDate ?? null,
  }
}

export function addActiveUsage(
  state: DailyUsageState,
  elapsedMs: number,
  now = new Date(),
): DailyUsageState {
  const normalized = normalizeDailyUsageState(state, now)
  if (normalized.date !== localDateKey(now)) {
    return normalized
  }
  return {
    ...normalized,
    usedMs: normalized.usedMs + Math.max(0, Math.floor(elapsedMs)),
  }
}

export function shouldCountActiveUsage({
  visible,
  focused,
  lastActivityAt,
  now,
  idleTimeoutMs = DAILY_IDLE_TIMEOUT_MS,
}: {
  visible: boolean
  focused: boolean
  lastActivityAt: number
  now: number
  idleTimeoutMs?: number
}): boolean {
  return visible && focused && now - lastActivityAt <= idleTimeoutMs
}

export function dailyBudgetMs(minutes: DailyBudgetMinutes): number {
  return minutes * 60_000
}

export function isRewardBudgetReached(
  budgetMinutes: DailyBudgetMinutes,
  state: DailyUsageState,
): boolean {
  return budgetMinutes !== 0 && state.usedMs >= dailyBudgetMs(budgetMinutes)
}

export function shouldShowDailyBudgetNotice(
  budgetMinutes: DailyBudgetMinutes,
  state: DailyUsageState,
): boolean {
  return isRewardBudgetReached(budgetMinutes, state) && state.noticeShownDate !== state.date
}

export function markDailyBudgetNoticeShown(state: DailyUsageState): DailyUsageState {
  return {
    ...state,
    noticeShownDate: state.date,
  }
}

export function applyRewardBudgetToSummary(
  summary: GameSessionSummary,
  rewardBudgetPaused: boolean,
): GameSessionSummary {
  if (!rewardBudgetPaused) {
    return summary
  }
  return {
    ...summary,
    earnedCoins: 0,
    earnedExp: 0,
    details: {
      ...summary.details,
      rewardBudgetPaused: true,
    },
  }
}
