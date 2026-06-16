import { validateShipName } from '../utils/bannedWords'

export const defaultShipName = 'くくっち'
export const maxShipNameLength = 5

export function normalizeShipNameInput(value: string): string {
  return value.replace(/\s/g, '').slice(0, maxShipNameLength)
}

export function coerceShipName(value: unknown): string {
  if (typeof value !== 'string') {
    return defaultShipName
  }
  const normalized = normalizeShipNameInput(value)
  return validateShipName(normalized) ? defaultShipName : normalized
}
