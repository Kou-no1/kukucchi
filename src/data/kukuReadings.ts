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

const overrides: Record<string, string> = {
  '8x8': 'はっぱ ろくじゅうし',
  '9x9': 'くく はちじゅういち',
}

export const kukuReadings: Record<string, string> = Object.fromEntries(
  Array.from({ length: 9 }, (_, leftIndex) => leftIndex + 1).flatMap((left) =>
    Array.from({ length: 9 }, (_, rightIndex) => {
      const right = rightIndex + 1
      const id = `${left}x${right}`
      const product = left * right
      const connector = product < 10 ? 'が' : ''
      const reading =
        overrides[id] ??
        `${leftReadings[left]}${rightReadings[right]}${connector} ${productReading(product)}`
      return [id, reading]
    }),
  ),
)

export function getKukuReading(left: number, right: number): string {
  return kukuReadings[`${left}x${right}`] ?? ''
}
