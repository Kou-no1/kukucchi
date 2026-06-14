import { describe, expect, it } from 'vitest'
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
})
