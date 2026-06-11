import type { AnswerMode, Question, QuestionCategory } from '../../types/game'

export type RandomSource = () => number

export type GenerateQuestionOptions = {
  category?: QuestionCategory
  stage?: number
  answerMode?: AnswerMode
  rng?: RandomSource
}

function pick<T>(items: T[], rng: RandomSource): T {
  return items[Math.floor(rng() * items.length)] ?? items[0]
}

function shuffle<T>(items: T[], rng: RandomSource): T[] {
  const copy = [...items]
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const target = Math.floor(rng() * (index + 1))
    const current = copy[index]
    copy[index] = copy[target]
    copy[target] = current
  }
  return copy
}

export function makeFactId(left: number, right: number): string {
  return `${left}x${right}`
}

export function generateChoices(
  correctAnswer: number,
  left: number,
  right: number,
  rng: RandomSource = Math.random,
): number[] {
  const candidates = new Set<number>([correctAnswer])
  const nearValues = [
    left * Math.max(1, right - 1),
    left * Math.min(9, right + 1),
    Math.max(1, left - 1) * right,
    Math.min(9, left + 1) * right,
    correctAnswer + left,
    correctAnswer - right,
    correctAnswer + 1,
    correctAnswer - 1,
  ].filter((value) => value > 0 && value <= 90 && value !== correctAnswer)

  for (const value of shuffle(nearValues, rng)) {
    candidates.add(value)
    if (candidates.size === 4) {
      break
    }
  }

  while (candidates.size < 4) {
    candidates.add(Math.floor(rng() * 81) + 1)
  }

  return shuffle([...candidates], rng)
}

export function generateMultiplicationQuestion(
  options: GenerateQuestionOptions = {},
): Question {
  const rng = options.rng ?? Math.random
  const stage = options.stage ?? pick([2, 3, 4, 5, 6, 7, 8, 9], rng)
  const right = Math.floor(rng() * 9) + 1
  const left = stage
  const answer = left * right
  const answerMode = options.answerMode ?? 'choice'

  return {
    id: makeFactId(left, right),
    category: 'multiplication-basic',
    prompt: `${left} × ${right}`,
    answer,
    choices: answerMode === 'choice' ? generateChoices(answer, left, right, rng) : undefined,
    explanation: `${left}こずつのまとまりが ${right}くみで ${answer} です`,
    difficulty: Math.max(left, right),
    metadata: { left, right, answerMode },
  }
}

export function generateSquareQuestion(rng: RandomSource = Math.random): Question {
  const value = Math.floor(rng() * 10) + 11
  const answer = value * value
  return {
    id: `square-${value}`,
    category: 'multiplication-square',
    prompt: `${value} × ${value}`,
    answer,
    choices: generateChoices(answer, value, value, rng),
    difficulty: 6,
    metadata: { direction: 'forward', left: value, right: value },
  }
}

export function generateQuestions(
  count: number,
  options: GenerateQuestionOptions = {},
): Question[] {
  return Array.from({ length: count }, () => generateMultiplicationQuestion(options))
}
