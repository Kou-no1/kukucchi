import { shopBuddyDefinitions } from './buddies'

export type ShopItemKind =
  | 'wear'
  | 'suit'
  | 'hat'
  | 'furniture'
  | 'wallpaper'
  | 'background'
  | 'effect'
  | 'pet'
  | 'buddy'

export type ShopItemVisualLayer =
  | 'wear'
  | 'hat'
  | 'window'
  | 'furniture'
  | 'effect'
  | 'buddy'

export type ShopItemVisual = {
  layer: ShopItemVisualLayer
  variant: string
}

export type ShopItem = {
  id: string
  no: number
  name: string
  description: string
  price: number
  emoji: string
  kind: ShopItemKind
  visual: ShopItemVisual
  tier?: 1 | 2
  countsTowardTierUnlock?: boolean
}

export type HomeShipVisuals = Partial<Record<ShopItemVisualLayer, string>>

export const homeShipPreviewLayers = [
  'window',
  'ufo',
  'body',
  'hat',
  'buddy',
  'effect',
] as const

export type HomeShipPreviewLayer = (typeof homeShipPreviewLayers)[number]

export type HomeShipPreviewVisuals = Pick<
  HomeShipVisuals,
  'window' | 'wear' | 'hat' | 'buddy' | 'effect'
> & {
  ufo?: string
}

export type EquipmentSlotId = 'wear' | 'hat' | 'room' | 'buddy' | 'effect'

export type EquipmentSlot = {
  id: EquipmentSlotId
  label: string
  emptyLabel: string
  kinds: ShopItemKind[]
}

export const shopTier2UnlockPurchaseCount = 10

export const equipmentSlots: EquipmentSlot[] = [
  {
    id: 'wear',
    label: 'スーツ',
    emptyLabel: 'スーツなし',
    kinds: ['wear', 'suit'],
  },
  {
    id: 'hat',
    label: 'ぼうし',
    emptyLabel: 'ぼうしなし',
    kinds: ['hat'],
  },
  {
    id: 'room',
    label: 'へや',
    emptyLabel: 'へやそのまま',
    kinds: ['furniture', 'wallpaper', 'background'],
  },
  {
    id: 'buddy',
    label: 'なかま',
    emptyLabel: 'なかまなし',
    kinds: ['pet', 'buddy'],
  },
  {
    id: 'effect',
    label: 'ひかり',
    emptyLabel: 'ひかりなし',
    kinds: ['effect'],
  },
]

const coreShopItems: ShopItem[] = [
  {
    id: 'blue-neon-room',
    no: 1,
    name: 'あおひかりのかべ',
    description: 'くくっちごうのまどがあおくひかる',
    price: 50,
    emoji: '💎',
    kind: 'wallpaper',
    visual: { layer: 'window', variant: 'blue-neon-room' },
  },
  {
    id: 'starry-seat',
    no: 2,
    name: 'ほしぞらいす',
    description: 'れんしゅうせきをきらきらにする',
    price: 80,
    emoji: '🌌',
    kind: 'furniture',
    visual: { layer: 'furniture', variant: 'starry-seat' },
  },
  {
    id: 'comet-ship',
    no: 3,
    name: 'すいせいひかり',
    description: 'うしろにあおいひかりがのびる',
    price: 120,
    emoji: '☄️',
    kind: 'effect',
    visual: { layer: 'effect', variant: 'comet-ship' },
  },
  {
    id: 'mini-orbit-pet',
    no: 4,
    name: 'みにおーびっと',
    description: 'ふわふわついてくるちいさななかま',
    price: 180,
    emoji: '🛰️',
    kind: 'pet',
    visual: { layer: 'buddy', variant: 'mini-orbit-pet' },
  },
  {
    id: 'green-cape',
    no: 5,
    name: 'みどりひらひら',
    description: 'くくっちがすこしゆうしゃきぶん',
    price: 250,
    emoji: '🟢',
    kind: 'wear',
    visual: { layer: 'wear', variant: 'green-cape' },
  },
  {
    id: 'star-cap',
    no: 6,
    name: 'ほしぼうし',
    description: 'あたまにちいさなほしがひかる',
    price: 350,
    emoji: '⭐',
    kind: 'hat',
    visual: { layer: 'hat', variant: 'star-cap' },
  },
  {
    id: 'moon-window',
    no: 7,
    name: 'つきのまど',
    description: 'そとにやさしいつきがみえる',
    price: 480,
    emoji: '🌙',
    kind: 'background',
    visual: { layer: 'window', variant: 'moon-window' },
  },
  {
    id: 'soft-sofa',
    no: 8,
    name: 'もこもこいす',
    description: 'きゅうけいじかんがたのしくなる',
    price: 650,
    emoji: '🛋️',
    kind: 'furniture',
    visual: { layer: 'furniture', variant: 'soft-sofa' },
  },
  {
    id: 'sparkle-trail',
    no: 9,
    name: 'きらきらおび',
    description: 'せいかいのあとにひかりがながれる',
    price: 880,
    emoji: '✨',
    kind: 'effect',
    visual: { layer: 'effect', variant: 'sparkle-trail' },
  },
  {
    id: 'pico-pet',
    no: 10,
    name: 'ぴこぴこなかま',
    description: 'にこにこはねるなかま',
    price: 1200,
    emoji: '🔵',
    kind: 'pet',
    visual: { layer: 'buddy', variant: 'pico-pet' },
  },
  {
    id: 'rainbow-suit',
    no: 11,
    name: 'にじいろふく',
    description: 'うちゅうのひかりみたいなふく',
    price: 1500,
    emoji: '🌈',
    kind: 'wear',
    visual: { layer: 'wear', variant: 'rainbow-suit' },
  },
  {
    id: 'rocket-helmet',
    no: 12,
    name: 'ろけっとぼうし',
    description: 'しゅっぱつじゅんびばっちり',
    price: 2000,
    emoji: '🚀',
    kind: 'hat',
    visual: { layer: 'hat', variant: 'rocket-helmet' },
  },
  {
    id: 'aurora-wall',
    no: 13,
    name: 'ゆらゆらかべ',
    description: 'へやがゆらゆらあおくひかる',
    price: 2600,
    emoji: '🩵',
    kind: 'wallpaper',
    visual: { layer: 'window', variant: 'aurora-wall' },
  },
  {
    id: 'planet-view',
    no: 14,
    name: 'わくせいまど',
    description: 'おおきなほしをながめられる',
    price: 3300,
    emoji: '🪐',
    kind: 'background',
    visual: { layer: 'window', variant: 'planet-view' },
  },
  {
    id: 'crystal-desk',
    no: 15,
    name: 'すいしょうつくえ',
    description: 'もんだいがきらっとみえるつくえ',
    price: 4100,
    emoji: '💠',
    kind: 'furniture',
    visual: { layer: 'furniture', variant: 'crystal-desk' },
  },
  {
    id: 'comet-burst',
    no: 16,
    name: 'すいせいぱちぱち',
    description: 'れんぞくせいかいでひかりがはじける',
    price: 5000,
    emoji: '💥',
    kind: 'effect',
    visual: { layer: 'effect', variant: 'comet-burst' },
  },
  {
    id: 'luna-pet',
    no: 17,
    name: 'つきのなかま',
    description: 'つきのようにしずかによりそう',
    price: 6200,
    emoji: '🌝',
    kind: 'pet',
    visual: { layer: 'buddy', variant: 'luna-pet' },
  },
  {
    id: 'galaxy-cloak',
    no: 18,
    name: 'ぎんがころも',
    description: 'ほしぞらをまとったふく',
    price: 7500,
    emoji: '🌠',
    kind: 'wear',
    visual: { layer: 'wear', variant: 'galaxy-cloak' },
  },
  {
    id: 'crown-hat',
    no: 19,
    name: 'きんいろかんむり',
    description: 'がんばりやさんのかがやくぼうし',
    price: 9000,
    emoji: '👑',
    kind: 'hat',
    visual: { layer: 'hat', variant: 'crown-hat' },
  },
  {
    id: 'cosmos-stage',
    no: 20,
    name: 'こすもすひろば',
    description: 'うちゅうぜんたいがひろばになる',
    price: 10000,
    emoji: '🌟',
    kind: 'background',
    visual: { layer: 'window', variant: 'cosmos-stage' },
  },
]

export const suitShopItems: ShopItem[] = [
  {
    id: 'suit-navy',
    no: 21,
    name: 'ネイビースーツ',
    description: 'きりっとした あおいスーツ',
    price: 200,
    emoji: '🔷',
    kind: 'suit',
    visual: { layer: 'wear', variant: 'suit-navy' },
    tier: 1,
    countsTowardTierUnlock: false,
  },
  {
    id: 'suit-white',
    no: 22,
    name: 'ホワイトスーツ',
    description: 'ぴかっとひかる しろいスーツ',
    price: 250,
    emoji: '🤍',
    kind: 'suit',
    visual: { layer: 'wear', variant: 'suit-white' },
    tier: 1,
    countsTowardTierUnlock: false,
  },
  {
    id: 'suit-red',
    no: 23,
    name: 'レッドスーツ',
    description: 'げんきがでる あかいスーツ',
    price: 300,
    emoji: '❤️',
    kind: 'suit',
    visual: { layer: 'wear', variant: 'suit-red' },
    tier: 1,
    countsTowardTierUnlock: false,
  },
  {
    id: 'suit-green',
    no: 24,
    name: 'グリーンスーツ',
    description: 'やさしい みどりのスーツ',
    price: 350,
    emoji: '💚',
    kind: 'suit',
    visual: { layer: 'wear', variant: 'suit-green' },
    tier: 1,
    countsTowardTierUnlock: false,
  },
  {
    id: 'suit-purple',
    no: 25,
    name: 'パープルスーツ',
    description: 'うちゅうっぽい むらさきスーツ',
    price: 400,
    emoji: '💜',
    kind: 'suit',
    visual: { layer: 'wear', variant: 'suit-purple' },
    tier: 1,
    countsTowardTierUnlock: false,
  },
]

export const buddyShopItems: ShopItem[] = shopBuddyDefinitions.map((buddy, index) => ({
  id: buddy.id,
  no: 26 + index,
  name: buddy.name,
  description: buddy.description,
  price: buddy.price,
  emoji: buddy.theme === 'robot' ? '🤖' : buddy.theme === 'celestial' ? '⭐' : '👾',
  kind: 'buddy',
  visual: { layer: 'buddy', variant: buddy.id },
  tier: 1,
  countsTowardTierUnlock: false,
}))

export const shopItems: ShopItem[] = [...coreShopItems, ...suitShopItems, ...buddyShopItems]

export function countsTowardShopTier(item: ShopItem): boolean {
  return item.countsTowardTierUnlock ?? item.no <= 20
}

export function getShopItemTier(item: ShopItem): 1 | 2 {
  return item.tier ?? (item.no <= 10 ? 1 : 2)
}

export function isShopItemVisible(item: ShopItem, tier2Unlocked: boolean): boolean {
  return getShopItemTier(item) === 1 || tier2Unlocked
}

export function purchasedShopItemCount(ownedItems: string[]): number {
  const owned = new Set(ownedItems)
  return shopItems.filter((item) => owned.has(item.id) && countsTowardShopTier(item)).length
}

export function isShopTier2Unlocked(ownedItems: string[]): boolean {
  return purchasedShopItemCount(ownedItems) >= shopTier2UnlockPurchaseCount
}

export function getShopItemById(itemId: string): ShopItem | undefined {
  return shopItems.find((item) => item.id === itemId)
}

export function getEquipmentSlotForKind(kind: ShopItemKind): EquipmentSlot {
  return equipmentSlots.find((slot) => slot.kinds.includes(kind)) ?? equipmentSlots[0]
}

export function getEquippedItemForSlot(
  equippedItems: string[],
  slotId: EquipmentSlotId,
): ShopItem | undefined {
  const slot = equipmentSlots.find((candidate) => candidate.id === slotId)
  if (!slot) {
    return undefined
  }
  return equippedItems.map(getShopItemById).find((item) => item && slot.kinds.includes(item.kind))
}

export function getHomeShipVisuals(equippedItems: string[]): HomeShipVisuals {
  return equippedItems.reduce<HomeShipVisuals>((visuals, itemId) => {
    const item = getShopItemById(itemId)
    if (!item) {
      return visuals
    }
    return {
      ...visuals,
      [item.visual.layer]: item.visual.variant,
    }
  }, {})
}

export function getHomeShipPreviewVisuals(
  equippedItems: string[],
  ufoVariant?: string | null,
): HomeShipPreviewVisuals {
  const visuals = getHomeShipVisuals(equippedItems)
  return {
    window: visuals.window,
    wear: visuals.wear,
    hat: visuals.hat,
    buddy: visuals.buddy,
    effect: visuals.effect,
    ufo: ufoVariant ?? undefined,
  }
}

export function equipShopItem(currentEquippedItems: string[], itemId: string): string[] {
  const item = getShopItemById(itemId)
  if (!item) {
    return currentEquippedItems
  }
  const slot = getEquipmentSlotForKind(item.kind)
  return [
    ...currentEquippedItems.filter((equippedId) => {
      const equippedItem = getShopItemById(equippedId)
      return equippedItem ? !slot.kinds.includes(equippedItem.kind) : false
    }),
    item.id,
  ]
}
