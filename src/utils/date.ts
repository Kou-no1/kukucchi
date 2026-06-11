export function getLocalDateKey(date = new Date()): string {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function addDays(date: Date, days: number): string {
  const copy = new Date(date)
  copy.setDate(copy.getDate() + days)
  return copy.toISOString()
}

export function isDifferentLocalDay(
  leftIso: string | null,
  rightIso: string,
): boolean {
  if (!leftIso) {
    return true
  }
  return getLocalDateKey(new Date(leftIso)) !== getLocalDateKey(new Date(rightIso))
}
