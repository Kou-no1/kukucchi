import type {
  AnswerMode,
  MultiplicationFactProgress,
  Question,
  QuestionCategory,
} from '../../types/game'
import { getReviewQueue } from '../review/weakFacts'

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

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
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

function generateNumberChoices(
  correctAnswer: number,
  nearValues: number[],
  rng: RandomSource,
  min: number,
  max: number,
): number[] {
  const candidates = new Set<number>([correctAnswer])
  for (const value of shuffle(nearValues, rng)) {
    const normalized = Number(value.toFixed(2))
    if (normalized >= min && normalized <= max && normalized !== correctAnswer) {
      candidates.add(normalized)
    }
    if (candidates.size === 4) {
      break
    }
  }

  while (candidates.size < 4) {
    candidates.add(Number((min + rng() * (max - min)).toFixed(2)))
  }

  return shuffle([...candidates], rng)
}

export function generateMultiplicationFactQuestion(
  left: number,
  right: number,
  options: Omit<GenerateQuestionOptions, 'stage'> = {},
): Question {
  const rng = options.rng ?? Math.random
  const safeLeft = clamp(Math.round(left), 1, 9)
  const safeRight = clamp(Math.round(right), 1, 9)
  const answer = safeLeft * safeRight
  const answerMode = options.answerMode ?? 'choice'

  return {
    id: makeFactId(safeLeft, safeRight),
    category: 'multiplication-basic',
    prompt: `${safeLeft} × ${safeRight}`,
    answer,
    choices:
      answerMode === 'choice' ? generateChoices(answer, safeLeft, safeRight, rng) : undefined,
    explanation: `${safeLeft}こずつのまとまりが ${safeRight}くみで ${answer} です`,
    difficulty: Math.max(safeLeft, safeRight),
    metadata: { left: safeLeft, right: safeRight, answerMode },
  }
}

export function generateMultiplicationQuestion(
  options: GenerateQuestionOptions = {},
): Question {
  const rng = options.rng ?? Math.random
  const stage = options.stage ?? pick([2, 3, 4, 5, 6, 7, 8, 9], rng)
  const right = Math.floor(rng() * 9) + 1
  return generateMultiplicationFactQuestion(stage, right, options)
}

export function generateAdaptiveMultiplicationQuestion(
  facts: Record<string, MultiplicationFactProgress>,
  options: GenerateQuestionOptions = {},
): Question {
  const rng = options.rng ?? Math.random
  const queue = getReviewQueue(facts, new Date(), 8)
  if (queue.length > 0 && rng() < 0.7) {
    const fact = pick(queue, rng)
    return generateMultiplicationFactQuestion(fact.left, fact.right, options)
  }
  return generateMultiplicationQuestion(options)
}

export function generateSquareQuestion(rng: RandomSource = Math.random): Question {
  const value = Math.floor(rng() * 10) + 11
  const answer = value * value
  const inverse = rng() < 0.4
  if (inverse) {
    const choices = generateNumberChoices(
      value,
      [value - 2, value - 1, value + 1, value + 2],
      rng,
      11,
      20,
    )
    return {
      id: `square-inverse-${value}`,
      category: 'multiplication-square',
      prompt: `□ × □ = ${answer}`,
      answer: value,
      choices,
      explanation: `${value} × ${value} = ${answer}`,
      difficulty: 7,
      metadata: { direction: 'inverse', left: value, right: value },
    }
  }
  return {
    id: `square-${value}`,
    category: 'multiplication-square',
    prompt: `${value} × ${value}`,
    answer,
    choices: generateNumberChoices(
      answer,
      [
        (value - 1) * (value - 1),
        (value + 1) * (value + 1),
        answer - value,
        answer + value,
      ],
      rng,
      100,
      420,
    ),
    explanation: `${value} × ${value} = ${answer}`,
    difficulty: 6,
    metadata: { direction: 'forward', left: value, right: value },
  }
}

export function generatePiQuestion(rng: RandomSource = Math.random): Question {
  const values = [...Array.from({ length: 20 }, (_, index) => index + 1), 25, 50, 100]
  const value = pick(values, rng)
  const answer = Number((3.14 * value).toFixed(2))
  const choices = generateNumberChoices(
    answer,
    [3.14 * (value - 1), 3.14 * (value + 1), answer + 3.14, answer - 3.14],
    rng,
    3.14,
    314,
  )
  return {
    id: `pi-${value}`,
    category: 'pi-multiplication',
    prompt: `3.14 × ${value}`,
    answer,
    choices,
    explanation: `3.14を${value}こぶんで ${answer}`,
    difficulty: value <= 10 ? 6 : 8,
    metadata: { value, answerMode: 'choice' },
  }
}

function gcd(left: number, right: number): number {
  let a = Math.abs(left)
  let b = Math.abs(right)
  while (b !== 0) {
    const next = a % b
    a = b
    b = next
  }
  return a
}

function lcm(left: number, right: number): number {
  return (left * right) / gcd(left, right)
}

function isPrime(value: number): boolean {
  if (value < 2) {
    return false
  }
  for (let divider = 2; divider * divider <= value; divider += 1) {
    if (value % divider === 0) {
      return false
    }
  }
  return true
}

export function generateDevelopmentQuestion(rng: RandomSource = Math.random): Question {
  const kind = pick(
    [
      'two-digit-times-one-digit',
      'two-digit-times-two-digit',
      'divisors',
      'multiples',
      'prime',
      'gcd',
      'lcm',
    ] as const,
    rng,
  )

  if (kind === 'two-digit-times-one-digit') {
    const left = Math.floor(rng() * 80) + 12
    const right = Math.floor(rng() * 8) + 2
    const answer = left * right
    return {
      id: `td1-${left}x${right}`,
      category: kind,
      prompt: `${left} × ${right}`,
      answer,
      choices: generateNumberChoices(answer, [answer + left, answer - right, answer + 10, answer - 10], rng, 20, 900),
      explanation: `${left} × ${right} = ${answer}`,
      difficulty: 8,
      metadata: { left, right },
    }
  }

  if (kind === 'two-digit-times-two-digit') {
    const left = Math.floor(rng() * 40) + 11
    const right = Math.floor(rng() * 40) + 11
    const answer = left * right
    return {
      id: `td2-${left}x${right}`,
      category: kind,
      prompt: `${left} × ${right}`,
      answer,
      choices: generateNumberChoices(answer, [answer + left, answer - right, answer + 100, answer - 100], rng, 100, 2500),
      explanation: `${left} × ${right} = ${answer}`,
      difficulty: 10,
      metadata: { left, right },
    }
  }

  if (kind === 'divisors') {
    const base = pick([12, 18, 24, 30, 36, 42, 48], rng)
    const divisors = Array.from({ length: base }, (_, index) => index + 1).filter(
      (value) => base % value === 0,
    )
    const answer = pick(divisors, rng)
    return {
      id: `divisor-${base}-${answer}`,
      category: kind,
      prompt: `${base}の約数はどれ？`,
      answer,
      choices: generateNumberChoices(answer, [answer + 1, answer + 2, base - 1, base + 1], rng, 1, base + 8),
      explanation: `${base}は${answer}で割り切れます`,
      difficulty: 8,
      metadata: { base },
    }
  }

  if (kind === 'multiples') {
    const base = Math.floor(rng() * 8) + 2
    const answer = base * (Math.floor(rng() * 9) + 2)
    return {
      id: `multiple-${base}-${answer}`,
      category: kind,
      prompt: `${base}の倍数はどれ？`,
      answer,
      choices: generateNumberChoices(answer, [answer + 1, answer - 1, answer + base + 1, answer - base + 1], rng, 2, 100),
      explanation: `${answer}は${base}で割り切れます`,
      difficulty: 7,
      metadata: { base },
    }
  }

  if (kind === 'prime') {
    const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31]
    const answer = pick(primes, rng)
    const compositeChoices = [answer + 1, answer + 3, answer * 2, answer * 3].filter(
      (value) => !isPrime(value),
    )
    return {
      id: `prime-${answer}`,
      category: kind,
      prompt: '素数はどれ？',
      answer,
      choices: generateNumberChoices(answer, compositeChoices, rng, 2, 40),
      explanation: `${answer}は1と自分自身でしか割り切れません`,
      difficulty: 8,
      metadata: { prime: true },
    }
  }

  const left = pick([12, 18, 24, 28, 36, 42], rng)
  const right = pick([8, 12, 15, 18, 24, 30], rng)
  const answer = kind === 'gcd' ? gcd(left, right) : lcm(left, right)
  return {
    id: `${kind}-${left}-${right}`,
    category: kind,
    prompt: kind === 'gcd' ? `${left}と${right}の最大公約数` : `${left}と${right}の最小公倍数`,
    answer,
    choices: generateNumberChoices(answer, [answer + 2, answer * 2, Math.abs(left - right), left + right], rng, 1, 160),
    explanation:
      kind === 'gcd'
        ? `${left}と${right}をどちらも割れる最大の数です`
        : `${left}と${right}の共通する倍数のうち最小です`,
    difficulty: 9,
    metadata: { left, right },
  }
}

export function generateAdvancedQuestion(
  category: 'square' | 'pi' | 'development' | 'mixed' = 'mixed',
  rng: RandomSource = Math.random,
): Question {
  if (category === 'square') {
    return generateSquareQuestion(rng)
  }
  if (category === 'pi') {
    return generatePiQuestion(rng)
  }
  if (category === 'development') {
    return generateDevelopmentQuestion(rng)
  }
  const roll = rng()
  if (roll < 0.38) {
    return generateSquareQuestion(rng)
  }
  if (roll < 0.72) {
    return generatePiQuestion(rng)
  }
  return generateDevelopmentQuestion(rng)
}

export function generateQuestions(
  count: number,
  options: GenerateQuestionOptions = {},
): Question[] {
  return Array.from({ length: count }, () => generateMultiplicationQuestion(options))
}
