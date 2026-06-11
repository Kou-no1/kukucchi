import { createDefaultSaveData, migrateSaveData } from '../storage/saveData'
import type { SaveData } from '../types/save'

const STORAGE_KEY = 'kukucchi-save-v1'

export type SaveRepository = {
  load: () => SaveData
  save: (data: SaveData) => void
  clear: () => void
}

export function createLocalStorageSaveRepository(
  storage: Storage = window.localStorage,
): SaveRepository {
  return {
    load: () => {
      const raw = storage.getItem(STORAGE_KEY)
      if (!raw) {
        return createDefaultSaveData()
      }
      try {
        return migrateSaveData(JSON.parse(raw))
      } catch (error) {
        console.error('セーブデータの読み込みに失敗しました', error)
        return createDefaultSaveData()
      }
    },
    save: (data) => {
      storage.setItem(STORAGE_KEY, JSON.stringify(data))
    },
    clear: () => {
      storage.removeItem(STORAGE_KEY)
    },
  }
}
