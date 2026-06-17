import { getTreasureChestById, treasureChestTypes } from '../../data/keys'
import { isTreasureBuddyChest, treasureBuddyDefinitions } from '../../data/buddies'
import { getTreasureItemById, treasureItems } from '../../data/treasureItems'
import type { TreasureItem } from '../../data/treasureItems'

export type RandomSource = () => number

export type TreasureOpenResult = {
  chestId: string
  item: TreasureItem | null
  buddyId: string | null
  buddyName: string | null
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

export function getUnownedBuddyPoolForChest(chestId: string, ownedBuddyIds: string[]): string[] {
  if (!isTreasureBuddyChest(chestId)) {
    return []
  }
  const owned = new Set(ownedBuddyIds)
  return treasureBuddyDefinitions.map((buddy) => buddy.id).filter((buddyId) => !owned.has(buddyId))
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

export function chooseTreasureReward({
  chestId,
  rng = Math.random,
  ownedItemIds = [],
  ownedBuddyIds = [],
  includeBuddyRewards = false,
}: {
  chestId: string
  rng?: RandomSource
  ownedItemIds?: string[]
  ownedBuddyIds?: string[]
  includeBuddyRewards?: boolean
}): { item: TreasureItem | null; buddyId: string | null; buddyName: string | null } {
  const itemPool = getUnownedTreasurePoolForChest(chestId, ownedItemIds)
  const buddyPool = includeBuddyRewards ? getUnownedBuddyPoolForChest(chestId, ownedBuddyIds) : []
  const pool = [
    ...itemPool.map((item) => ({ type: 'item' as const, item })),
    ...buddyPool.map((buddyId) => ({ type: 'buddy' as const, buddyId })),
  ]
  if (pool.length === 0) {
    return { item: null, buddyId: null, buddyName: null }
  }
  const selected = pool[Math.min(pool.length - 1, Math.floor(rng() * pool.length))]
  if (selected.type === 'item') {
    return { item: selected.item, buddyId: null, buddyName: null }
  }
  const buddy = treasureBuddyDefinitions.find((candidate) => candidate.id === selected.buddyId)
  return { item: null, buddyId: selected.buddyId, buddyName: buddy?.name ?? selected.buddyId }
}

export function exhaustedCoinsForChest(chestId: string): number {
  return (getTreasureChestById(chestId) ?? treasureChestTypes[0]).exhaustedCoins
}

export function openTreasureChest({
  chestId,
  ownedItemIds,
  rng = Math.random,
  openedAt = new Date().toISOString(),
  ownedBuddyIds = [],
  includeBuddyRewards = false,
}: {
  chestId: string
  ownedItemIds: string[]
  rng?: RandomSource
  openedAt?: string
  ownedBuddyIds?: string[]
  includeBuddyRewards?: boolean
}): TreasureOpenResult {
  const chest = getTreasureChestById(chestId) ?? treasureChestTypes[0]
  const reward = chooseTreasureReward({
    chestId,
    rng,
    ownedItemIds,
    ownedBuddyIds,
    includeBuddyRewards,
  })
  const poolExhausted = reward.item === null && reward.buddyId === null
  return {
    chestId,
    item: reward.item,
    buddyId: reward.buddyId,
    buddyName: reward.buddyName,
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
