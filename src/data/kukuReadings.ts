const leftReadings: Record<number, string> = {
  1: 'いん',
  2: 'に',
  3: 'さん',
  4: 'し',
  5: 'ご',
  6: 'ろく',
  7: 'しち',
  8: 'はち',
  9: 'く',
}

const rightReadings: Record<number, string> = {
  1: 'いち',
  2: 'に',
  3: 'さん',
  4: 'し',
  5: 'ご',
  6: 'ろく',
  7: 'しち',
  8: 'はち',
  9: 'く',
}

const digitReadings: Record<number, string> = {
  0: '',
  1: 'いち',
  2: 'に',
  3: 'さん',
  4: 'し',
  5: 'ご',
  6: 'ろく',
  7: 'しち',
  8: 'はち',
  9: 'く',
}

function productReading(value: number): string {
  if (value < 10) {
    return digitReadings[value]
  }
  const tens = Math.floor(value / 10)
  const ones = value % 10
  if (tens === 1) {
    return `じゅう${digitReadings[ones]}`
  }
  return `${digitReadings[tens]}じゅう${digitReadings[ones]}`
}

export type KukuReading = {
  question: string
  answer: string
}

const overrides: Record<string, KukuReading> = {
  '8x8': { question: 'はっぱ', answer: 'ろくじゅうし' },
  '9x9': { question: 'くく', answer: 'はちじゅういち' },
}

export const kukuReadings: Record<string, KukuReading> = Object.fromEntries(
  Array.from({ length: 9 }, (_, leftIndex) => leftIndex + 1).flatMap((left) =>
    Array.from({ length: 9 }, (_, rightIndex) => {
      const right = rightIndex + 1
      const id = `${left}x${right}`
      const product = left * right
      const connector = product < 10 ? 'が' : ''
      const reading =
        overrides[id] ??
        {
          question: `${leftReadings[left]}${rightReadings[right]}${connector}`,
          answer: productReading(product),
        }
      return [id, reading]
    }),
  ),
)

export function getKukuReadingParts(left: number, right: number): KukuReading {
  return kukuReadings[`${left}x${right}`] ?? { question: '', answer: '' }
}

export function formatKukuReading(
  left: number,
  right: number,
  revealAnswer = true,
): string {
  const reading = getKukuReadingParts(left, right)
  return `${reading.question} ${revealAnswer ? reading.answer : '？'}`
}

export function getKukuReading(left: number, right: number): string {
  return formatKukuReading(left, right, true)
}
