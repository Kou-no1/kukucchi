import { getTitleDefinitions } from '../rewards/titles'
import { createMultiplicationFactPool } from '../questions/factDifficulty'
import { getCollectionRecord } from '../collection/collectionRecords'
import { buddyDefinitions, buddyThemeLabels, type BuddyDefinition } from '../../data/buddies'
import {
  getEquipmentSlotForKind,
  shopItems,
  type ShopItem,
  type ShopItemVisualLayer,
} from '../../data/shopItems'
import { ufoDefinitions, type UfoDefinition } from '../../data/ufos'
import type { SaveData } from '../../types/save'

export type CustomTabId =
  | 'window'
  | 'ufo'
  | 'hat'
  | 'suit'
  | 'buddy'
  | 'effect'
  | 'title'

export type CustomEntryKind =
  | 'shop'
  | 'ufo'
  | 'monster-buddy'
  | 'dedicated-buddy'
  | 'title'

export type CustomStarFilter = 'all' | 'add' | 'subtract' | 'multiply'

export type CustomInventoryEntry = {
  id: string
  tabId: CustomTabId
  kind: CustomEntryKind
  origin: CustomStarFilter
  label: string
  description: string
  owned: boolean
  selected: boolean
  method: string
  acquiredAt: string | null
  item?: ShopItem
  ufo?: UfoDefinition
  buddy?: BuddyDefinition
  monsterFact?: {
    left: number
    right: number
  }
}

export type CustomInventoryTab = {
  id: CustomTabId
  label: string
  ownedCount: number
  totalCount: number
  entries: CustomInventoryEntry[]
}

const tabLabels: Record<CustomTabId, string> = {
  window: 'はいけい',
  ufo: 'UFO',
  hat: 'ぼうし',
  suit: 'スーツ',
  buddy: 'なかま',
  effect: 'エフェクト',
  title: 'しょうごう',
}

const tabOrder: CustomTabId[] = ['window', 'ufo', 'hat', 'suit', 'buddy', 'effect', 'title']

export const customStarFilterLabels: Record<CustomStarFilter, string> = {
  all: 'ぜんぶ',
  add: 'たしざん',
  subtract: 'ひきざん',
  multiply: 'かけざん',
}

export const customStarFilterOrder: CustomStarFilter[] = ['all', 'add', 'subtract', 'multiply']

function tabForVisualLayer(layer: ShopItemVisualLayer): CustomTabId | null {
  if (layer === 'window') {
    return 'window'
  }
  if (layer === 'hat') {
    return 'hat'
  }
  if (layer === 'wear') {
    return 'suit'
  }
  if (layer === 'effect') {
    return 'effect'
  }
  if (layer === 'buddy') {
    return 'buddy'
  }
  return null
}

function isItemSelected(save: SaveData, item: ShopItem): boolean {
  const slot = getEquipmentSlotForKind(item.kind)
  return save.progress.equippedItems.some((equippedId) => {
    const equippedItem = shopItems.find((candidate) => candidate.id === equippedId)
    return equippedItem?.id === item.id && slot.kinds.includes(equippedItem.kind)
  })
}

function shopEntries(save: SaveData): CustomInventoryEntry[] {
  const ownedItems = new Set([...save.progress.ownedItems, ...save.progress.equippedItems])
  return shopItems.flatMap((item) => {
    const tabId = item.kind === 'buddy' ? null : tabForVisualLayer(item.visual.layer)
    if (!tabId) {
      return []
    }
    const owned = ownedItems.has(item.id)
    return [
      {
        id: item.id,
        tabId,
        kind: 'shop',
        origin: item.availableInShop === false ? 'multiply' : 'all',
        label: item.name,
        description: item.description,
        owned,
        selected: owned && isItemSelected(save, item),
        method:
          item.availableInShop === false
            ? 'とくべつほうしゅう'
            : item.kind === 'buddy'
              ? 'ショップ'
              : `${item.price}コイン`,
        acquiredAt: null,
        item,
      } satisfies CustomInventoryEntry,
    ]
  })
}

function ufoEntries(save: SaveData): CustomInventoryEntry[] {
  const ownedUfos = new Set(save.progress.ownedUfos)
  return ufoDefinitions.map((ufo) => {
    const owned = ownedUfos.has(ufo.id)
    const record = getCollectionRecord(save.progress.collectionRecords, 'ufo', ufo.id)
    return {
      id: ufo.id,
      tabId: 'ufo',
      kind: 'ufo',
      origin: 'multiply',
      label: ufo.name,
      description: ufo.description,
      owned,
      selected: owned && save.progress.equippedUfoId === ufo.id,
      method: record?.method ?? 'ボスげきムズ',
      acquiredAt: record?.acquiredAt ?? null,
      ufo,
    }
  })
}

function monsterBuddyEntries(save: SaveData): CustomInventoryEntry[] {
  const monsterBook = new Set(save.progress.monsterBook)
  return createMultiplicationFactPool({
    stages: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    minDifficulty: 1,
  }).map((fact) => {
    const factId = `${fact.left}x${fact.right}`
    const selectionId = `monster:${factId}`
    const owned = monsterBook.has(factId)
    const record = getCollectionRecord(save.progress.collectionRecords, 'monster', factId)
    return {
      id: selectionId,
      tabId: 'buddy',
      kind: 'monster-buddy',
      origin: 'multiply',
      label: owned ? `${fact.left} × ${fact.right}` : '？？？',
      description: owned ? 'にがてをこくふくしたなかま' : 'にがてをこくふくすると なかまになる',
      owned,
      selected: owned && save.progress.equippedBuddyId === selectionId,
      method: record?.method ?? 'にがてをこくふく',
      acquiredAt: record?.acquiredAt ?? null,
      monsterFact: { left: fact.left, right: fact.right },
    }
  })
}

function dedicatedBuddyEntries(save: SaveData): CustomInventoryEntry[] {
  return buddyDefinitions.map((buddy) => {
    const record = getCollectionRecord(save.progress.collectionRecords, 'buddy', buddy.id)
    const owned = Boolean(record)
    const selectionId = `buddy:${buddy.id}`
    return {
      id: selectionId,
      tabId: 'buddy',
      kind: 'dedicated-buddy',
      origin: 'all',
      label: owned ? buddy.name : '？？？',
      description: owned ? buddy.description : `${buddyThemeLabels[buddy.theme]}のなかま`,
      owned,
      selected: owned && save.progress.equippedBuddyId === selectionId,
      method: record?.method ?? (buddy.source === 'shop' ? 'ショップ' : 'たからばこ'),
      acquiredAt: record?.acquiredAt ?? null,
      buddy,
    }
  })
}

function titleEntries(save: SaveData): CustomInventoryEntry[] {
  const ownedTitles = new Set(save.player?.titles ?? [])
  return getTitleDefinitions()
    .map((title) => {
      const record = getCollectionRecord(save.progress.collectionRecords, 'title', title.id)
      const owned = ownedTitles.has(title.label)
      return {
        id: title.id,
        tabId: 'title',
        kind: 'title',
        origin: 'multiply',
        label: owned ? title.label : '？？？',
        description: owned ? title.description : 'まだ見つけていないしょうごう',
        owned,
        selected: owned && save.player?.currentTitle === title.label,
        method: record?.method ?? title.method,
        acquiredAt: record?.acquiredAt ?? null,
      } satisfies CustomInventoryEntry
    })
    .sort((left, right) => Number(right.owned) - Number(left.owned))
}

export function buildCustomInventory(
  save: SaveData,
  starFilter: CustomStarFilter = 'all',
): CustomInventoryTab[] {
  const entries = [
    ...shopEntries(save),
    ...ufoEntries(save),
    ...monsterBuddyEntries(save),
    ...dedicatedBuddyEntries(save),
    ...titleEntries(save),
  ].filter((entry) => starFilter === 'all' || entry.origin === starFilter)
  return tabOrder.map((tabId) => {
    const tabEntries = entries.filter((entry) => entry.tabId === tabId)
    return {
      id: tabId,
      label: tabLabels[tabId],
      ownedCount: tabEntries.filter((entry) => entry.owned).length,
      totalCount: tabEntries.length,
      entries: tabEntries,
    }
  })
}

export function customTabLabels(): Record<CustomTabId, string> {
  return tabLabels
}
