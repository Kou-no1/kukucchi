/**
 * 船名・UFO名の入力フィルタ。
 *
 * - カタカナをひらがなに正規化
 * - 濁点・半濁点を除去
 * - 部分一致でブロック
 * - 英数字は小文字に統一
 */

const toHiragana = (str: string): string =>
  str.replace(/[\u30A1-\u30F6]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0x60))

const removeDakuten = (str: string): string =>
  str
    .normalize('NFD')
    .replace(/[\u3099\u309A]/g, '')
    .normalize('NFC')

const normalize = (str: string): string => removeDakuten(toHiragana(str)).toLowerCase()

const bannedWords: string[] = [
  'ちんこ',
  'ちんちん',
  'おちんちん',
  'まんこ',
  'おまんこ',
  'きんたま',
  'おつぱい',
  'ちくひ',
  'せつくす',
  'えつち',
  'へんたい',
  'えろ',
  'あなる',
  'うんこ',
  'うんち',
  'うんひ',
  'しつこ',
  'おしつこ',
  'くそ',
  'くその',
  'ふん',
  'けり',
  'しね',
  'ころす',
  'きえろ',
  'きもい',
  'うさい',
  'はか',
  'あほ',
  'まぬけ',
  'こみ',
  'かす',
  'ふす',
  'てふ',
  'ちひ',
  'はけ',
  'きちく',
  'しにたい',
  'むかつく',
  'せんせい',
  'こうちよう',
  'きようとう',
  'のむら',
  'ふあつく',
  'しつと',
  'はるく',
]

const bannedSet = Array.from(new Set(bannedWords))

export const containsBannedWord = (input: string): boolean => {
  const normalized = normalize(input)
  return bannedSet.some((word) => normalized.includes(word))
}

export const validateShipName = (input: string): string | null => {
  const trimmed = input.trim()

  if (trimmed.length === 0) {
    return 'なまえを　にゅうりょく　してね'
  }

  if ([...trimmed].length > 5) {
    return 'なまえは　5もじまでだよ'
  }

  if (containsBannedWord(trimmed)) {
    return 'そのなまえは　つかえないよ'
  }

  return null
}
