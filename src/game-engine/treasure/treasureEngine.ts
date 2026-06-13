import { getTreasureChestById, treasureChestTypes } from '../../data/keys'
import { getTreasureItemById, treasureItems } from '../../data/treasureItems'
import type { TreasureItem } from '../../data/treasureItems'

export type RandomSource = () => number

export type TreasureOpenResult = {
  chestId: string
  item: TreasureItem
  duplicate: boolean
  convertedCoins: number
  acquiredAt: string
  method: string
}

export function createSeededRandom(seed: number): RandomSource {
  let state = seed >>> 0
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 0x100000000
  }
}

export function getTreasurePoolForChest(chestId: string): TreasureItem[] {
  const chest = getTreasureChestById(chestId) ?? treasureChestTypes[0]
  return treasureItems.filter(
    (item) => item.rarity >= chest.rarityRange[0] && item.rarity <= chest.rarityRange[1],
  )
}

export function chooseTreasureItem(chestId: string, rng: RandomSource = Math.random): TreasureItem {
  const pool = getTreasurePoolForChest(chestId)
  const safePool = pool.length > 0 ? pool : treasureItems
  const index = Math.min(safePool.length - 1, Math.floor(rng() * safePool.length))
  return safePool[index]
}

export function duplicateCoinsForRarity(rarity: TreasureItem['rarity']): number {
  return rarity * 18
}

export function openTreasureChest({
  chestId,
  ownedItemIds,
  rng = Math.random,
  openedAt = new Date().toISOString(),
}: {
  chestId: string
  ownedItemIds: string[]
  rng?: RandomSource
  openedAt?: string
}): TreasureOpenResult {
  const item = chooseTreasureItem(chestId, rng)
  const duplicate = ownedItemIds.includes(item.id)
  return {
    chestId,
    item,
    duplicate,
    convertedCoins: duplicate ? duplicateCoinsForRarity(item.rarity) : 0,
    acquiredAt: openedAt,
    method: `${getTreasureChestById(chestId)?.name ?? 'たからばこ'}から入手`,
  }
}

export function resolveTreasureItemName(itemId: string): string {
  return getTreasureItemById(itemId)?.name ?? itemId
}
