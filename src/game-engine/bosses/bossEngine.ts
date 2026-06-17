import {
  allGekimuzuTitle,
  bossDifficulties,
  bosses,
  getBossById,
  getBossDifficulty,
  legendaryBossTitle,
} from '../../data/bosses'
import type { BossAdvancedCategory, BossDefinition } from '../../data/bosses'
import type { KeyTypeId } from '../../data/keys'
import { specialUfoId } from '../../data/ufos'
import { addCollectionRecords } from '../collection/collectionRecords'
import { titleRecordId } from '../rewards/titles'
import type {
  BossDifficultyId,
  BossDifficultyProgress,
  BossProgress,
  SaveData,
} from '../../types/save'

const difficultyOrder: BossDifficultyId[] = ['normal', 'hard', 'fast', 'gekimuzu']
const bossUnlockRequiredCorrect = 20

function createDifficultyProgress(): BossDifficultyProgress {
  return {
    cleared: false,
    clearCount: 0,
    firstClearedAt: null,
    bestTimeMs: null,
  }
}

export function createBossProgress(bossId: string): BossProgress {
  return {
    bossId,
    difficulties: {},
  }
}

export function getBossProgress(save: SaveData, bossId: string): BossProgress {
  return save.progress.bossProgress[bossId] ?? createBossProgress(bossId)
}

export function getDifficultyProgress(
  save: SaveData,
  bossId: string,
  difficulty: BossDifficultyId,
): BossDifficultyProgress {
  return getBossProgress(save, bossId).difficulties[difficulty] ?? createDifficultyProgress()
}

export function countCorrectForStages(save: SaveData, stages: number[]): number {
  const stageSet = new Set(stages)
  return Object.values(save.progress.facts)
    .filter((fact) => stageSet.has(fact.left))
    .reduce((sum, fact) => sum + fact.correctCount, 0)
}

function countCorrectByCategory(save: SaveData, category: BossAdvancedCategory): number {
  if (category === 'square') {
    return save.progress.categoryCorrect['multiplication-square'] ?? 0
  }
  if (category === 'pi') {
    return save.progress.categoryCorrect['pi-multiplication'] ?? 0
  }
  return save.progress.categoryCorrect.development ?? 0
}

function areBasicStageBossesCleared(save: SaveData): boolean {
  return bosses
    .filter((boss) => boss.group === 'basic' && boss.id !== 'boss-all-kuku')
    .every((boss) => getDifficultyProgress(save, boss.id, 'normal').cleared)
}

export function isBossUnlocked(boss: BossDefinition, save: SaveData): boolean {
  if (boss.id === 'boss-all-kuku') {
    return areBasicStageBossesCleared(save)
  }
  if (boss.group === 'advanced') {
    return boss.advancedCategory ? countCorrectByCategory(save, boss.advancedCategory) >= bossUnlockRequiredCorrect : false
  }
  return boss.stages ? countCorrectForStages(save, boss.stages) >= bossUnlockRequiredCorrect : false
}

export function countCorrectForBossUnlock(
  boss: BossDefinition,
  save: SaveData,
): number | null {
  if (boss.id === 'boss-all-kuku') {
    return null
  }
  if (boss.group === 'advanced') {
    return boss.advancedCategory ? countCorrectByCategory(save, boss.advancedCategory) : null
  }
  return boss.stages ? countCorrectForStages(save, boss.stages) : null
}

export function remainingQuestionsToUnlockBoss(
  boss: BossDefinition,
  save: SaveData,
): number | null {
  if (isBossUnlocked(boss, save)) {
    return null
  }
  const currentCorrect = countCorrectForBossUnlock(boss, save)
  if (currentCorrect === null) {
    return null
  }
  return Math.max(0, bossUnlockRequiredCorrect - currentCorrect)
}

export function isDifficultyUnlocked(
  boss: BossDefinition,
  difficulty: BossDifficultyId,
  save: SaveData,
): boolean {
  if (!isBossUnlocked(boss, save)) {
    return false
  }
  const index = difficultyOrder.indexOf(difficulty)
  if (index <= 0) {
    return true
  }
  return getDifficultyProgress(save, boss.id, difficultyOrder[index - 1]).cleared
}

export function getClearedStars(save: SaveData, bossId: string): number {
  const boss = getBossById(bossId)
  return difficultyOrder.reduce((stars, difficulty) => {
    return getDifficultyProgress(save, bossId, difficulty).cleared
      ? Math.max(stars, boss ? getBossDifficulty(boss, difficulty).stars : bossDifficulties[difficulty].stars)
      : stars
  }, 0)
}

function hasAllFastClears(save: SaveData): boolean {
  return bosses.every((boss) => getDifficultyProgress(save, boss.id, 'fast').cleared)
}

function hasAllGekimuzuClears(save: SaveData): boolean {
  return bosses.every((boss) => getDifficultyProgress(save, boss.id, 'gekimuzu').cleared)
}

function addTreasureKeyRewards(
  treasureKeys: SaveData['progress']['treasureKeys'],
  keyIds: KeyTypeId[],
  acquiredAt: string,
): SaveData['progress']['treasureKeys'] {
  if (keyIds.length === 0) {
    return treasureKeys
  }
  const nextTreasureKeys = { ...treasureKeys }
  for (const keyId of keyIds) {
    const current = nextTreasureKeys[keyId] ?? { count: 0, firstAcquiredAt: null }
    nextTreasureKeys[keyId] = {
      count: current.count + 1,
      firstAcquiredAt: current.firstAcquiredAt ?? acquiredAt,
    }
  }
  return nextTreasureKeys
}

export function keyRewardsForBossClear(
  boss: BossDefinition,
  difficulty: BossDifficultyId,
  firstClear: boolean,
): KeyTypeId[] {
  if (!firstClear || difficulty !== 'gekimuzu') {
    return []
  }
  if (boss.group === 'advanced' || boss.id === 'boss-all-kuku') {
    return ['star']
  }
  return ['rainbow']
}

export function applyBossClearReward(
  save: SaveData,
  bossId: string,
  difficulty: BossDifficultyId,
  elapsedMs: number,
  clearedAt = new Date().toISOString(),
  options: { rewardBudgetPaused?: boolean } = {},
): {
  save: SaveData
  firstClear: boolean
  rewardItemIds: string[]
  rewardUfoIds: string[]
  rewardTitles: string[]
  grandReward: boolean
} {
  const boss = getBossById(bossId)
  if (!boss || !save.player) {
    return {
      save,
      firstClear: false,
      rewardItemIds: [],
      rewardUfoIds: [],
      rewardTitles: [],
      grandReward: false,
    }
  }

  const currentBossProgress = getBossProgress(save, bossId)
  const currentDifficulty = getDifficultyProgress(save, bossId, difficulty)
  const firstClear = !currentDifficulty.cleared
  const nextDifficulty: BossDifficultyProgress = {
    cleared: true,
    clearCount: currentDifficulty.clearCount + 1,
    firstClearedAt: currentDifficulty.firstClearedAt ?? clearedAt,
    bestTimeMs:
      currentDifficulty.bestTimeMs === null
        ? elapsedMs
        : Math.min(currentDifficulty.bestTimeMs, elapsedMs),
  }

  const reward = boss.rewards[difficulty]
  const rewardItemIds = firstClear && reward.itemId ? [reward.itemId] : []
  const rewardUfoIds = firstClear && reward.ufoId ? [reward.ufoId] : []
  const rewardTitles = firstClear ? [reward.title] : []
  const rewardKeyIds = keyRewardsForBossClear(boss, difficulty, firstClear)
  const withDifficulty: SaveData = {
    ...save,
    player: {
      ...save.player,
      titles: Array.from(new Set([...save.player.titles, ...rewardTitles])),
      currentTitle: rewardTitles.at(-1) ?? save.player.currentTitle,
      coins: save.player.coins + (firstClear || options.rewardBudgetPaused ? 0 : 12),
    },
    progress: {
      ...save.progress,
      bossItems: Array.from(new Set([...save.progress.bossItems, ...rewardItemIds])),
      ownedUfos: Array.from(new Set([...save.progress.ownedUfos, ...rewardUfoIds])),
      equippedUfoId: save.progress.equippedUfoId ?? rewardUfoIds[0] ?? null,
      treasureKeys: addTreasureKeyRewards(save.progress.treasureKeys, rewardKeyIds, clearedAt),
      collectionRecords: addCollectionRecords(save.progress.collectionRecords, [
        ...rewardItemIds.map((itemId) => ({
          kind: 'boss-item',
          id: itemId,
          acquiredAt: clearedAt,
          method: `${boss.label} ${getBossDifficulty(boss, difficulty).label}`,
        })),
        ...rewardUfoIds.map((ufoId) => ({
          kind: 'ufo',
          id: ufoId,
          acquiredAt: clearedAt,
          method: `${boss.label} げきムズ`,
        })),
        ...rewardTitles.map((title) => ({
          kind: 'title',
          id: titleRecordId(title),
          acquiredAt: clearedAt,
          method: `${boss.label} ${getBossDifficulty(boss, difficulty).label}`,
        })),
      ]),
      bossProgress: {
        ...save.progress.bossProgress,
        [bossId]: {
          ...currentBossProgress,
          difficulties: {
            ...currentBossProgress.difficulties,
            [difficulty]: nextDifficulty,
          },
        },
      },
    },
  }

  const player = withDifficulty.player
  if (!player) {
    return {
      save: withDifficulty,
      firstClear,
      rewardItemIds,
      rewardUfoIds,
      rewardTitles,
      grandReward: false,
    }
  }

  const shouldGrantLegendary =
    hasAllFastClears(withDifficulty) && !player.titles.includes(legendaryBossTitle)
  const withLegendary: SaveData = shouldGrantLegendary
    ? {
        ...withDifficulty,
        player: {
          ...player,
          titles: Array.from(new Set([...player.titles, legendaryBossTitle])),
          currentTitle: legendaryBossTitle,
        },
        progress: {
          ...withDifficulty.progress,
          collectionRecords: addCollectionRecords(withDifficulty.progress.collectionRecords, [
            {
              kind: 'title',
              id: titleRecordId(legendaryBossTitle),
              acquiredAt: clearedAt,
              method: '全ボスさいそく',
            },
          ]),
        },
      }
    : withDifficulty
  const legendaryTitles = shouldGrantLegendary ? [legendaryBossTitle] : []

  const currentOwnedUfos = withLegendary.progress.ownedUfos
  const shouldGrantGrandReward =
    difficulty === 'gekimuzu' &&
    hasAllGekimuzuClears(withLegendary) &&
    !currentOwnedUfos.includes(specialUfoId)
  if (!shouldGrantGrandReward) {
    return {
      save: withLegendary,
      firstClear,
      rewardItemIds,
      rewardUfoIds,
      rewardTitles: Array.from(new Set([...rewardTitles, ...legendaryTitles])),
      grandReward: false,
    }
  }

  const grandPlayer = withLegendary.player
  if (!grandPlayer) {
    return {
      save: withLegendary,
      firstClear,
      rewardItemIds,
      rewardUfoIds,
      rewardTitles: Array.from(new Set([...rewardTitles, ...legendaryTitles])),
      grandReward: false,
    }
  }
  const allRewardTitles = Array.from(
    new Set([...rewardTitles, ...legendaryTitles, allGekimuzuTitle]),
  )
  const allRewardUfos = Array.from(new Set([...rewardUfoIds, specialUfoId]))
  return {
    save: {
      ...withLegendary,
      player: {
        ...grandPlayer,
        titles: Array.from(new Set([...grandPlayer.titles, allGekimuzuTitle])),
        currentTitle: allGekimuzuTitle,
      },
      progress: {
        ...withLegendary.progress,
        ownedUfos: Array.from(new Set([...withLegendary.progress.ownedUfos, specialUfoId])),
        equippedUfoId: withLegendary.progress.equippedUfoId ?? specialUfoId,
        collectionRecords: addCollectionRecords(withLegendary.progress.collectionRecords, [
          {
            kind: 'ufo',
            id: specialUfoId,
            acquiredAt: clearedAt,
            method: '全ボスげきムズ',
          },
          {
            kind: 'title',
            id: titleRecordId(allGekimuzuTitle),
            acquiredAt: clearedAt,
            method: '全ボスげきムズ',
          },
        ]),
      },
    },
    firstClear,
    rewardItemIds,
    rewardUfoIds: allRewardUfos,
    rewardTitles: allRewardTitles,
    grandReward: true,
  }
}
