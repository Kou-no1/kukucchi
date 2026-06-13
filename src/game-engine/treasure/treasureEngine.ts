import { getTreasureChestById, treasureChestTypes } from '../../data/keys'
import { getTreasureItemById, treasureItems } from '../../data/treasureItems'
import type { TreasureItem } from '../../data/treasureItems'

export type RandomSource = () => number

export type TreasureOpenResult = {
  chestId: string
  item: TreasureItem | null
  duplicate: boolean
  poolExhausted: boolean
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

export function getUnownedTreasurePoolForChest(
  chestId: string,
  ownedItemIds: string[],
): TreasureItem[] {
  const owned = new Set(ownedItemIds)
  return getTreasurePoolForChest(chestId).filter((item) => !owned.has(item.id))
}

export function chooseTreasureItem(
  chestId: string,
  rng: RandomSource = Math.random,
  ownedItemIds: string[] = [],
): TreasureItem | null {
  const pool = getUnownedTreasurePoolForChest(chestId, ownedItemIds)
  if (pool.length === 0) {
    return null
  }
  const index = Math.min(pool.length - 1, Math.floor(rng() * pool.length))
  return pool[index]
}

export function exhaustedCoinsForChest(chestId: string): number {
  return (getTreasureChestById(chestId) ?? treasureChestTypes[0]).exhaustedCoins
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
  const chest = getTreasureChestById(chestId) ?? treasureChestTypes[0]
  const item = chooseTreasureItem(chestId, rng, ownedItemIds)
  const poolExhausted = item === null
  return {
    chestId,
    item,
    duplicate: false,
    poolExhausted,
    convertedCoins: poolExhausted ? chest.exhaustedCoins : 0,
    acquiredAt: openedAt,
    method: poolExhausted ? `${chest.name}をぜんぶあつめた` : `${chest.name}から入手`,
  }
}

export function resolveTreasureItemName(itemId: string): string {
  return getTreasureItemById(itemId)?.name ?? itemId
}
