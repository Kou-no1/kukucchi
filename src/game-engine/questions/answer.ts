import type { Question } from '../../types/game'

function normalizeAnswer(value: number | string): string {
  return String(value).trim().replace(/[０-９]/g, (char) => {
    return String.fromCharCode(char.charCodeAt(0) - 0xfee0)
  })
}

export function isCorrectAnswer(
  question: Question,
  answer: number | string,
): boolean {
  return normalizeAnswer(question.answer) === normalizeAnswer(answer)
}
