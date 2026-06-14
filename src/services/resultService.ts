import {
  createFactProgress,
  updateFactProgress,
} from '../game-engine/mastery/mastery'
import { newlyOwnedAdvancedMonsters } from '../data/advancedMonsters'
import { addCollectionRecords } from '../game-engine/collection/collectionRecords'
import { getMasteredFacts, getMonsterFacts } from '../game-engine/review/weakFacts'
import { judgeNewTitles } from '../game-engine/rewards/titles'
import { expToLevel } from '../game-engine/rewards/rewards'
import { applyRewardBudgetToSummary } from '../game-engine/school/dailyUsage'
import type { AnswerResult, GameSessionSummary } from '../types/game'
import type { SaveData } from '../types/save'

function extractFact(result: AnswerResult): { left: number; right: number } | null {
  const match = result.questionId.match(/^(\d+)x(\d+)$/)
  if (!match) {
    return null
  }
  return { left: Number(match[1]), right: Number(match[2]) }
}

function extractCategoryKey(result: AnswerResult): string | null {
  if (result.questionId.startsWith('square-')) {
    return 'multiplication-square'
  }
  if (result.questionId.startsWith('pi-')) {
    return 'pi-multiplication'
  }
  if (
    result.questionId.startsWith('td1-') ||
    result.questionId.startsWith('td2-') ||
    result.questionId.startsWith('divisor-') ||
    result.questionId.startsWith('multiple-') ||
    result.questionId.startsWith('prime-') ||
    result.questionId.startsWith('gcd-') ||
    result.questionId.startsWith('lcm-')
  ) {
    return 'development'
  }
  return null
}

export function applySessionResult(
  save: SaveData,
  summary: GameSessionSummary,
  options: { rewardBudgetPaused?: boolean } = {},
): { save: SaveData; summary: GameSessionSummary } {
  const effectiveSummary = applyRewardBudgetToSummary(
    summary,
    options.rewardBudgetPaused === true,
  )
  const facts = { ...save.progress.facts }
  const previousMasteredIds = new Set(getMasteredFacts(save.progress.facts).map((fact) => fact.id))

  for (const result of effectiveSummary.results) {
    const fact = extractFact(result)
    if (!fact) {
      continue
    }
    const current = facts[result.questionId] ?? createFactProgress(fact.left, fact.right)
    facts[result.questionId] = updateFactProgress(current, result)
  }
  const categoryCorrect = { ...save.progress.categoryCorrect }
  for (const result of effectiveSummary.results) {
    if (!result.correct) {
      continue
    }
    const category = extractCategoryKey(result)
    if (category) {
      categoryCorrect[category] = (categoryCorrect[category] ?? 0) + 1
    }
  }
  const newlyOwnedAdvanced = newlyOwnedAdvancedMonsters(
    save.progress.categoryCorrect,
    categoryCorrect,
  )

  const best = save.progress.bests[effectiveSummary.mode]
  const bestUpdated = !best || effectiveSummary.score > best.score
  const interimSave: SaveData = {
    ...save,
    progress: {
      ...save.progress,
      facts,
      categoryCorrect,
    },
  }
  const newTitles = judgeNewTitles(effectiveSummary, interimSave)
  const titles = Array.from(new Set([...(save.player?.titles ?? []), ...newTitles]))
  const nextExp = (save.player?.exp ?? 0) + effectiveSummary.earnedExp
  const monsterBook = Array.from(
    new Set([
      ...save.progress.monsterBook,
      ...getMasteredFacts(facts).map((fact) => fact.id),
    ]),
  )
  const newlyMasteredFacts = getMasteredFacts(facts).filter(
    (fact) => !previousMasteredIds.has(fact.id),
  )
  const collectionRecords = addCollectionRecords(
    save.progress.collectionRecords,
    [
      ...newlyMasteredFacts.map((fact) => ({
        kind: 'monster',
        id: fact.id,
        acquiredAt: effectiveSummary.finishedAt,
        method: 'にがてふくしゅう',
      })),
      ...newlyOwnedAdvanced.map((monster) => ({
        kind: 'advanced-monster',
        id: monster.id,
        acquiredAt: effectiveSummary.finishedAt,
        method: `${monster.category === 'square' ? '平方数' : monster.category === 'pi' ? '3.14' : 'ミックス'} ${monster.threshold}もん`,
      })),
    ],
  )
  const missions = save.progress.missions.map((mission) => {
    let gained = 0
    if (mission.kind === 'correct-count') {
      gained = effectiveSummary.correctCount
    }
    if (mission.kind === 'combo') {
      gained = effectiveSummary.maxCombo
    }
    if (mission.kind === 'speed-play' && effectiveSummary.mode === 'speed') {
      gained = 1
    }
    if (mission.kind === 'stage-practice') {
      const match = mission.id.match(/stage-(\d+)/)
      const stage = match?.[1]
      gained = stage
        ? effectiveSummary.results.filter(
            (result) => result.correct && result.questionId.startsWith(`${stage}x`),
          ).length
        : 0
    }
    const progress = Math.min(mission.target, mission.progress + gained)
    return {
      ...mission,
      progress,
      completed: progress >= mission.target,
    }
  })

  const nextSave: SaveData = {
    ...save,
    player: save.player
      ? {
          ...save.player,
          exp: nextExp,
          level: expToLevel(nextExp),
          coins: save.player.coins + effectiveSummary.earnedCoins,
          titles,
          currentTitle: titles.at(-1) ?? save.player.currentTitle,
          lastPlayedAt: effectiveSummary.finishedAt,
        }
      : save.player,
    progress: {
      ...save.progress,
      facts,
      categoryCorrect,
      history: [
        {
          id: effectiveSummary.id,
          mode: effectiveSummary.mode,
          correctCount: effectiveSummary.correctCount,
          totalQuestions: effectiveSummary.totalQuestions,
          averageResponseTimeMs: effectiveSummary.averageResponseTimeMs,
          score: effectiveSummary.score,
          playedAt: effectiveSummary.finishedAt,
        },
        ...save.progress.history,
      ].slice(0, 50),
      bests: bestUpdated
        ? {
            ...save.progress.bests,
            [effectiveSummary.mode]: {
              score: effectiveSummary.score,
              averageResponseTimeMs: effectiveSummary.averageResponseTimeMs,
              accuracy: effectiveSummary.accuracy,
              achievedAt: effectiveSummary.finishedAt,
            },
          }
        : save.progress.bests,
      missions,
      monsterBook,
      collectionRecords,
    },
  }

  return {
    save: nextSave,
    summary: {
      ...effectiveSummary,
      newTitles,
      bestUpdated,
      weakFacts: getMonsterFacts(facts),
      masteredFacts: newlyMasteredFacts,
    },
  }
}
