import {
  DAILY_USAGE_STORAGE_KEY,
  createDailyUsageState,
  normalizeDailyUsageState,
  type DailyUsageState,
} from '../game-engine/school/dailyUsage'

export type DailyUsageRepository = {
  load: () => DailyUsageState
  save: (state: DailyUsageState) => void
  clear: () => void
}

export function createLocalStorageDailyUsageRepository(
  storage: Storage = window.localStorage,
): DailyUsageRepository {
  return {
    load: () => {
      const raw = storage.getItem(DAILY_USAGE_STORAGE_KEY)
      if (!raw) {
        return createDailyUsageState()
      }
      try {
        return normalizeDailyUsageState(JSON.parse(raw))
      } catch (error) {
        console.error('日次使用時間の読み込みに失敗しました', error)
        return createDailyUsageState()
      }
    },
    save: (state) => {
      storage.setItem(DAILY_USAGE_STORAGE_KEY, JSON.stringify(state))
    },
    clear: () => {
      storage.removeItem(DAILY_USAGE_STORAGE_KEY)
    },
  }
}
