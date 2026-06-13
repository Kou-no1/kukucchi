import type { TreasureRarity } from './treasureItems'

export type KeyTypeId = 'bronze' | 'gold' | 'diamond' | 'rainbow' | 'star'
export type TreasureChestId = 'bronze-chest' | 'gold-chest' | 'diamond-chest' | 'rainbow-chest' | 'star-chest'

export type KeyType = {
  id: KeyTypeId
  no: number
  name: string
  description: string
  chestId: TreasureChestId
  color: string
  accent: string
}

export type TreasureChestType = {
  id: TreasureChestId
  no: number
  name: string
  keyId: KeyTypeId
  hint: string
  rarityRange: [TreasureRarity, TreasureRarity]
  exhaustedCoins: number
  color: string
  accent: string
}

export const keyTypes: KeyType[] = [
  { id: 'bronze', no: 1, name: 'どうのカギ', description: 'はじめのたからばこをあけるカギ', chestId: 'bronze-chest', color: '#c77b47', accent: '#ffd8a8' },
  { id: 'gold', no: 2, name: 'きんのカギ', description: 'きんいろのたからばこをあけるカギ', chestId: 'gold-chest', color: '#f4b93f', accent: '#fff2a8' },
  { id: 'diamond', no: 3, name: 'だいやのカギ', description: 'すきとおるたからばこをあけるカギ', chestId: 'diamond-chest', color: '#64dff4', accent: '#effcff' },
  { id: 'rainbow', no: 4, name: 'にじいろカギ', description: 'にじのたからばこをあけるカギ', chestId: 'rainbow-chest', color: '#9a7cff', accent: '#ffc4f0' },
  { id: 'star', no: 5, name: 'ほしのカギ', description: 'いちばんひかるたからばこをあけるカギ', chestId: 'star-chest', color: '#fff26a', accent: '#7cf5ff' },
]

export const treasureChestTypes: TreasureChestType[] = [
  { id: 'bronze-chest', no: 1, name: 'どうのたからばこ', keyId: 'bronze', hint: '★1がでるよ', rarityRange: [1, 1], exhaustedCoins: 20, color: '#b8734a', accent: '#ffd0a0' },
  { id: 'gold-chest', no: 2, name: 'きんのたからばこ', keyId: 'gold', hint: '★1〜★2がでるよ', rarityRange: [1, 2], exhaustedCoins: 40, color: '#f5b43c', accent: '#fff4a8' },
  { id: 'diamond-chest', no: 3, name: 'だいやのたからばこ', keyId: 'diamond', hint: '★2〜★3がでるよ', rarityRange: [2, 3], exhaustedCoins: 70, color: '#64dff4', accent: '#eefcff' },
  { id: 'rainbow-chest', no: 4, name: 'にじのたからばこ', keyId: 'rainbow', hint: '★3〜★4がでるよ', rarityRange: [3, 4], exhaustedCoins: 110, color: '#9a7cff', accent: '#ffd2f5' },
  { id: 'star-chest', no: 5, name: 'ほしのたからばこ', keyId: 'star', hint: '★4がでるよ', rarityRange: [4, 4], exhaustedCoins: 160, color: '#fff26a', accent: '#7cf5ff' },
]

export function getKeyTypeById(keyId: string): KeyType | undefined {
  return keyTypes.find((key) => key.id === keyId)
}

export function getTreasureChestById(chestId: string): TreasureChestType | undefined {
  return treasureChestTypes.find((chest) => chest.id === chestId)
}

export function canKeyOpenChest(keyId: string, chestId: string): boolean {
  return keyTypes.some((key) => key.id === keyId && key.chestId === chestId)
}

export function keyForTreasureStreak(earnedKeyCount: number): KeyType {
  return keyTypes[Math.min(earnedKeyCount, keyTypes.length - 1)]
}
