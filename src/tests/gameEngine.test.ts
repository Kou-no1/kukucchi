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
import { getTitleDefinitions, judgeNewTitles, titleRecordId } from '../game-engine/rewards/titles'
import {
  createFactProgress,
  updateFactProgress,
} from '../game-engine/mastery/mastery'
import {
  getMonsterOvercomeProgress,
  getWeakFacts,
  isMonsterFact,
  isMonsterOvercome,
} from '../game-engine/review/weakFacts'
import { generateDailyMissions } from '../game-engine/missions/missions'
import { formatKukuReading, kukuReadings } from '../data/kukuReadings'
import { danPalette, getDanSpriteColors } from '../data/danPalette'
import {
  advancedMonsterDefinitions,
  isAdvancedMonsterOwned,
  newlyOwnedAdvancedMonsters,
} from '../data/advancedMonsters'
import { bossDifficulties, bosses } from '../data/bosses'
import { canKeyOpenChest, keyTypes, treasureChestTypes } from '../data/keys'
import { rocketBadges } from '../data/rocketBadges'
import {
  equipShopItem,
  getEquippedItemForSlot,
  getHomeShipVisuals,
  isShopTier2Unlocked,
  shopItems,
} from '../data/shopItems'
import { normalizeShipNameInput, validateShipName } from '../data/shipName'
import { treasureItems } from '../data/treasureItems'
import { getUfoForBoss, specialUfoId } from '../data/ufos'
import {
  applyBossClearReward,
  getDifficultyProgress,
  isBossUnlocked,
  isDifficultyUnlocked,
  remainingQuestionsToUnlockBoss,
} from '../game-engine/bosses/bossEngine'
import { calculateBookProgress } from '../game-engine/collection/bookProgress'
import { collectionRecordId } from '../game-engine/collection/collectionRecords'
import {
  buildMonsterSprite,
  buildTrophySprite,
  getTrophyKindForDifficulty,
} from '../game-engine/collection/pixelSprites'
import {
  advancedBossDisplayNames,
  advancedBossVariantForBossId,
  buildAdvancedBossSprite,
  buildAdvancedMonsterSprite,
} from '../game-engine/collection/advancedPixelSprites'
import {
  createSeededRandom,
  getTreasurePoolForChest,
  openTreasureChest,
} from '../game-engine/treasure/treasureEngine'
import {
  DAILY_USAGE_STORAGE_KEY,
  addActiveUsage,
  applyRewardBudgetToSummary,
  createDailyUsageState,
  isRewardBudgetReached,
  normalizeDailyUsageState,
  shouldCountActiveUsage,
  shouldShowDailyBudgetNotice,
} from '../game-engine/school/dailyUsage'
import { createDefaultSaveData, migrateSaveData } from '../storage/saveData'
import { applySessionResult } from '../services/resultService'
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
      shipName: 'くくっち',
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

  it('builds deterministic pixel monsters from multiplication facts', () => {
    const allFacts = createMultiplicationFactPool({
      stages: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      minDifficulty: 1,
    })
    expect(allFacts).toHaveLength(81)
    expect(new Set(allFacts.map((fact) => `${fact.left}x${fact.right}`))).toHaveLength(81)

    const sprite = buildMonsterSprite(2, 3)
    const same = buildMonsterSprite(2, 3)
    const reversed = buildMonsterSprite(3, 2)
    expect(sprite.signature).toBe(same.signature)
    expect(sprite.signature).not.toBe(reversed.signature)
    expect(sprite.colors.base).toBe(danPalette[2].base)
    expect(reversed.colors.base).toBe(danPalette[3].base)
    expect(sprite.body.length).toBeGreaterThan(20)
    expect(sprite.outline.length).toBeGreaterThan(0)
  })

  it('builds deterministic pixel trophies with dan colors and difficulty metals', () => {
    const normal = buildTrophySprite({
      danLabel: '1・2',
      accentDan: 2,
      difficulty: 'normal',
    })
    const fast = buildTrophySprite({
      danLabel: '7',
      accentDan: 7,
      difficulty: 'fast',
    })
    expect(normal.signature).toBe(
      buildTrophySprite({ danLabel: '1・2', accentDan: 2, difficulty: 'normal' }).signature,
    )
    expect(normal.kind).toBe('medal')
    expect(fast.kind).toBe('trophy')
    expect(getTrophyKindForDifficulty('hard')).toBe('medal')
    expect(getTrophyKindForDifficulty('fast')).toBe('trophy')
    expect(normal.colors.accent).toBe(danPalette[2].base)
    expect(fast.colors.accent).toBe(danPalette[7].base)
    expect(getDanSpriteColors(1).outline).not.toBe(getDanSpriteColors(1).base)
  })

  it('builds deterministic high-grade companion and boss sprites', () => {
    const square = advancedMonsterDefinitions.find((monster) => monster.category === 'square')
    const pi = advancedMonsterDefinitions.find((monster) => monster.category === 'pi')
    const mixed = advancedMonsterDefinitions.find((monster) => monster.category === 'mixed')
    expect(square).toBeTruthy()
    expect(pi).toBeTruthy()
    expect(mixed).toBeTruthy()
    if (!square || !pi || !mixed) {
      return
    }

    expect(advancedMonsterDefinitions).toHaveLength(20)
    expect(
      advancedMonsterDefinitions
        .filter((monster) => monster.category === 'pi')
        .map((monster) => [monster.id, monster.name]),
    ).toEqual([
      ['pi-1', 'ワンリングパイ'],
      ['pi-2', 'ツインリングパイ'],
      ['pi-5', 'ファイブリングパイ'],
      ['pi-10', 'スリーリングパイ'],
      ['pi-25', 'フォーリングパイ'],
      ['pi-100', 'フルムーンパイ'],
    ])
    expect(buildAdvancedMonsterSprite(square).signature).toBe(
      buildAdvancedMonsterSprite(square).signature,
    )
    expect(buildAdvancedMonsterSprite(square).signature).not.toBe(
      buildAdvancedMonsterSprite(pi).signature,
    )
    expect(buildAdvancedMonsterSprite(mixed).cells.length).toBeGreaterThan(20)
    expect(buildAdvancedBossSprite('square').signature).toBe(buildAdvancedBossSprite('square').signature)
    expect(buildAdvancedBossSprite('square').name).toBe('クリスタルゴーレム')
    expect(buildAdvancedBossSprite('pi').rings.length).toBe(2)
    expect(buildAdvancedBossSprite('pi').name).toBe('リングプラネット')
    expect(buildAdvancedBossSprite('mixed').cells.length).toBeGreaterThan(50)
    expect(buildAdvancedBossSprite('mixed').name).toBe('にじいろキング')
    expect(advancedBossDisplayNames).toEqual({
      square: 'クリスタルゴーレム',
      pi: 'リングプラネット',
      mixed: 'にじいろキング',
    })
    expect(bosses.find((boss) => boss.id === 'boss-square')?.label).toBe('クリスタルゴーレム')
    expect(bosses.find((boss) => boss.id === 'boss-pi')?.label).toBe('リングプラネット')
    expect(bosses.find((boss) => boss.id === 'boss-development')?.label).toBe('にじいろキング')
    expect(advancedBossVariantForBossId('boss-square')).toBe('square')
    expect(advancedBossVariantForBossId('boss-pi')).toBe('pi')
    expect(advancedBossVariantForBossId('boss-development')).toBe('mixed')
    expect(advancedBossVariantForBossId('boss-stage-2')).toBeNull()
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

  it('shows nigate overcome progress messages', () => {
    let remainingOnly = createFactProgress(6, 7)
    remainingOnly = updateFactProgress(
      remainingOnly,
      result({
        questionId: '6x7',
        expectedAnswer: 42,
        givenAnswer: 41,
        correct: false,
        answeredAt: '2026-01-01T09:00:00.000Z',
      }),
    )
    remainingOnly = updateFactProgress(
      remainingOnly,
      result({
        questionId: '6x7',
        expectedAnswer: 42,
        givenAnswer: 42,
        correct: true,
        answeredAt: '2026-01-02T09:00:00.000Z',
      }),
    )
    expect(getMonsterOvercomeProgress(remainingOnly).message).toBe('あと 2かいで こくふく！')

    let nextDayOnly = createFactProgress(7, 8)
    nextDayOnly = updateFactProgress(
      nextDayOnly,
      result({
        questionId: '7x8',
        expectedAnswer: 56,
        givenAnswer: 54,
        correct: false,
        answeredAt: '2026-01-01T09:00:00.000Z',
      }),
    )
    for (let index = 0; index < 3; index += 1) {
      nextDayOnly = updateFactProgress(
        nextDayOnly,
        result({
          questionId: '7x8',
          expectedAnswer: 56,
          givenAnswer: 56,
          correct: true,
          answeredAt: `2026-01-01T1${index}:00:00.000Z`,
        }),
      )
    }
    expect(getMonsterOvercomeProgress(nextDayOnly).message).toBe('また あした も といてみよう！')

    let both = createFactProgress(8, 8)
    both = updateFactProgress(
      both,
      result({
        questionId: '8x8',
        expectedAnswer: 64,
        givenAnswer: 63,
        correct: false,
        answeredAt: '2026-01-01T09:00:00.000Z',
      }),
    )
    both = updateFactProgress(
      both,
      result({
        questionId: '8x8',
        expectedAnswer: 64,
        givenAnswer: 64,
        correct: true,
        answeredAt: '2026-01-01T10:00:00.000Z',
      }),
    )
    expect(getMonsterOvercomeProgress(both).message).toBe(
      'あと 2かい、また あしたも といてみよう！',
    )

    let overcome = nextDayOnly
    overcome = updateFactProgress(
      overcome,
      result({
        questionId: '7x8',
        expectedAnswer: 56,
        givenAnswer: 56,
        correct: true,
        answeredAt: '2026-01-02T09:00:00.000Z',
      }),
    )
    expect(getMonsterOvercomeProgress(overcome).message).toBeNull()
  })

  it('re-applies stale time-only monster cleanup from v8 to v10', () => {
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
    const v8Save = {
      ...createDefaultSaveData(),
      version: 8,
      progress: {
        ...createDefaultSaveData().progress,
        facts: {
          [timeOnly.id]: timeOnly,
          [wrong.id]: wrong,
        },
      },
    }
    const migrated = migrateSaveData(v8Save)
    expect(migrated.version).toBe(10)
    expect(migrated.progress.facts[timeOnly.id]).toBeUndefined()
    expect(migrated.progress.facts[wrong.id]).toBeTruthy()
  })

  it('generates daily missions and migrates save data', () => {
    const save = createDefaultSaveData()
    expect(save.version).toBe(10)
    expect(save.settings.dailyBudgetMinutes).toBe(10)
    expect(generateDailyMissions(save, new Date('2026-01-01')).length).toBe(3)
    const migrated = migrateSaveData({ version: 1 })
    expect(migrated.version).toBe(10)
    expect(migrated.settings.dailyBudgetMinutes).toBe(10)
    expect(migrated.player).toBeNull()
    expect(migrated.tutorial.homeSeen).toBe(false)
    expect(migrated.progress.bossProgress).toEqual({})
    expect(migrated.progress.ownedUfos).toEqual([])
    expect(migrated.progress.equippedUfoId).toBeNull()
    expect(migrated.progress.speedSettings.selectedStages).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
    expect(migrated.progress.rocketBestDistance).toBe(0)
    expect(migrated.progress.rocketBadges).toEqual([])
    expect(migrated.progress.collectionRecords).toEqual([])
    expect(migrated.progress.ownedTreasureItems).toEqual([])
    expect(Object.keys(migrated.progress.treasureKeys)).toHaveLength(5)
  })

  it('counts title book progress from existing title definitions', () => {
    const bossTitle = bosses[0].rewards.normal.title
    const save: SaveData = {
      ...createSaveWithPlayer(),
      player: {
        ...createSaveWithPlayer().player!,
        titles: ['はじめのいっぽ', bossTitle],
        currentTitle: bossTitle,
      },
      progress: {
        ...createSaveWithPlayer().progress,
        collectionRecords: [
          {
            id: collectionRecordId('title', titleRecordId(bossTitle)),
            acquiredAt: '2026-01-02T00:00:00.000Z',
            method: 'ボスバトル',
          },
        ],
      },
    }
    const progress = calculateBookProgress(save)
    expect(getTitleDefinitions().map((title) => title.label)).toContain(bossTitle)
    expect(progress.tabs.titles.total).toBe(getTitleDefinitions().length)
    expect(progress.tabs.titles.owned).toBe(2)
  })

  it('tracks daily active usage with idle, background, session accumulation, and midnight reset', () => {
    const morning = new Date('2026-01-01T09:00:00')
    const usage = createDailyUsageState(morning)
    const firstSession = addActiveUsage(usage, 90_000, morning)
    const secondSession = addActiveUsage(firstSession, 30_000, morning)
    expect(secondSession.usedMs).toBe(120_000)
    expect(isRewardBudgetReached(10, secondSession)).toBe(false)
    expect(isRewardBudgetReached(0, { ...secondSession, usedMs: 999_999 })).toBe(false)

    expect(
      shouldCountActiveUsage({
        visible: true,
        focused: true,
        lastActivityAt: 1_000,
        now: 50_000,
      }),
    ).toBe(true)
    expect(
      shouldCountActiveUsage({
        visible: true,
        focused: true,
        lastActivityAt: 1_000,
        now: 70_000,
      }),
    ).toBe(false)
    expect(
      shouldCountActiveUsage({
        visible: false,
        focused: true,
        lastActivityAt: 69_000,
        now: 70_000,
      }),
    ).toBe(false)
    expect(
      shouldCountActiveUsage({
        visible: true,
        focused: false,
        lastActivityAt: 69_000,
        now: 70_000,
      }),
    ).toBe(false)

    const nextDay = normalizeDailyUsageState(secondSession, new Date('2026-01-02T00:01:00'))
    expect(nextDay.usedMs).toBe(0)
    expect(nextDay.date).toBe('2026-01-02')

    const futureDated = normalizeDailyUsageState(
      { date: '2026-01-03', usedMs: 45_000, noticeShownDate: null },
      new Date('2026-01-02T10:00:00'),
    )
    expect(futureDated.usedMs).toBe(45_000)
    expect(futureDated.date).toBe('2026-01-03')
  })

  it('pauses coins and exp after the daily budget while preserving records', () => {
    const save = createSaveWithPlayer()
    const summary: GameSessionSummary = {
      id: 'budget-test',
      mode: 'advanced',
      totalQuestions: 3,
      correctCount: 3,
      accuracy: 100,
      averageResponseTimeMs: 1200,
      maxCombo: 3,
      score: 400,
      earnedCoins: 30,
      earnedExp: 60,
      newTitles: [],
      bestUpdated: false,
      weakFacts: [],
      masteredFacts: [],
      details: {
        advancedCategoryRates: ['平方数 100%'],
      },
      results: [
        result({
          questionId: 'square-11',
          prompt: '11 × 11',
          expectedAnswer: 121,
          givenAnswer: 121,
          difficulty: 4,
        }),
        result({
          questionId: 'square-12',
          prompt: '12 × 12',
          expectedAnswer: 144,
          givenAnswer: 144,
          difficulty: 4,
        }),
        result({
          questionId: 'square-13',
          prompt: '13 × 13',
          expectedAnswer: 169,
          givenAnswer: 169,
          difficulty: 4,
        }),
      ],
      finishedAt: '2026-01-04T00:00:00.000Z',
    }
    const applied = applySessionResult(save, summary, { rewardBudgetPaused: true })
    expect(applied.summary.earnedCoins).toBe(0)
    expect(applied.summary.earnedExp).toBe(0)
    expect(applied.summary.details?.rewardBudgetPaused).toBe(true)
    expect(applied.save.player?.coins).toBe(0)
    expect(applied.save.player?.exp).toBe(0)
    expect(applied.save.progress.categoryCorrect['multiplication-square']).toBe(3)
    expect(applied.save.progress.collectionRecords).toContainEqual(
      expect.objectContaining({
        id: collectionRecordId('advanced-monster', 'square-2'),
      }),
    )
  })

  it('keeps daily usage outside save-data backups and shows the budget notice once', () => {
    const reached = {
      date: '2026-01-01',
      usedMs: 600_000,
      noticeShownDate: null,
    }
    expect(shouldShowDailyBudgetNotice(10, reached)).toBe(true)
    expect(
      shouldShowDailyBudgetNotice(10, {
        ...reached,
        noticeShownDate: '2026-01-01',
      }),
    ).toBe(false)
    expect(applyRewardBudgetToSummary({
      id: 'budget-summary',
      mode: 'speed',
      totalQuestions: 1,
      correctCount: 1,
      accuracy: 100,
      averageResponseTimeMs: 1000,
      maxCombo: 1,
      score: 100,
      earnedCoins: 4,
      earnedExp: 8,
      newTitles: [],
      bestUpdated: false,
      weakFacts: [],
      masteredFacts: [],
      results: [result({ questionId: '2x2' })],
      finishedAt: '2026-01-01T00:00:00.000Z',
    }, true)).toMatchObject({
      earnedCoins: 0,
      earnedExp: 0,
      details: {
        rewardBudgetPaused: true,
      },
    })
    const backup = JSON.stringify(createDefaultSaveData())
    expect(backup).not.toContain(DAILY_USAGE_STORAGE_KEY)
    expect(backup).not.toContain('usedMs')
    expect(backup).not.toContain('noticeShownDate')
  })

  it('validates spaceship names and migrates legacy saves with a default ship name', () => {
    expect(normalizeShipNameInput('あいうえおか')).toBe('あいうえお')
    expect(validateShipName('スター').ok).toBe(true)
    expect(validateShipName('abc').ok).toBe(false)
    expect(validateShipName('うんこ').ok).toBe(false)

    const legacyPlayer = { ...createSaveWithPlayer().player! }
    const legacy = {
      ...createSaveWithPlayer(),
      version: 7,
      player: legacyPlayer,
    }
    delete (legacy.player as Record<string, unknown>).shipName
    const migrated = migrateSaveData(legacy)
    expect(migrated.version).toBe(10)
    expect(migrated.player?.shipName).toBe('くくっち')
  })

  it('migrates v4 save data into v10 and removes time-only monsters', () => {
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
    expect(migrated.version).toBe(10)
    expect(migrated.progress.speedSettings.durationSeconds).toBe(30)
    expect(migrated.progress.speedSettings.selectedStages).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
    expect(migrated.progress.rocketBestDistance).toBe(0)
    expect(migrated.progress.rocketBadges).toEqual([])
    expect(migrated.progress.collectionRecords).toEqual([])
    expect(migrated.progress.ownedTreasureItems).toEqual([])
    expect(migrated.progress.treasureKeys.bronze.count).toBe(0)
    expect(migrated.progress.facts[timeOnly.id]).toBeUndefined()
    expect(migrated.progress.facts[wrong.id]).toBeTruthy()
  })

  it('unlocks high-grade companions from existing category progress and records new ones', () => {
    const firstSquare = advancedMonsterDefinitions.find((monster) => monster.id === 'square-2')
    expect(firstSquare).toBeTruthy()
    if (!firstSquare) {
      return
    }
    expect(isAdvancedMonsterOwned({}, firstSquare)).toBe(false)
    expect(isAdvancedMonsterOwned({ 'multiplication-square': 3 }, firstSquare)).toBe(true)
    expect(newlyOwnedAdvancedMonsters({}, { 'multiplication-square': 3 })).toContain(firstSquare)

    const save = createSaveWithPlayer()
    const results = Array.from({ length: 3 }, (_, index) =>
      result({
        questionId: `square-${11 + index}`,
        prompt: `${11 + index} × ${11 + index}`,
        expectedAnswer: (11 + index) ** 2,
        givenAnswer: (11 + index) ** 2,
        difficulty: 6,
      }),
    )
    const summary: GameSessionSummary = {
      id: 'advanced-square-test',
      mode: 'advanced',
      totalQuestions: results.length,
      correctCount: results.length,
      accuracy: 100,
      averageResponseTimeMs: 1200,
      maxCombo: 3,
      score: 300,
      earnedCoins: 9,
      earnedExp: 54,
      newTitles: [],
      bestUpdated: false,
      weakFacts: [],
      masteredFacts: [],
      results,
      finishedAt: '2026-01-03T00:00:00.000Z',
    }
    const applied = applySessionResult(save, summary)
    expect(applied.save.version).toBe(10)
    expect(applied.save.progress.categoryCorrect['multiplication-square']).toBe(3)
    expect(applied.save.progress.collectionRecords).toContainEqual(
      expect.objectContaining({
        id: collectionRecordId('advanced-monster', firstSquare.id),
        acquiredAt: summary.finishedAt,
      }),
    )
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

  it('sets the final rocket badge milestone to 900m', () => {
    expect(rocketBadges.at(-1)).toMatchObject({
      id: 'rocket-cosmos',
      distance: 900,
    })
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

  it('maps equipped shop items to home ship visual layers', () => {
    expect(shopItems.every((item) => item.visual.layer && item.visual.variant)).toBe(true)
    const visuals = getHomeShipVisuals([
      'green-cape',
      'rainbow-suit',
      'rocket-helmet',
      'planet-view',
      'crystal-desk',
      'luna-pet',
      'comet-burst',
    ])
    expect(visuals).toEqual({
      wear: 'rainbow-suit',
      hat: 'rocket-helmet',
      window: 'planet-view',
      furniture: 'crystal-desk',
      buddy: 'luna-pet',
      effect: 'comet-burst',
    })
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
    expect(bossDifficulties.gekimuzu.timeLimitSeconds).toBe(1.8)
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

  it('calculates remaining correct answers for locked bosses', () => {
    const boss = bosses.find((candidate) => candidate.id === 'boss-stage-3')
    const allBoss = bosses.find((candidate) => candidate.id === 'boss-all-kuku')
    expect(boss).toBeTruthy()
    expect(allBoss).toBeTruthy()
    if (!boss || !allBoss) {
      return
    }
    const save = createDefaultSaveData()
    expect(remainingQuestionsToUnlockBoss(boss, save)).toBe(20)
    const withTenCorrect = {
      ...save,
      progress: {
        ...save.progress,
        facts: {
          '3x1': { ...createFactProgress(3, 1), correctCount: 10 },
        },
      },
    }
    expect(remainingQuestionsToUnlockBoss(boss, withTenCorrect)).toBe(10)
    const withNineteenCorrect = {
      ...save,
      progress: {
        ...save.progress,
        facts: {
          '3x1': { ...createFactProgress(3, 1), correctCount: 19 },
        },
      },
    }
    expect(remainingQuestionsToUnlockBoss(boss, withNineteenCorrect)).toBe(1)
    const unlocked = {
      ...save,
      progress: {
        ...save.progress,
        facts: {
          '3x1': { ...createFactProgress(3, 1), correctCount: 20 },
        },
      },
    }
    expect(remainingQuestionsToUnlockBoss(boss, unlocked)).toBeNull()
    expect(remainingQuestionsToUnlockBoss(allBoss, save)).toBeNull()
  })

  it('unlocks high-grade boss categories independently', () => {
    const squareBoss = bosses.find((boss) => boss.id === 'boss-square')
    const piBoss = bosses.find((boss) => boss.id === 'boss-pi')
    const developmentBoss = bosses.find((boss) => boss.id === 'boss-development')
    expect(squareBoss).toBeTruthy()
    expect(piBoss).toBeTruthy()
    expect(developmentBoss).toBeTruthy()
    if (!squareBoss || !piBoss || !developmentBoss) {
      return
    }

    const squareOnly = {
      ...createDefaultSaveData(),
      progress: {
        ...createDefaultSaveData().progress,
        categoryCorrect: {
          'multiplication-square': 20,
          'pi-multiplication': 0,
          development: 0,
        },
      },
    }
    expect(isBossUnlocked(squareBoss, squareOnly)).toBe(true)
    expect(isBossUnlocked(piBoss, squareOnly)).toBe(false)
    expect(isBossUnlocked(developmentBoss, squareOnly)).toBe(false)
    expect(remainingQuestionsToUnlockBoss(piBoss, squareOnly)).toBe(20)

    const piOnly = {
      ...squareOnly,
      progress: {
        ...squareOnly.progress,
        categoryCorrect: {
          'multiplication-square': 0,
          'pi-multiplication': 20,
          development: 0,
        },
      },
    }
    expect(isBossUnlocked(squareBoss, piOnly)).toBe(false)
    expect(isBossUnlocked(piBoss, piOnly)).toBe(true)
    expect(isBossUnlocked(developmentBoss, piOnly)).toBe(false)

    const developmentOnly = {
      ...squareOnly,
      progress: {
        ...squareOnly.progress,
        categoryCorrect: {
          'multiplication-square': 0,
          'pi-multiplication': 0,
          development: 20,
        },
      },
    }
    expect(isBossUnlocked(squareBoss, developmentOnly)).toBe(false)
    expect(isBossUnlocked(piBoss, developmentOnly)).toBe(false)
    expect(isBossUnlocked(developmentBoss, developmentOnly)).toBe(true)
  })

  it('resets legacy high-grade boss clears and rewards during v10 migration', () => {
    const legacy = createSaveWithPlayer()
    const squareTitle = bosses.find((boss) => boss.id === 'boss-square')?.rewards.normal.title ?? ''
    const squareItem = 'boss-square-normal-item'
    const migrated = migrateSaveData({
      ...legacy,
      version: 9,
      player: legacy.player
        ? {
            ...legacy.player,
            titles: [...legacy.player.titles, squareTitle, 'すべてをしるもの'],
            currentTitle: squareTitle,
          }
        : legacy.player,
      progress: {
        ...legacy.progress,
        bossProgress: {
          'boss-square': {
            bossId: 'boss-square',
            difficulties: {
              normal: {
                cleared: true,
                clearCount: 1,
                firstClearedAt: '2026-01-01T00:00:00.000Z',
                bestTimeMs: 8000,
              },
            },
          },
          'boss-development': {
            bossId: 'boss-development',
            difficulties: {
              normal: {
                cleared: true,
                clearCount: 1,
                firstClearedAt: '2026-01-01T00:00:00.000Z',
                bestTimeMs: 8000,
              },
            },
          },
        },
        bossItems: [squareItem, 'boss-development-normal-item'],
        ownedUfos: ['boss-square-ufo', 'boss-development-ufo', specialUfoId],
        equippedUfoId: 'boss-square-ufo',
        collectionRecords: [
          {
            id: collectionRecordId('boss-item', squareItem),
            acquiredAt: '2026-01-01T00:00:00.000Z',
            method: '旧平方数ボス',
          },
          {
            id: collectionRecordId('title', titleRecordId(squareTitle)),
            acquiredAt: '2026-01-01T00:00:00.000Z',
            method: '旧平方数ボス',
          },
          {
            id: collectionRecordId('ufo', 'boss-development-ufo'),
            acquiredAt: '2026-01-01T00:00:00.000Z',
            method: 'はってんボス',
          },
        ],
      },
    })

    expect(migrated.version).toBe(10)
    expect(migrated.progress.bossProgress['boss-square']).toBeUndefined()
    expect(migrated.progress.bossProgress['boss-development']).toBeTruthy()
    expect(migrated.progress.bossItems).not.toContain(squareItem)
    expect(migrated.progress.bossItems).toContain('boss-development-normal-item')
    expect(migrated.progress.ownedUfos).not.toContain('boss-square-ufo')
    expect(migrated.progress.ownedUfos).not.toContain(specialUfoId)
    expect(migrated.progress.ownedUfos).toContain('boss-development-ufo')
    expect(migrated.progress.equippedUfoId).toBe('boss-development-ufo')
    expect(migrated.player?.titles).not.toContain(squareTitle)
    expect(migrated.player?.titles).not.toContain('すべてをしるもの')
    expect(migrated.progress.collectionRecords).not.toContainEqual(
      expect.objectContaining({ id: collectionRecordId('boss-item', squareItem) }),
    )
    expect(migrated.progress.collectionRecords).toContainEqual(
      expect.objectContaining({ id: collectionRecordId('ufo', 'boss-development-ufo') }),
    )
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
    expect(first.save.progress.collectionRecords).toContainEqual(
      expect.objectContaining({
        id: collectionRecordId('boss-item', boss.rewards.normal.itemId ?? ''),
      }),
    )
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
    expect(first.save.progress.collectionRecords).toContainEqual(
      expect.objectContaining({
        id: collectionRecordId('ufo', ufo.id),
      }),
    )
    expect(second.firstClear).toBe(false)
    expect(second.rewardUfoIds).toEqual([])
  })

  it('grants the all-gekimuzu reward once when the final boss clears', () => {
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
    expect(finalClear.save.progress.collectionRecords).toContainEqual(
      expect.objectContaining({
        id: collectionRecordId('ufo', specialUfoId),
      }),
    )

    const repeat = applyBossClearReward(finalClear.save, finalBoss.id, 'gekimuzu', 7000)
    expect(repeat.grandReward).toBe(false)
    expect(repeat.rewardUfoIds).toEqual([])
  })
})
