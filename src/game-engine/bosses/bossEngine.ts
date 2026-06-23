import {
  bossDifficulties,
  bosses,
  additionLegendTitle,
  additionMasterTitle,
  getBossById,
  getBossDifficulty,
  legendaryBossTitle,
} from '../../data/bosses'
import type { BossAdvancedCategory, BossDefinition } from '../../data/bosses'
import type { KeyTypeId } from '../../data/keys'
import { galaxySwirlEffectId } from '../../data/shopItems'
import { specialUfoId } from '../../data/ufos'
import { addCollectionRecords } from '../collection/collectionRecords'
import { isAdditionFactProgress, isMultiplicationFactProgress } from '../questions/factIds'
import { grantFinalTitleIfEarned } from '../rewards/finalTitle'
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
    .filter((fact) => isMultiplicationFactProgress(fact) && stageSet.has(fact.left))
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

function countCorrectForAdditionArea(save: SaveData, areaId: string): number {
  const categoryCount = save.progress.categoryCorrect[`addition:${areaId}`]
  if (typeof categoryCount === 'number') {
    return categoryCount
  }
  return Object.values(save.progress.facts)
    .filter((fact) => isAdditionFactProgress(fact) && fact.areaId === areaId)
    .reduce((sum, fact) => sum + fact.correctCount, 0)
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
  if (boss.group === 'addition') {
    return boss.additionAreaId ? countCorrectForAdditionArea(save, boss.additionAreaId) >= bossUnlockRequiredCorrect : false
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
  if (boss.group === 'addition') {
    return boss.additionAreaId ? countCorrectForAdditionArea(save, boss.additionAreaId) : null
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
  return bosses
    .filter((boss) => boss.group !== 'addition')
    .every((boss) => getDifficultyProgress(save, boss.id, 'fast').cleared)
}

function hasAllGekimuzuClears(save: SaveData): boolean {
  return bosses
    .filter((boss) => boss.group !== 'addition')
    .every((boss) => getDifficultyProgress(save, boss.id, 'gekimuzu').cleared)
}

function hasAllAdditionNormalClears(save: SaveData): boolean {
  const additionBosses = bosses.filter((boss) => boss.group === 'addition')
  return additionBosses.length > 0 && additionBosses.every((boss) => getDifficultyProgress(save, boss.id, 'normal').cleared)
}

function hasAllAdditionGekimuzuClears(save: SaveData): boolean {
  const additionBosses = bosses.filter((boss) => boss.group === 'addition')
  return additionBosses.length > 0 && additionBosses.every((boss) => getDifficultyProgress(save, boss.id, 'gekimuzu').cleared)
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
  if (boss.group === 'addition') {
    return []
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
  rewardEffectIds: string[]
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
      rewardEffectIds: [],
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
  const rewardEffectIds = firstClear && reward.effectId ? [reward.effectId] : []
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
      ownedItems: Array.from(new Set([...save.progress.ownedItems, ...rewardEffectIds])),
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
        ...rewardEffectIds.map((effectId) => ({
          kind: 'effect',
          id: effectId,
          acquiredAt: clearedAt,
          method: `${boss.label} ${getBossDifficulty(boss, difficulty).label}`,
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
      rewardEffectIds,
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
  const additionTitlesToGrant = [
    boss.group === 'addition' &&
    hasAllAdditionNormalClears(withLegendary) &&
    !withLegendary.player?.titles.includes(additionMasterTitle)
      ? additionMasterTitle
      : null,
    boss.group === 'addition' &&
    difficulty === 'gekimuzu' &&
    hasAllAdditionGekimuzuClears(withLegendary) &&
    !withLegendary.player?.titles.includes(additionLegendTitle)
      ? additionLegendTitle
      : null,
  ].filter((title): title is string => Boolean(title))
  const withAdditionTitles: SaveData =
    additionTitlesToGrant.length > 0 && withLegendary.player
      ? {
          ...withLegendary,
          player: {
            ...withLegendary.player,
            titles: Array.from(new Set([...withLegendary.player.titles, ...additionTitlesToGrant])),
            currentTitle: additionTitlesToGrant.at(-1) ?? withLegendary.player.currentTitle,
          },
          progress: {
            ...withLegendary.progress,
            collectionRecords: addCollectionRecords(
              withLegendary.progress.collectionRecords,
              additionTitlesToGrant.map((title) => ({
                kind: 'title',
                id: titleRecordId(title),
                acquiredAt: clearedAt,
                method: title === additionMasterTitle ? 'たしざん全エリアボス' : 'たしざん全エリアげきムズ',
              })),
            ),
          },
        }
      : withLegendary

  const currentOwnedUfos = withAdditionTitles.progress.ownedUfos
  const currentOwnedItems = withAdditionTitles.progress.ownedItems
  const shouldGrantGrandReward =
    difficulty === 'gekimuzu' &&
    hasAllGekimuzuClears(withAdditionTitles) &&
    (!currentOwnedUfos.includes(specialUfoId) ||
      !currentOwnedItems.includes(galaxySwirlEffectId))
  if (!shouldGrantGrandReward) {
    const finalTitleResult = grantFinalTitleIfEarned(withAdditionTitles, clearedAt)
    const finalTitle = finalTitleResult.granted ? finalTitleResult.save.player?.currentTitle : null
    return {
      save: finalTitleResult.save,
      firstClear,
      rewardItemIds,
      rewardUfoIds,
      rewardEffectIds,
      rewardTitles: Array.from(
        new Set([...rewardTitles, ...legendaryTitles, ...additionTitlesToGrant, ...(finalTitle ? [finalTitle] : [])]),
      ),
      grandReward: finalTitleResult.granted,
    }
  }

  const grandPlayer = withAdditionTitles.player
  if (!grandPlayer) {
    return {
      save: withAdditionTitles,
      firstClear,
      rewardItemIds,
      rewardUfoIds,
      rewardEffectIds,
      rewardTitles: Array.from(new Set([...rewardTitles, ...legendaryTitles, ...additionTitlesToGrant])),
      grandReward: false,
    }
  }
  const allRewardUfos = Array.from(new Set([...rewardUfoIds, specialUfoId]))
  const withGrandReward: SaveData = {
    ...withAdditionTitles,
    progress: {
      ...withAdditionTitles.progress,
      ownedUfos: Array.from(new Set([...withAdditionTitles.progress.ownedUfos, specialUfoId])),
      ownedItems: Array.from(new Set([...withAdditionTitles.progress.ownedItems, galaxySwirlEffectId])),
      equippedUfoId: withAdditionTitles.progress.equippedUfoId ?? specialUfoId,
      collectionRecords: addCollectionRecords(withAdditionTitles.progress.collectionRecords, [
        {
          kind: 'ufo',
          id: specialUfoId,
          acquiredAt: clearedAt,
          method: '全ボスげきムズ',
        },
        {
          kind: 'effect',
          id: galaxySwirlEffectId,
          acquiredAt: clearedAt,
          method: '全ボスげきムズ',
        },
      ]),
    },
  }
  const finalTitleResult = grantFinalTitleIfEarned(withGrandReward, clearedAt)
  const finalTitle = finalTitleResult.granted ? finalTitleResult.save.player?.currentTitle : null
  return {
    save: finalTitleResult.save,
    firstClear,
    rewardItemIds,
    rewardUfoIds: allRewardUfos,
    rewardEffectIds: Array.from(new Set([...rewardEffectIds, galaxySwirlEffectId])),
    rewardTitles: Array.from(
      new Set([...rewardTitles, ...legendaryTitles, ...additionTitlesToGrant, ...(finalTitle ? [finalTitle] : [])]),
    ),
    grandReward: true,
  }
}
