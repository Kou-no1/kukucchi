import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  DAILY_IDLE_TIMEOUT_MS,
  DEFAULT_DAILY_BUDGET_MINUTES,
  addActiveUsage,
  isRewardBudgetReached,
  markDailyBudgetNoticeShown,
  normalizeDailyUsageState,
  shouldCountActiveUsage,
  shouldShowDailyBudgetNotice,
  type DailyBudgetMinutes,
  type DailyUsageState,
} from '../game-engine/school/dailyUsage'
import { createLocalStorageDailyUsageRepository } from '../repositories/dailyUsageRepository'
import { useSaveData } from './useSaveData'

type DailyUsageContextValue = {
  budgetMinutes: DailyBudgetMinutes
  usage: DailyUsageState
  rewardBudgetReached: boolean
  shouldShowNotice: boolean
  acknowledgeNotice: () => void
}

const DailyUsageContext = createContext<DailyUsageContextValue | null>(null)

function sameDailyUsage(left: DailyUsageState, right: DailyUsageState): boolean {
  return (
    left.date === right.date &&
    left.usedMs === right.usedMs &&
    left.noticeShownDate === right.noticeShownDate
  )
}

export function DailyUsageProvider({ children }: { children: ReactNode }) {
  const { saveData } = useSaveData()
  const repository = useMemo(() => createLocalStorageDailyUsageRepository(), [])
  const [usage, setUsage] = useState(() => repository.load())
  const lastActivityAtRef = useRef(Date.now())
  const lastTickAtRef = useRef(Date.now())
  const visibleRef = useRef(document.visibilityState === 'visible')
  const focusedRef = useRef(document.hasFocus())

  const budgetMinutes =
    saveData.settings.dailyBudgetMinutes ?? DEFAULT_DAILY_BUDGET_MINUTES

  const persistUsage = useCallback(
    (next: DailyUsageState) => {
      repository.save(next)
      setUsage(next)
    },
    [repository],
  )

  useEffect(() => {
    function handleActivity() {
      const now = Date.now()
      if (now - lastActivityAtRef.current > DAILY_IDLE_TIMEOUT_MS) {
        lastTickAtRef.current = now
      }
      lastActivityAtRef.current = now
    }

    function handleVisibilityChange() {
      visibleRef.current = document.visibilityState === 'visible'
      lastTickAtRef.current = Date.now()
      handleActivity()
    }

    function handleFocus() {
      focusedRef.current = true
      lastTickAtRef.current = Date.now()
      handleActivity()
    }

    function handleBlur() {
      focusedRef.current = false
      lastTickAtRef.current = Date.now()
    }

    const activityEvents = ['pointerdown', 'pointermove', 'keydown', 'touchstart'] as const
    for (const eventName of activityEvents) {
      window.addEventListener(eventName, handleActivity, { passive: true })
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)
    window.addEventListener('blur', handleBlur)

    const interval = window.setInterval(() => {
      const now = Date.now()
      const elapsedMs = now - lastTickAtRef.current
      lastTickAtRef.current = now
      if (
        !shouldCountActiveUsage({
          visible: visibleRef.current,
          focused: focusedRef.current,
          lastActivityAt: lastActivityAtRef.current,
          now,
        })
      ) {
        setUsage((current) => {
          const normalized = normalizeDailyUsageState(current, new Date(now))
          if (sameDailyUsage(normalized, current)) {
            return current
          }
          repository.save(normalized)
          return normalized
        })
        return
      }
      setUsage((current) => {
        const next = addActiveUsage(current, elapsedMs, new Date(now))
        repository.save(next)
        return next
      })
    }, 1000)

    return () => {
      window.clearInterval(interval)
      for (const eventName of activityEvents) {
        window.removeEventListener(eventName, handleActivity)
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('blur', handleBlur)
    }
  }, [repository])

  const rewardBudgetReached = isRewardBudgetReached(budgetMinutes, usage)
  const shouldShowNotice = shouldShowDailyBudgetNotice(budgetMinutes, usage)

  const acknowledgeNotice = useCallback(() => {
    const next = markDailyBudgetNoticeShown(usage)
    persistUsage(next)
  }, [persistUsage, usage])

  const value = useMemo(
    () => ({
      budgetMinutes,
      usage,
      rewardBudgetReached,
      shouldShowNotice,
      acknowledgeNotice,
    }),
    [acknowledgeNotice, budgetMinutes, rewardBudgetReached, shouldShowNotice, usage],
  )

  return <DailyUsageContext.Provider value={value}>{children}</DailyUsageContext.Provider>
}

export function useDailyUsage(): DailyUsageContextValue {
  const value = useContext(DailyUsageContext)
  if (!value) {
    throw new Error('useDailyUsage must be used inside DailyUsageProvider')
  }
  return value
}
