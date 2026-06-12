import type { OnboardingInput, SaveData } from '../types/save'
import { defaultSpeedStages, speedDurations } from '../data/factDifficulty'

export const SAVE_DATA_VERSION = 4

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
      categoryCorrect: {},
      bossProgress: {},
      bossItems: [],
      ownedUfos: [],
      equippedUfoId: null,
      ownedItems: ['basic-room'],
      equippedItems: ['basic-room'],
      speedSettings: {
        selectedStages: [...defaultSpeedStages],
        durationSeconds: speedDurations[0],
      },
      rocketBestDistance: 0,
      rocketBadges: [],
    },
    tutorial: {
      homeSeen: false,
      modeTipsSeen: [],
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
  const defaults = createDefaultSaveData()
  if (candidate.version === SAVE_DATA_VERSION) {
    return {
      ...defaults,
      ...candidate,
      progress: {
        ...defaults.progress,
        ...candidate.progress,
        facts: candidate.progress?.facts ?? {},
        categoryCorrect: candidate.progress?.categoryCorrect ?? {},
        bossProgress: candidate.progress?.bossProgress ?? {},
        bossItems: candidate.progress?.bossItems ?? [],
        ownedUfos: candidate.progress?.ownedUfos ?? [],
        equippedUfoId: candidate.progress?.equippedUfoId ?? null,
        speedSettings: {
          ...defaults.progress.speedSettings,
          ...candidate.progress?.speedSettings,
          selectedStages:
            candidate.progress?.speedSettings?.selectedStages ??
            defaults.progress.speedSettings.selectedStages,
          durationSeconds:
            candidate.progress?.speedSettings?.durationSeconds ??
            defaults.progress.speedSettings.durationSeconds,
        },
        rocketBestDistance: candidate.progress?.rocketBestDistance ?? 0,
        rocketBadges: candidate.progress?.rocketBadges ?? [],
      },
      settings: {
        ...defaults.settings,
        ...candidate.settings,
      },
      tutorial: {
        ...defaults.tutorial,
        ...candidate.tutorial,
      },
    }
  }

  return {
    ...defaults,
    ...candidate,
    version: SAVE_DATA_VERSION,
    progress: {
      ...defaults.progress,
      ...candidate.progress,
      facts: candidate.progress?.facts ?? {},
      categoryCorrect: candidate.progress?.categoryCorrect ?? {},
      bossProgress: candidate.progress?.bossProgress ?? {},
      bossItems: candidate.progress?.bossItems ?? [],
      ownedUfos: candidate.progress?.ownedUfos ?? [],
      equippedUfoId: candidate.progress?.equippedUfoId ?? null,
      speedSettings: {
        ...defaults.progress.speedSettings,
        ...candidate.progress?.speedSettings,
        selectedStages:
          candidate.progress?.speedSettings?.selectedStages ??
          defaults.progress.speedSettings.selectedStages,
        durationSeconds:
          candidate.progress?.speedSettings?.durationSeconds ??
          defaults.progress.speedSettings.durationSeconds,
      },
      rocketBestDistance: candidate.progress?.rocketBestDistance ?? 0,
      rocketBadges: candidate.progress?.rocketBadges ?? [],
    },
    settings: {
      ...defaults.settings,
      ...candidate.settings,
    },
    tutorial: {
      ...defaults.tutorial,
      ...candidate.tutorial,
    },
  }
}

export function parseSaveData(text: string): SaveData {
  return migrateSaveData(JSON.parse(text))
}
