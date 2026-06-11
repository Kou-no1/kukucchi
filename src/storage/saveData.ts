import type { OnboardingInput, SaveData } from '../types/save'

export const SAVE_DATA_VERSION = 1

export function createDefaultSaveData(): SaveData {
  return {
    version: SAVE_DATA_VERSION,
    player: null,
    settings: {
      soundEnabled: true,
      speechEnabled: true,
      reduceMotion: false,
    },
    progress: {
      facts: {},
      history: [],
      bests: {},
      missions: [],
      missionDate: null,
      monsterBook: [],
      ownedItems: ['basic-room'],
      equippedItems: ['basic-room'],
    },
  }
}

export function createPlayerFromOnboarding(input: OnboardingInput): SaveData {
  const now = new Date().toISOString()
  return {
    ...createDefaultSaveData(),
    player: {
      nickname: input.nickname.trim() || 'くくとも',
      icon: input.icon,
      learningLevel: input.learningLevel,
      level: 1,
      exp: 0,
      coins: 0,
      titles: ['はじめのいっぽ'],
      currentTitle: 'はじめのいっぽ',
      createdAt: now,
      lastPlayedAt: now,
    },
    settings: {
      soundEnabled: input.soundEnabled,
      speechEnabled: true,
      reduceMotion: false,
    },
  }
}

export function migrateSaveData(raw: unknown): SaveData {
  if (!raw || typeof raw !== 'object') {
    return createDefaultSaveData()
  }

  const candidate = raw as Partial<SaveData>
  if (candidate.version === SAVE_DATA_VERSION) {
    return {
      ...createDefaultSaveData(),
      ...candidate,
      progress: {
        ...createDefaultSaveData().progress,
        ...candidate.progress,
        facts: candidate.progress?.facts ?? {},
      },
      settings: {
        ...createDefaultSaveData().settings,
        ...candidate.settings,
      },
    }
  }

  return {
    ...createDefaultSaveData(),
    ...candidate,
    version: SAVE_DATA_VERSION,
    progress: {
      ...createDefaultSaveData().progress,
      ...candidate.progress,
      facts: candidate.progress?.facts ?? {},
    },
    settings: {
      ...createDefaultSaveData().settings,
      ...candidate.settings,
    },
  }
}

export function parseSaveData(text: string): SaveData {
  return migrateSaveData(JSON.parse(text))
}
