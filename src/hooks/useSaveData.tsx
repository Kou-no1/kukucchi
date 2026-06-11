import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { refreshMissionsIfNeeded } from '../game-engine/missions/missions'
import { createLocalStorageSaveRepository } from '../repositories/saveRepository'
import type { SaveData } from '../types/save'

type SaveDataContextValue = {
  saveData: SaveData
  setSaveData: (next: SaveData) => void
  updateSaveData: (updater: (current: SaveData) => SaveData) => void
  resetSaveData: () => void
}

const SaveDataContext = createContext<SaveDataContextValue | null>(null)

const repository = createLocalStorageSaveRepository()

export function SaveDataProvider({ children }: { children: ReactNode }) {
  const [saveData, setSaveDataState] = useState(() =>
    refreshMissionsIfNeeded(repository.load()),
  )

  const setSaveData = useCallback((next: SaveData) => {
    const refreshed = refreshMissionsIfNeeded(next)
    repository.save(refreshed)
    setSaveDataState(refreshed)
  }, [])

  const updateSaveData = useCallback(
    (updater: (current: SaveData) => SaveData) => {
      setSaveData(updater(saveData))
    },
    [saveData, setSaveData],
  )

  const resetSaveData = useCallback(() => {
    repository.clear()
    setSaveDataState(refreshMissionsIfNeeded(repository.load()))
  }, [])

  const value = useMemo(
    () => ({ saveData, setSaveData, updateSaveData, resetSaveData }),
    [resetSaveData, saveData, setSaveData, updateSaveData],
  )

  return (
    <SaveDataContext.Provider value={value}>
      {children}
    </SaveDataContext.Provider>
  )
}

export function useSaveData(): SaveDataContextValue {
  const value = useContext(SaveDataContext)
  if (!value) {
    throw new Error('useSaveData must be used inside SaveDataProvider')
  }
  return value
}
