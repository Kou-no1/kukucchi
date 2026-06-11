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

  const best = save.progress.bests[summary.mode]
  const bestUpdated = !best || summary.score > best.score
  const interimSave: SaveData = {
    ...save,
    progress: {
      ...save.progress,
      facts,
    },
  }
  const newTitles = judgeNewTitles(summary, interimSave)
  const titles = Array.from(new Set([...(save.player?.titles ?? []), ...newTitles]))
  const nextExp = (save.player?.exp ?? 0) + summary.earnedExp
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
