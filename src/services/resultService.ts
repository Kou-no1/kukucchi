import {
  createFactProgress,
  updateFactProgress,
} from '../game-engine/mastery/mastery'
import { getMasteredFacts, getWeakFacts } from '../game-engine/review/weakFacts'
import { judgeNewTitles } from '../game-engine/rewards/titles'
import { expToLevel } from '../game-engine/rewards/rewards'
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
): { save: SaveData; summary: GameSessionSummary } {
  const facts = { ...save.progress.facts }

  for (const result of summary.results) {
    const fact = extractFact(result)
    if (!fact) {
      continue
    }
    const current = facts[result.questionId] ?? createFactProgress(fact.left, fact.right)
    facts[result.questionId] = updateFactProgress(current, result)
  }
  const categoryCorrect = { ...save.progress.categoryCorrect }
  for (const result of summary.results) {
    if (!result.correct) {
      continue
    }
    const category = extractCategoryKey(result)
    if (category) {
      categoryCorrect[category] = (categoryCorrect[category] ?? 0) + 1
    }
  }

  const best = save.progress.bests[summary.mode]
  const bestUpdated = !best || summary.score > best.score
  const interimSave: SaveData = {
    ...save,
    progress: {
      ...save.progress,
      facts,
      categoryCorrect,
    },
  }
  const newTitles = judgeNewTitles(summary, interimSave)
  const titles = Array.from(new Set([...(save.player?.titles ?? []), ...newTitles]))
  const nextExp = (save.player?.exp ?? 0) + summary.earnedExp
  const monsterBook = Array.from(
    new Set([
      ...save.progress.monsterBook,
      ...getMasteredFacts(facts).map((fact) => fact.id),
    ]),
  )
  const missions = save.progress.missions.map((mission) => {
    let gained = 0
    if (mission.kind === 'correct-count') {
      gained = summary.correctCount
    }
    if (mission.kind === 'combo') {
      gained = summary.maxCombo
    }
    if (mission.kind === 'speed-play' && summary.mode === 'speed') {
      gained = 1
    }
    if (mission.kind === 'stage-practice') {
      const match = mission.id.match(/stage-(\d+)/)
      const stage = match?.[1]
      gained = stage
        ? summary.results.filter(
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
          coins: save.player.coins + summary.earnedCoins,
          titles,
          currentTitle: titles.at(-1) ?? save.player.currentTitle,
          lastPlayedAt: summary.finishedAt,
        }
      : save.player,
    progress: {
      ...save.progress,
      facts,
      categoryCorrect,
      history: [
        {
          id: summary.id,
          mode: summary.mode,
          correctCount: summary.correctCount,
          totalQuestions: summary.totalQuestions,
          averageResponseTimeMs: summary.averageResponseTimeMs,
          score: summary.score,
          playedAt: summary.finishedAt,
        },
        ...save.progress.history,
      ].slice(0, 50),
      bests: bestUpdated
        ? {
            ...save.progress.bests,
            [summary.mode]: {
              score: summary.score,
              averageResponseTimeMs: summary.averageResponseTimeMs,
              accuracy: summary.accuracy,
              achievedAt: summary.finishedAt,
            },
          }
        : save.progress.bests,
      missions,
      monsterBook,
    },
  }

  return {
    save: nextSave,
    summary: {
      ...summary,
      newTitles,
      bestUpdated,
      weakFacts: getWeakFacts(facts),
      masteredFacts: getMasteredFacts(facts),
    },
  }
}
