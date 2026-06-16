import type { MultiplicationFactProgress } from '../types/game'
import type { CollectionRecord, PlayerData, ProgressData } from '../types/save'
import type { OnboardingInput, SaveData } from '../types/save'
import { allGekimuzuTitle, bosses, bossLimitedItems, legendaryBossTitle } from '../data/bosses'
import { defaultSpeedStages, speedDurations } from '../data/factDifficulty'
import { keyTypes } from '../data/keys'
import { coerceShipName, defaultShipName } from '../data/shipName'
import { specialUfoId } from '../data/ufos'
import { collectionRecordId } from '../game-engine/collection/collectionRecords'
import { DEFAULT_DAILY_BUDGET_MINUTES } from '../game-engine/school/dailyUsage'
import { DEFAULT_SCHOOL_MODE_2_ENABLED } from '../game-engine/school/schoolMode2'
import { titleRecordId } from '../game-engine/rewards/titles'

export const SAVE_DATA_VERSION = 11
const LEGACY_ADVANCED_BOSS_RESET_VERSION = 10

const legacyAdvancedBossIds = ['boss-square', 'boss-pi'] as const
const legacyAdvancedBossIdSet = new Set<string>(legacyAdvancedBossIds)
const legacyAdvancedBossTitles = new Set<string>([
  ...bosses
    .filter((boss) => legacyAdvancedBossIdSet.has(boss.id))
    .flatMap((boss) => Object.values(boss.rewards).map((reward) => reward.title)),
  legendaryBossTitle,
  allGekimuzuTitle,
])
const legacyAdvancedBossItemIds = new Set(
  bossLimitedItems
    .filter((item) => legacyAdvancedBossIdSet.has(item.bossId))
    .map((item) => item.id),
)
const legacyAdvancedUfoIds = new Set([
  ...legacyAdvancedBossIds.map((bossId) => `${bossId}-ufo`),
  specialUfoId,
])
const legacyAdvancedCollectionRecordIds = new Set<string>([
  ...legacyAdvancedBossIds.map((bossId) => collectionRecordId('ufo', `${bossId}-ufo`)),
  collectionRecordId('ufo', specialUfoId),
  ...Array.from(legacyAdvancedBossItemIds).map((itemId) => collectionRecordId('boss-item', itemId)),
  ...Array.from(legacyAdvancedBossTitles).map((title) =>
    collectionRecordId('title', titleRecordId(title)),
  ),
])

function shouldRemoveTimeOnlyMonsterFact(fact: MultiplicationFactProgress): boolean {
  const attempts = fact.correctCount + fact.incorrectCount
  return (
    attempts >= 2 &&
    fact.incorrectCount === 0 &&
    fact.masteryLevel < 4 &&
    fact.averageResponseTimeMs >= 4800
  )
}

function cleanTimeOnlyMonsterFacts(
  facts: Record<string, MultiplicationFactProgress>,
): Record<string, MultiplicationFactProgress> {
  return Object.fromEntries(
    Object.entries(facts).filter(([, fact]) => !shouldRemoveTimeOnlyMonsterFact(fact)),
  )
}

function defaultTreasureKeys(): SaveData['progress']['treasureKeys'] {
  return Object.fromEntries(
    keyTypes.map((key) => [key.id, { count: 0, firstAcquiredAt: null }]),
  )
}

function normalizeTreasureKeys(
  keys: Partial<SaveData['progress']['treasureKeys']> | undefined,
): SaveData['progress']['treasureKeys'] {
  return Object.fromEntries(
    keyTypes.map((key) => {
      const current = keys?.[key.id]
      return [
        key.id,
        {
          count: Math.max(0, current?.count ?? 0),
          firstAcquiredAt: current?.firstAcquiredAt ?? null,
        },
      ]
    }),
  )
}

function normalizeCollectionRecords(records: CollectionRecord[] | undefined): CollectionRecord[] {
  return Array.isArray(records)
    ? records.filter((record) => record.id && record.acquiredAt && record.method)
    : []
}

function normalizePlayer(player: SaveData['player'] | undefined | null): SaveData['player'] {
  if (!player) {
    return null
  }
  const partialPlayer = player as Partial<PlayerData>
  return {
    ...player,
    shipName: coerceShipName(partialPlayer.shipName),
  }
}

function resetLegacyAdvancedBossPlayer(player: SaveData['player']): SaveData['player'] {
  if (!player) {
    return player
  }
  const titles = player.titles.filter((title) => !legacyAdvancedBossTitles.has(title))
  return {
    ...player,
    titles,
    currentTitle: legacyAdvancedBossTitles.has(player.currentTitle)
      ? titles.at(-1) ?? 'はじめのいっぽ'
      : player.currentTitle,
  }
}

function resetLegacyAdvancedBossProgress(progress: ProgressData): ProgressData {
  const bossProgress = { ...progress.bossProgress }
  for (const bossId of legacyAdvancedBossIds) {
    delete bossProgress[bossId]
  }
  const ownedUfos = progress.ownedUfos.filter((ufoId) => !legacyAdvancedUfoIds.has(ufoId))
  return {
    ...progress,
    bossProgress,
    bossItems: progress.bossItems.filter((itemId) => !legacyAdvancedBossItemIds.has(itemId)),
    ownedUfos,
    equippedUfoId:
      progress.equippedUfoId && legacyAdvancedUfoIds.has(progress.equippedUfoId)
        ? ownedUfos[0] ?? null
        : progress.equippedUfoId,
    collectionRecords: progress.collectionRecords.filter(
      (record) => !legacyAdvancedCollectionRecordIds.has(record.id),
    ),
  }
}

function maybeResetLegacyAdvancedBossPlayer(
  player: SaveData['player'],
  shouldReset: boolean,
): SaveData['player'] {
  return shouldReset ? resetLegacyAdvancedBossPlayer(player) : player
}

function maybeResetLegacyAdvancedBossProgress(
  progress: ProgressData,
  shouldReset: boolean,
): ProgressData {
  return shouldReset ? resetLegacyAdvancedBossProgress(progress) : progress
}

export function createDefaultSaveData(): SaveData {
  return {
    version: SAVE_DATA_VERSION,
    player: null,
    settings: {
      soundEnabled: true,
      speechEnabled: true,
      reduceMotion: false,
      dailyBudgetMinutes: DEFAULT_DAILY_BUDGET_MINUTES,
      schoolMode2Enabled: DEFAULT_SCHOOL_MODE_2_ENABLED,
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
      collectionRecords: [],
      ownedTreasureItems: [],
      treasureKeys: defaultTreasureKeys(),
    },
    tutorial: {
      homeSeen: false,
      modeTipsSeen: [],
    },
  }
}

export function createPlayerFromOnboarding(input: OnboardingInput): SaveData {
  const now = new Date().toISOString()
  const firstTitle = 'はじめのいっぽ'
  const defaults = createDefaultSaveData()
  return {
    ...defaults,
    player: {
      nickname: input.nickname.trim() || 'くくとも',
      icon: input.icon,
      shipName: defaultShipName,
      learningLevel: input.learningLevel,
      level: 1,
      exp: 0,
      coins: 0,
      titles: [firstTitle],
      currentTitle: firstTitle,
      createdAt: now,
      lastPlayedAt: now,
    },
    settings: {
      soundEnabled: input.soundEnabled,
      speechEnabled: true,
      reduceMotion: false,
      dailyBudgetMinutes: DEFAULT_DAILY_BUDGET_MINUTES,
      schoolMode2Enabled: DEFAULT_SCHOOL_MODE_2_ENABLED,
    },
    progress: {
      ...defaults.progress,
      collectionRecords: [
        {
          id: collectionRecordId('title', titleRecordId(firstTitle)),
          acquiredAt: now,
          method: '初回設定',
        },
      ],
    },
  }
}

export function migrateSaveData(raw: unknown): SaveData {
  if (!raw || typeof raw !== 'object') {
    return createDefaultSaveData()
  }

  const candidate = raw as Partial<SaveData>
  const defaults = createDefaultSaveData()
  const shouldResetLegacyAdvancedBosses =
    (candidate.version ?? 0) < LEGACY_ADVANCED_BOSS_RESET_VERSION
  if (candidate.version === SAVE_DATA_VERSION) {
    return {
      ...defaults,
      ...candidate,
      player: maybeResetLegacyAdvancedBossPlayer(
        normalizePlayer(candidate.player),
        shouldResetLegacyAdvancedBosses,
      ),
      progress: maybeResetLegacyAdvancedBossProgress(
        {
          ...defaults.progress,
          ...candidate.progress,
          facts: cleanTimeOnlyMonsterFacts(candidate.progress?.facts ?? {}),
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
          collectionRecords: normalizeCollectionRecords(candidate.progress?.collectionRecords),
          ownedTreasureItems: candidate.progress?.ownedTreasureItems ?? [],
          treasureKeys: normalizeTreasureKeys(candidate.progress?.treasureKeys),
        },
        shouldResetLegacyAdvancedBosses,
      ),
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
    player: maybeResetLegacyAdvancedBossPlayer(
      normalizePlayer(candidate.player),
      shouldResetLegacyAdvancedBosses,
    ),
    progress: maybeResetLegacyAdvancedBossProgress(
      {
        ...defaults.progress,
        ...candidate.progress,
        facts: cleanTimeOnlyMonsterFacts(candidate.progress?.facts ?? {}),
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
        collectionRecords: normalizeCollectionRecords(candidate.progress?.collectionRecords),
        ownedTreasureItems: candidate.progress?.ownedTreasureItems ?? [],
        treasureKeys: normalizeTreasureKeys(candidate.progress?.treasureKeys),
      },
      shouldResetLegacyAdvancedBosses,
    ),
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
