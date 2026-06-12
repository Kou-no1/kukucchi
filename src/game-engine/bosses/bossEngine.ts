import {
  bossDifficulties,
  bosses,
  getBossById,
  legendaryBossTitle,
} from '../../data/bosses'
import type { BossDefinition } from '../../data/bosses'
import type {
  BossDifficultyId,
  BossDifficultyProgress,
  BossProgress,
  SaveData,
} from '../../types/save'

const difficultyOrder: BossDifficultyId[] = ['normal', 'hard', 'fast']

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

function countCorrectByCategory(save: SaveData, category: 'square' | 'pi'): number {
  const categoryKey = category === 'square' ? 'multiplication-square' : 'pi-multiplication'
  return save.progress.categoryCorrect[categoryKey] ?? 0
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
    return boss.advancedCategory ? countCorrectByCategory(save, boss.advancedCategory) >= 20 : false
  }
  return boss.stages ? countCorrectForStages(save, boss.stages) >= 20 : false
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
  return difficultyOrder.reduce((stars, difficulty) => {
    return getDifficultyProgress(save, bossId, difficulty).cleared
      ? Math.max(stars, bossDifficulties[difficulty].stars)
      : stars
  }, 0)
}

function hasAllFastClears(save: SaveData): boolean {
  return bosses.every((boss) => getDifficultyProgress(save, boss.id, 'fast').cleared)
}

export function applyBossClearReward(
  save: SaveData,
  bossId: string,
  difficulty: BossDifficultyId,
  elapsedMs: number,
  clearedAt = new Date().toISOString(),
): {
  save: SaveData
  firstClear: boolean
  rewardItemIds: string[]
  rewardTitles: string[]
} {
  const boss = getBossById(bossId)
  if (!boss || !save.player) {
    return { save, firstClear: false, rewardItemIds: [], rewardTitles: [] }
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
  const rewardItemIds = firstClear ? [reward.itemId] : []
  const rewardTitles = firstClear ? [reward.title] : []
  const withDifficulty: SaveData = {
    ...save,
    player: {
      ...save.player,
      titles: Array.from(new Set([...save.player.titles, ...rewardTitles])),
      currentTitle: rewardTitles.at(-1) ?? save.player.currentTitle,
      coins: save.player.coins + (firstClear ? 0 : 12),
    },
    progress: {
      ...save.progress,
      bossItems: Array.from(new Set([...save.progress.bossItems, ...rewardItemIds])),
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

  if (!hasAllFastClears(withDifficulty)) {
    return {
      save: withDifficulty,
      firstClear,
      rewardItemIds,
      rewardTitles,
    }
  }

  const player = withDifficulty.player
  if (!player) {
    return {
      save: withDifficulty,
      firstClear,
      rewardItemIds,
      rewardTitles,
    }
  }
  const titles = Array.from(new Set([...player.titles, legendaryBossTitle]))
  return {
    save: {
      ...withDifficulty,
      player: {
        ...player,
        titles,
        currentTitle: legendaryBossTitle,
      },
    },
    firstClear,
    rewardItemIds,
    rewardTitles: Array.from(new Set([...rewardTitles, legendaryBossTitle])),
  }
}
