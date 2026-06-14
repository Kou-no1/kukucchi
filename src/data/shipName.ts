export const defaultShipName = 'くくっち'
export const maxShipNameLength = 5

const blockedWords = [
  'うんこ',
  'うんち',
  'ちんこ',
  'ちんちん',
  'おしっこ',
  'しっこ',
  'ばか',
  'あほ',
]

function toHiragana(value: string): string {
  return value.replace(/[\u30a1-\u30f6]/g, (character) =>
    String.fromCharCode(character.charCodeAt(0) - 0x60),
  )
}

export function normalizeShipNameInput(value: string): string {
  return value.replace(/\s/g, '').slice(0, maxShipNameLength)
}

export function validateShipName(value: string): { ok: boolean; value: string; message: string } {
  const normalized = normalizeShipNameInput(value)
  const hiragana = toHiragana(normalized)
  if (!normalized) {
    return { ok: false, value: normalized, message: 'なまえをいれてね' }
  }
  if (!/^[ぁ-ゖァ-ヺー]+$/u.test(normalized)) {
    return { ok: false, value: normalized, message: 'かなだけで つけてね' }
  }
  if (blockedWords.some((word) => hiragana.includes(word))) {
    return { ok: false, value: normalized, message: 'そのなまえは つかえないよ' }
  }
  return { ok: true, value: normalized, message: 'ほぞんしました' }
}

export function coerceShipName(value: unknown): string {
  if (typeof value !== 'string') {
    return defaultShipName
  }
  const result = validateShipName(value)
  return result.ok ? result.value : defaultShipName
}
