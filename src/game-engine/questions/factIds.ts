import type {
  AnswerResult,
  ArithmeticOperation,
  MultiplicationFactProgress,
} from '../../types/game'

export type ParsedFactId = {
  id: string
  operation: ArithmeticOperation
  left: number
  right: number
  areaId?: string
}

export function makeMultiplicationFactId(left: number, right: number): string {
  return `${left}x${right}`
}

export function makeAdditionFactId(areaId: string, left: number, right: number): string {
  return `add:${areaId}:${left}+${right}`
}

export function parseFactId(id: string): ParsedFactId | null {
  const additionMatch = id.match(/^add:([a-z0-9-]+):(\d+)\+(\d+)$/)
  if (additionMatch) {
    return {
      id,
      operation: 'addition',
      areaId: additionMatch[1],
      left: Number(additionMatch[2]),
      right: Number(additionMatch[3]),
    }
  }

  const multiplicationMatch = id.match(/^(\d+)x(\d+)$/)
  if (multiplicationMatch) {
    return {
      id,
      operation: 'multiplication',
      left: Number(multiplicationMatch[1]),
      right: Number(multiplicationMatch[2]),
    }
  }

  return null
}

export function factIdFromResult(result: AnswerResult): string | null {
  return parseFactId(result.questionId)?.id ?? null
}

export function factFromResult(result: AnswerResult): ParsedFactId | null {
  return parseFactId(result.questionId)
}

export function factOperationOf(fact: MultiplicationFactProgress): ArithmeticOperation | null {
  return fact.operation ?? parseFactId(fact.id)?.operation ?? null
}

export function isMultiplicationFactId(id: string): boolean {
  return parseFactId(id)?.operation === 'multiplication'
}

export function isAdditionFactId(id: string): boolean {
  return parseFactId(id)?.operation === 'addition'
}

export function isMultiplicationFactProgress(fact: MultiplicationFactProgress): boolean {
  return factOperationOf(fact) === 'multiplication'
}

export function isAdditionFactProgress(fact: MultiplicationFactProgress): boolean {
  return factOperationOf(fact) === 'addition'
}

export function formatFactLabel(fact: MultiplicationFactProgress | ParsedFactId): string {
  const operation = 'operation' in fact ? fact.operation : parseFactId(fact.id)?.operation
  return operation === 'addition'
    ? `${fact.left} + ${fact.right}`
    : `${fact.left} × ${fact.right}`
}
