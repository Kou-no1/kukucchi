import { describe, expect, it } from 'vitest'
import { isCorrectAnswer } from '../game-engine/questions/answer'
import {
  generateAdaptiveMultiplicationQuestion,
  generateAdvancedQuestion,
  generateChoices,
  generateMissingFactorQuestion,
  generateMultiplicationQuestion,
} from '../game-engine/questions/questionGenerator'
import {
  createMultiplicationFactPool,
  factDifficulty,
} from '../game-engine/questions/factDifficulty'
import {
  applyAnswerToScore,
  calculateSpeedBonus,
} from '../game-engine/scoring/score'
import { calculateCoins, calculateExp, expProgressToNextLevel } from '../game-engine/rewards/rewards'
import { judgeNewTitles } from '../game-engine/rewards/titles'
import {
  createFactProgress,
  updateFactProgress,
} from '../game-engine/mastery/mastery'
import { getWeakFacts, isMonsterFact, isMonsterOvercome } from '../game-engine/review/weakFacts'
import { generateDailyMissions } from '../game-engine/missions/missions'
import { formatKukuReading, kukuReadings } from '../data/kukuReadings'
import { bosses } from '../data/bosses'
import { canKeyOpenChest, keyTypes, treasureChestTypes } from '../data/keys'
import { equipShopItem, getEquippedItemForSlot, isShopTier2Unlocked, shopItems } from '../data/shopItems'
import { treasureItems } from '../data/treasureItems'
import { getUfoForBoss, specialUfoId } from '../data/ufos'
import {
  applyBossClearReward,
  getDifficultyProgress,
  isBossUnlocked,
  isDifficultyUnlocked,
} from '../game-engine/bosses/bossEngine'
import { calculateBookProgress } from '../game-engine/collection/bookProgress'
import {
  createSeededRandom,
  getTreasurePoolForChest,
  openTreasureChest,
} from '../game-engine/treasure/treasureEngine'
import { createDefaultSaveData, migrateSaveData } from '../storage/saveData'
import type { AnswerResult, GameSessionSummary } from '../types/game'
import type { SaveData } from '../types/save'

function result(overrides: Partial<AnswerResult> = {}): AnswerResult {
  return {
    questionId: '7x8',
    prompt: '7 × 8',
    expectedAnswer: 56,
    givenAnswer: 56,
    correct: true,
    difficulty: 5,
    responseTimeMs: 1200,
    answeredAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

function createSaveWithPlayer(): SaveData {
  return {
    ...createDefaultSaveData(),
    player: {
      nickname: 'テスト',
      icon: 'たまご',
      learningLevel: 'first' as const,
      level: 1,
      exp: 0,
      coins: 0,
      titles: [],
      currentTitle: 'はじめのいっぽ',
      createdAt: '2026-01-01T00:00:00.000Z',
      lastPlayedAt: null,
    },
  }
}

describe('question generation', () => {
  it('maps multiplication facts to teacher-adjustable difficulty stars', () => {
    const expectations: Array<[number, number, number]> = [
      [2, 1, 1],
      [9, 1, 1],
      [2, 5, 2],
      [2, 3, 2],
      [5, 5, 2],
      [5, 4, 2],
      [3, 4, 3],
      [2, 7, 3],
      [5, 9, 3],
      [4, 4, 3],
      [3, 6, 3],
      [6, 6, 4],
      [4, 7, 4],
      [9, 9, 4],
      [3, 8, 4],
      [6, 9, 4],
      [6, 7, 5],
      [7, 8, 5],
      [8, 6, 5],
      [7, 7, 5],
      [7, 9, 5],
      [8, 9, 5],
    ]
    for (const [left, right, difficulty] of expectations) {
      expect(factDifficulty(left, right)).toBe(difficulty)
    }

    const allFacts = createMultiplicationFactPool({
      stages: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      minDifficulty: 1,
    })
    expect(allFacts.filter((fact) => fact.difficulty === 1)).toHaveLength(17)
    expect(allFacts.filter((fact) => fact.difficulty === 5)).toHaveLength(12)
  })

  it('generates multiplication questions with unique choices', () => {
    const question = generateMultiplicationQuestion({
      stage: 7,
      rng: () => 0.75,
    })
    expect(question.category).toBe('multiplication-basic')
    expect(question.prompt).toContain('7 ×')
    expect(new Set(question.choices).size).toBe(4)
    expect(question.choices).toContain(question.answer)
  })

  it('filters multiplication pools by minDifficulty and relaxes empty pools', () => {
    const hardPool = createMultiplicationFactPool({ stages: [7], minDifficulty: 5 })
    expect(hardPool.length).toBeGreaterThan(0)
    expect(hardPool.every((fact) => fact.left === 7 && fact.difficulty >= 5)).toBe(true)

    const relaxedPool = createMultiplicationFactPool({ stages: [1], minDifficulty: 5 })
    expect(relaxedPool.length).toBe(9)
    expect(relaxedPool.every((fact) => fact.left === 1 && fact.difficulty === 1)).toBe(true)
  })

  it('generates speed questions only from selected stages', () => {
    const questions = Array.from({ length: 20 }, () =>
      generateMultiplicationQuestion({
        stages: [4],
        answerMode: 'choice',
        minDifficulty: 1,
        rng: () => 0.35,
      }),
    )
    expect(questions.every((question) => question.metadata?.left === 4)).toBe(true)
  })

  it('keeps generated choices unique and includes close mistakes', () => {
    const choices = generateChoices(56, 7, 8, () => 0.2)
    expect(new Set(choices).size).toBe(4)
    expect(choices).toContain(56)
    expect(choices.some((choice) => [49, 54, 63, 64].includes(choice))).toBe(true)
  })

  it('generates missing-factor questions with consistent answers', () => {
    const question = generateMissingFactorQuestion(6, 7, { rng: () => 0.2 })
    expect(question.prompt).toContain('□')
    expect(question.prompt).toContain('42')
    expect(question.answer).toBe(6)
    expect(new Set(question.choices).size).toBe(4)
    expect(question.choices).toContain(6)
    expect(question.metadata?.missingFactor).toBe(true)
  })

  it('checks numeric and full-width answers', () => {
    const question = generateMultiplicationQuestion({ stage: 3, rng: () => 0.4 })
    expect(isCorrectAnswer(question, String(question.answer))).toBe(true)
    expect(isCorrectAnswer({ ...question, answer: 12 }, '１２')).toBe(true)
  })

  it('prioritizes review facts in adaptive generation', () => {
    const weak = createFactProgress(8, 9)
    const question = generateAdaptiveMultiplicationQuestion(
      {
        [weak.id]: {
          ...weak,
          correctCount: 1,
          incorrectCount: 4,
          averageResponseTimeMs: 6000,
          nextReviewAt: '2025-12-31T00:00:00.000Z',
        },
      },
      { rng: () => 0.1 },
    )
    expect(question.id).toBe('8x9')
  })

  it('generates advanced square and pi questions with choices', () => {
    const square = generateAdvancedQuestion('square', () => 0.2)
    const pi = generateAdvancedQuestion('pi', () => 0.2)
    const development = generateAdvancedQuestion('development', () => 0.2)
    expect(square.category).toBe('multiplication-square')
    expect(pi.category).toBe('pi-multiplication')
    expect(square.choices).toContain(square.answer)
    expect(pi.choices).toContain(pi.answer)
    expect(development.choices).toContain(development.answer)
  })
})

describe('scoring and rewards', () => {
  it('calculates score, combo, and fast-tap guard', () => {
    expect(calculateSpeedBonus(399)).toBe(0)
    const next = applyAnswerToScore({ score: 0, combo: 4, maxCombo: 4 }, true, 1000)
    expect(next.combo).toBe(5)
    expect(next.maxCombo).toBe(5)
    expect(next.score).toBeGreaterThan(100)
    expect(applyAnswerToScore(next, false, 2000).combo).toBe(0)
  })

  it('calculates coins, exp, and titles', () => {
    const results = Array.from({ length: 10 }, (_, index) =>
      result({ questionId: `2x${(index % 9) + 1}` }),
    )
    expect(calculateCoins(results, 10)).toBeGreaterThan(0)
    expect(calculateExp(results)).toBeGreaterThan(80)

    const save = createDefaultSaveData()
    const summary: GameSessionSummary = {
      id: 'test',
      mode: 'speed',
      totalQuestions: 10,
      correctCount: 10,
      accuracy: 100,
      averageResponseTimeMs: 2500,
      maxCombo: 10,
      score: 1500,
      earnedCoins: 36,
      earnedExp: 100,
      newTitles: [],
      bestUpdated: false,
      weakFacts: [],
      masteredFacts: [],
      results,
      finishedAt: '2026-01-01T00:00:00.000Z',
    }
    expect(judgeNewTitles(summary, save)).toContain('くくファイター')
  })

  it('scales earned exp with question difficulty without changing coins', () => {
    const easy = result({ questionId: '2x1', difficulty: 1 })
    const hard = result({ questionId: '7x8', difficulty: 5 })
    expect(calculateExp([hard])).toBeGreaterThan(calculateExp([easy]))
    expect(calculateExp([easy, hard])).toBe(20)
    expect(calculateCoins([easy, hard], 2)).toBe(6)
  })

  it('calculates level progress around level boundaries', () => {
    expect(expProgressToNextLevel(79)).toMatchObject({
      level: 1,
      remainingExp: 1,
      percent: 99,
    })
    expect(expProgressToNextLevel(80)).toMatchObject({
      level: 2,
      remainingExp: 240,
      percent: 0,
    })
  })
})

describe('mastery, review, missions, and storage', () => {
  it('updates mastery without treating one streak as complete mastery', () => {
    let progress = createFactProgress(7, 8)
    progress = updateFactProgress(progress, result())
    progress = updateFactProgress(
      progress,
      result({ answeredAt: '2026-01-02T00:00:00.000Z' }),
    )
    expect(progress.correctCount).toBe(2)
    expect(progress.masteryLevel).toBeLessThan(5)
    expect(progress.nextReviewAt).toBeTruthy()
  })

  it('extracts weak facts by accuracy and response time', () => {
    const weak = createFactProgress(6, 7)
    const strong = createFactProgress(2, 3)
    const facts = {
      [weak.id]: { ...weak, correctCount: 1, incorrectCount: 4, averageResponseTimeMs: 5000 },
      [strong.id]: {
        ...strong,
        correctCount: 5,
        incorrectCount: 0,
        averageResponseTimeMs: 1000,
      },
    }
    expect(getWeakFacts(facts, 1)[0]?.id).toBe('6x7')
  })

  it('registers visible nigate monsters only from wrong answers', () => {
    const slowCorrect = {
      ...createFactProgress(7, 8),
      correctCount: 2,
      incorrectCount: 0,
      averageResponseTimeMs: 7000,
      masteryLevel: 2 as const,
      recentResults: [
        result({ correct: true, responseTimeMs: 7200 }),
        result({ correct: true, responseTimeMs: 6800 }),
      ],
    }
    const wrong = {
      ...createFactProgress(6, 7),
      correctCount: 0,
      incorrectCount: 1,
      averageResponseTimeMs: 1300,
      masteryLevel: 1 as const,
      recentResults: [result({ correct: false, questionId: '6x7', expectedAnswer: 42, givenAnswer: 41 })],
    }
    expect(isMonsterFact(slowCorrect)).toBe(false)
    expect(isMonsterFact(wrong)).toBe(true)
  })

  it('overcomes nigate monsters with three correct answers across another day', () => {
    let progress = createFactProgress(6, 7)
    progress = updateFactProgress(
      progress,
      result({
        questionId: '6x7',
        expectedAnswer: 42,
        givenAnswer: 41,
        correct: false,
        answeredAt: '2026-01-01T09:00:00.000Z',
      }),
    )
    progress = updateFactProgress(
      progress,
      result({
        questionId: '6x7',
        expectedAnswer: 42,
        givenAnswer: 42,
        correct: true,
        responseTimeMs: 9000,
        answeredAt: '2026-01-01T10:00:00.000Z',
      }),
    )
    progress = updateFactProgress(
      progress,
      result({
        questionId: '6x7',
        expectedAnswer: 42,
        givenAnswer: 42,
        correct: true,
        responseTimeMs: 9000,
        answeredAt: '2026-01-01T11:00:00.000Z',
      }),
    )
    expect(isMonsterOvercome(progress)).toBe(false)
    progress = updateFactProgress(
      progress,
      result({
        questionId: '6x7',
        expectedAnswer: 42,
        givenAnswer: 42,
        correct: true,
        responseTimeMs: 9000,
        answeredAt: '2026-01-02T09:00:00.000Z',
      }),
    )
    expect(isMonsterOvercome(progress)).toBe(true)
    expect(isMonsterFact(progress)).toBe(false)
  })

  it('generates daily missions and migrates save data', () => {
    const save = createDefaultSaveData()
    expect(generateDailyMissions(save, new Date('2026-01-01')).length).toBe(3)
    const migrated = migrateSaveData({ version: 1 })
    expect(migrated.version).toBe(6)
    expect(migrated.tutorial.homeSeen).toBe(false)
    expect(migrated.progress.bossProgress).toEqual({})
    expect(migrated.progress.ownedUfos).toEqual([])
    expect(migrated.progress.equippedUfoId).toBeNull()
    expect(migrated.progress.speedSettings.selectedStages).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
    expect(migrated.progress.rocketBestDistance).toBe(0)
    expect(migrated.progress.rocketBadges).toEqual([])
    expect(migrated.progress.ownedTreasureItems).toEqual([])
    expect(Object.keys(migrated.progress.treasureKeys)).toHaveLength(5)
  })

  it('migrates v4 save data into v6 and removes time-only monsters', () => {
    const timeOnly = {
      ...createFactProgress(8, 8),
      correctCount: 2,
      incorrectCount: 0,
      averageResponseTimeMs: 6200,
      masteryLevel: 2 as const,
      recentResults: [
        result({ questionId: '8x8', expectedAnswer: 64, givenAnswer: 64, correct: true, responseTimeMs: 6400 }),
        result({ questionId: '8x8', expectedAnswer: 64, givenAnswer: 64, correct: true, responseTimeMs: 6000 }),
      ],
    }
    const wrong = {
      ...createFactProgress(7, 8),
      correctCount: 0,
      incorrectCount: 1,
      averageResponseTimeMs: 1200,
      masteryLevel: 1 as const,
      recentResults: [result({ questionId: '7x8', expectedAnswer: 56, givenAnswer: 54, correct: false })],
    }
    const v4Save = {
      ...createDefaultSaveData(),
      version: 4,
      progress: {
        ...createDefaultSaveData().progress,
        facts: {
          [timeOnly.id]: timeOnly,
          [wrong.id]: wrong,
        },
      },
    }
    const migrated = migrateSaveData(v4Save)
    expect(migrated.version).toBe(6)
    expect(migrated.progress.speedSettings.durationSeconds).toBe(30)
    expect(migrated.progress.speedSettings.selectedStages).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
    expect(migrated.progress.rocketBestDistance).toBe(0)
    expect(migrated.progress.rocketBadges).toEqual([])
    expect(migrated.progress.ownedTreasureItems).toEqual([])
    expect(migrated.progress.treasureKeys.bronze.count).toBe(0)
    expect(migrated.progress.facts[timeOnly.id]).toBeUndefined()
    expect(migrated.progress.facts[wrong.id]).toBeTruthy()
  })

  it('opens treasure chests deterministically with rarity bands and no duplicate while pool remains', () => {
    const first = openTreasureChest({
      chestId: 'rainbow-chest',
      ownedItemIds: [],
      rng: createSeededRandom(123),
      openedAt: '2026-01-03T00:00:00.000Z',
    })
    const repeat = openTreasureChest({
      chestId: 'rainbow-chest',
      ownedItemIds: [],
      rng: createSeededRandom(123),
      openedAt: '2026-01-03T00:00:00.000Z',
    })
    expect(first.item?.id).toBe(repeat.item?.id)
    expect(first.item?.rarity).toBeGreaterThanOrEqual(3)
    expect(first.item?.rarity).toBeLessThanOrEqual(4)
    expect(first.item).toBeTruthy()

    const next = openTreasureChest({
      chestId: 'rainbow-chest',
      ownedItemIds: first.item ? [first.item.id] : [],
      rng: createSeededRandom(123),
    })
    expect(next.duplicate).toBe(false)
    expect(next.poolExhausted).toBe(false)
    expect(next.item?.id).not.toBe(first.item?.id)
    expect(next.convertedCoins).toBe(0)
  })

  it('converts to fixed coins when a chest rarity pool is exhausted', () => {
    const rainbowPoolIds = getTreasurePoolForChest('rainbow-chest').map((item) => item.id)
    const exhausted = openTreasureChest({
      chestId: 'rainbow-chest',
      ownedItemIds: rainbowPoolIds,
      rng: createSeededRandom(999),
    })
    expect(exhausted.item).toBeNull()
    expect(exhausted.poolExhausted).toBe(true)
    expect(exhausted.convertedCoins).toBe(110)
  })

  it('defines key and chest mapping without misses', () => {
    expect(keyTypes).toHaveLength(5)
    expect(treasureChestTypes).toHaveLength(5)
    for (const key of keyTypes) {
      expect(canKeyOpenChest(key.id, key.chestId)).toBe(true)
    }
    expect(canKeyOpenChest('bronze', 'star-chest')).toBe(false)
    expect(treasureItems).toHaveLength(20)
    expect(treasureChestTypes.map((chest) => chest.rarityRange)).toEqual([
      [1, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 4],
    ])
    expect(treasureChestTypes.map((chest) => chest.exhaustedCoins)).toEqual([
      20,
      40,
      70,
      110,
      160,
    ])
  })

  it('keeps treasure rarity balanced as five themes by four rarities', () => {
    const themes = ['star', 'space', 'sparkle', 'creature', 'sweets'] as const
    const rarities = [1, 2, 3, 4] as const
    for (const rarity of rarities) {
      expect(treasureItems.filter((item) => item.rarity === rarity)).toHaveLength(5)
    }
    for (const theme of themes) {
      for (const rarity of rarities) {
        expect(
          treasureItems.filter((item) => item.theme === theme && item.rarity === rarity),
        ).toHaveLength(1)
      }
    }
    expect(new Set(getTreasurePoolForChest('star-chest').map((item) => item.theme))).toEqual(
      new Set(themes),
    )
  })

  it('calculates book collection progress by tab and overall', () => {
    const save = createSaveWithPlayer()
    const withCollection: SaveData = {
      ...save,
      progress: {
        ...save.progress,
        monsterBook: ['2x2'],
        ownedTreasureItems: [
          { id: treasureItems[0].id, acquiredAt: '2026-01-03T00:00:00.000Z', method: 'どうのたからばこから入手' },
        ],
        treasureKeys: {
          ...save.progress.treasureKeys,
          bronze: { count: 1, firstAcquiredAt: '2026-01-03T00:00:00.000Z' },
        },
      },
    }
    const progress = calculateBookProgress(withCollection)
    expect(progress.tabs.monsters.owned).toBe(1)
    expect(progress.tabs.collection.owned).toBe(2)
    expect(progress.tabs.collection.total).toBe(25)
    expect(progress.overall.owned).toBeGreaterThanOrEqual(3)
  })

  it('validates shop prices and tier unlock rules', () => {
    expect(shopItems).toHaveLength(20)
    const prices = shopItems.map((item) => item.price)
    expect(prices.at(0)).toBe(50)
    expect(prices.at(-1)).toBe(10000)
    expect(prices.every((price, index) => index === 0 || price >= prices[index - 1])).toBe(true)
    expect(Math.max(...prices)).toBe(10000)
    expect(isShopTier2Unlocked(shopItems.slice(0, 9).map((item) => item.id))).toBe(false)
    expect(isShopTier2Unlocked(shopItems.slice(0, 10).map((item) => item.id))).toBe(true)
  })

  it('keeps one equipped shop item per home equipment slot', () => {
    const equipped = equipShopItem(
      equipShopItem(['green-cape', 'star-cap', 'starry-seat'], 'rainbow-suit'),
      'pico-pet',
    )
    expect(equipped).toContain('rainbow-suit')
    expect(equipped).toContain('star-cap')
    expect(equipped).toContain('starry-seat')
    expect(equipped).toContain('pico-pet')
    expect(equipped).not.toContain('green-cape')
    expect(getEquippedItemForSlot(equipped, 'wear')?.id).toBe('rainbow-suit')
    expect(getEquippedItemForSlot(equipped, 'hat')?.id).toBe('star-cap')
    expect(getEquippedItemForSlot(equipped, 'room')?.id).toBe('starry-seat')
    expect(getEquippedItemForSlot(equipped, 'buddy')?.id).toBe('pico-pet')
  })

  it('defines all kuku readings as split hiragana parts and hides answers', () => {
    const values = Object.values(kukuReadings)
    expect(values).toHaveLength(81)
    expect(Object.keys(kukuReadings)).toContain('1x1')
    expect(Object.keys(kukuReadings)).toContain('9x9')
    for (const reading of values) {
      expect(reading.question).toMatch(/^[ぁ-んー\s]+$/)
      expect(reading.answer).toMatch(/^[ぁ-んー\s]+$/)
    }
    expect(formatKukuReading(2, 3, false)).toBe('にさんが ？')
    expect(formatKukuReading(2, 3, true)).toBe('にさんが ろく')
  })

  it('unlocks bosses and higher difficulties in order', () => {
    const boss = bosses.find((candidate) => candidate.id === 'boss-stage-2')
    expect(boss).toBeTruthy()
    if (!boss) {
      return
    }
    const save = createDefaultSaveData()
    expect(isBossUnlocked(boss, save)).toBe(false)
    const unlockedSave = {
      ...save,
      progress: {
        ...save.progress,
        facts: {
          '2x1': { ...createFactProgress(2, 1), correctCount: 20 },
        },
      },
    }
    expect(isBossUnlocked(boss, unlockedSave)).toBe(true)
    expect(isDifficultyUnlocked(boss, 'hard', unlockedSave)).toBe(false)
    const withPlayer = { ...createSaveWithPlayer(), progress: unlockedSave.progress }
    const cleared = applyBossClearReward(withPlayer, boss.id, 'normal', 12000).save
    expect(getDifficultyProgress(cleared, boss.id, 'normal').cleared).toBe(true)
    expect(isDifficultyUnlocked(boss, 'hard', cleared)).toBe(true)
    expect(isDifficultyUnlocked(boss, 'gekimuzu', cleared)).toBe(false)
    const hardCleared = applyBossClearReward(cleared, boss.id, 'hard', 11000).save
    const fastCleared = applyBossClearReward(hardCleared, boss.id, 'fast', 9000).save
    expect(isDifficultyUnlocked(boss, 'gekimuzu', fastCleared)).toBe(true)
  })

  it('grants fixed boss rewards only on first clear', () => {
    const boss = bosses[0]
    let save: SaveData = createSaveWithPlayer()
    const first = applyBossClearReward(save, boss.id, 'normal', 10000)
    save = first.save
    const second = applyBossClearReward(save, boss.id, 'normal', 9000)
    expect(first.firstClear).toBe(true)
    expect(first.rewardItemIds).toEqual([boss.rewards.normal.itemId])
    expect(first.rewardTitles).toContain(boss.rewards.normal.title)
    expect(second.firstClear).toBe(false)
    expect(second.rewardItemIds).toEqual([])
    expect(second.rewardTitles).toEqual([])
  })

  it('grants fixed UFO rewards only on first gekimuzu clear', () => {
    const boss = bosses[0]
    const ufo = getUfoForBoss(boss.id)
    expect(ufo).toBeTruthy()
    if (!ufo) {
      return
    }
    let save: SaveData = createSaveWithPlayer()
    const first = applyBossClearReward(save, boss.id, 'gekimuzu', 8000)
    save = first.save
    const second = applyBossClearReward(save, boss.id, 'gekimuzu', 7000)
    expect(first.firstClear).toBe(true)
    expect(first.rewardUfoIds).toEqual([ufo.id])
    expect(first.rewardTitles).toContain(boss.rewards.gekimuzu.title)
    expect(first.save.progress.ownedUfos).toContain(ufo.id)
    expect(second.firstClear).toBe(false)
    expect(second.rewardUfoIds).toEqual([])
  })

  it('grants the all-gekimuzu reward once when the 11th boss clears', () => {
    const finalBoss = bosses[bosses.length - 1]
    let save: SaveData = createSaveWithPlayer()
    for (const boss of bosses.slice(0, -1)) {
      save = applyBossClearReward(save, boss.id, 'gekimuzu', 8000).save
    }
    expect(save.progress.ownedUfos).not.toContain(specialUfoId)

    const finalClear = applyBossClearReward(save, finalBoss.id, 'gekimuzu', 8000)
    expect(finalClear.grandReward).toBe(true)
    expect(finalClear.rewardUfoIds).toContain(specialUfoId)
    expect(finalClear.rewardTitles).toContain('すべてをしるもの')
    expect(finalClear.save.progress.ownedUfos).toContain(specialUfoId)

    const repeat = applyBossClearReward(finalClear.save, finalBoss.id, 'gekimuzu', 7000)
    expect(repeat.grandReward).toBe(false)
    expect(repeat.rewardUfoIds).toEqual([])
  })
})
