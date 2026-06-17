import { describe, expect, it } from 'vitest'
import { DAILY_USAGE_STORAGE_KEY, createDailyUsageState } from '../game-engine/school/dailyUsage'
import { createLocalStorageDailyUsageRepository } from '../repositories/dailyUsageRepository'
import { createLocalStorageSaveRepository } from '../repositories/saveRepository'
import { createDefaultSaveData } from '../storage/saveData'

describe('save repository', () => {
  it('saves and loads localStorage data', () => {
    window.localStorage.clear()
    const repository = createLocalStorageSaveRepository(window.localStorage)
    const save = createDefaultSaveData()
    repository.save({
      ...save,
      player: {
        nickname: 'テスト',
        icon: 'たまご',
        shipName: 'くくっち',
        characterName: 'くくっち',
        learningLevel: 'first',
        level: 1,
        exp: 0,
        coins: 3,
        titles: ['はじめのいっぽ'],
        currentTitle: 'はじめのいっぽ',
        createdAt: '2026-01-01T00:00:00.000Z',
        lastPlayedAt: null,
      },
    })
    expect(repository.load().player?.nickname).toBe('テスト')
    repository.clear()
    expect(repository.load().player).toBeNull()
  })

  it('stores daily usage in a separate non-backup localStorage key', () => {
    window.localStorage.clear()
    const saveRepository = createLocalStorageSaveRepository(window.localStorage)
    const usageRepository = createLocalStorageDailyUsageRepository(window.localStorage)
    const save = createDefaultSaveData()
    saveRepository.save(save)
    usageRepository.save({
      ...createDailyUsageState(new Date('2026-01-01T09:00:00')),
      usedMs: 600_000,
    })
    expect(window.localStorage.getItem(DAILY_USAGE_STORAGE_KEY)).toContain('usedMs')
    expect(JSON.stringify(saveRepository.load())).not.toContain('usedMs')
    expect(JSON.stringify(saveRepository.load())).not.toContain(DAILY_USAGE_STORAGE_KEY)
  })
})
