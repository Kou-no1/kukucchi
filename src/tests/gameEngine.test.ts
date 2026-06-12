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
  applyAnswerToScore,
  calculateSpeedBonus,
} from '../game-engine/scoring/score'
import { calculateCoins, calculateExp } from '../game-engine/rewards/rewards'
import { judgeNewTitles } from '../game-engine/rewards/titles'
import {
  createFactProgress,
  updateFactProgress,
} from '../game-engine/mastery/mastery'
import { getWeakFacts } from '../game-engine/review/weakFacts'
import { generateDailyMissions } from '../game-engine/missions/missions'
import { formatKukuReading, kukuReadings } from '../data/kukuReadings'
import { bosses } from '../data/bosses'
import { getUfoForBoss, specialUfoId } from '../data/ufos'
import {
  applyBossClearReward,
  getDifficultyProgress,
  isBossUnlocked,
  isDifficultyUnlocked,
} from '../game-engine/bosses/bossEngine'
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

  it('generates daily missions and migrates save data', () => {
    const save = createDefaultSaveData()
    expect(generateDailyMissions(save, new Date('2026-01-01')).length).toBe(3)
    const migrated = migrateSaveData({ version: 1 })
    expect(migrated.version).toBe(3)
    expect(migrated.tutorial.homeSeen).toBe(false)
    expect(migrated.progress.bossProgress).toEqual({})
    expect(migrated.progress.ownedUfos).toEqual([])
    expect(migrated.progress.equippedUfoId).toBeNull()
  })

  it('migrates v2 save data into v3 UFO fields', () => {
    const v2Save = {
      ...createDefaultSaveData(),
      version: 2,
      progress: {
        ...createDefaultSaveData().progress,
        ownedUfos: undefined,
        equippedUfoId: undefined,
      },
    }
    const migrated = migrateSaveData(v2Save)
    expect(migrated.version).toBe(3)
    expect(migrated.progress.ownedUfos).toEqual([])
    expect(migrated.progress.equippedUfoId).toBeNull()
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
