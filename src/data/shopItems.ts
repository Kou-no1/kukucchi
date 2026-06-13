export type ShopItemKind =
  | 'wear'
  | 'hat'
  | 'furniture'
  | 'wallpaper'
  | 'background'
  | 'effect'
  | 'pet'

export type ShopItem = {
  id: string
  no: number
  name: string
  description: string
  price: number
  emoji: string
  kind: ShopItemKind
}

export type EquipmentSlotId = 'wear' | 'hat' | 'room' | 'buddy'

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
    label: 'ふく',
    emptyLabel: 'ふくなし',
    kinds: ['wear'],
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
    kinds: ['effect', 'pet'],
  },
]

export const shopItems: ShopItem[] = [
  {
    id: 'blue-neon-room',
    no: 1,
    name: 'あおひかりのかべ',
    description: 'くくっちごうのまどがあおくひかる',
    price: 50,
    emoji: '💎',
    kind: 'wallpaper',
  },
  {
    id: 'starry-seat',
    no: 2,
    name: 'ほしぞらいす',
    description: 'れんしゅうせきをきらきらにする',
    price: 80,
    emoji: '🌌',
    kind: 'furniture',
  },
  {
    id: 'comet-ship',
    no: 3,
    name: 'すいせいひかり',
    description: 'うしろにあおいひかりがのびる',
    price: 120,
    emoji: '☄️',
    kind: 'effect',
  },
  {
    id: 'mini-orbit-pet',
    no: 4,
    name: 'みにおーびっと',
    description: 'ふわふわついてくるちいさななかま',
    price: 180,
    emoji: '🛰️',
    kind: 'pet',
  },
  {
    id: 'green-cape',
    no: 5,
    name: 'みどりひらひら',
    description: 'くくっちがすこしゆうしゃきぶん',
    price: 250,
    emoji: '🟢',
    kind: 'wear',
  },
  {
    id: 'star-cap',
    no: 6,
    name: 'ほしぼうし',
    description: 'あたまにちいさなほしがひかる',
    price: 350,
    emoji: '⭐',
    kind: 'hat',
  },
  {
    id: 'moon-window',
    no: 7,
    name: 'つきのまど',
    description: 'そとにやさしいつきがみえる',
    price: 480,
    emoji: '🌙',
    kind: 'background',
  },
  {
    id: 'soft-sofa',
    no: 8,
    name: 'もこもこいす',
    description: 'きゅうけいじかんがたのしくなる',
    price: 650,
    emoji: '🛋️',
    kind: 'furniture',
  },
  {
    id: 'sparkle-trail',
    no: 9,
    name: 'きらきらおび',
    description: 'せいかいのあとにひかりがながれる',
    price: 880,
    emoji: '✨',
    kind: 'effect',
  },
  {
    id: 'pico-pet',
    no: 10,
    name: 'ぴこぴこなかま',
    description: 'にこにこはねるなかま',
    price: 1200,
    emoji: '🔵',
    kind: 'pet',
  },
  {
    id: 'rainbow-suit',
    no: 11,
    name: 'にじいろふく',
    description: 'うちゅうのひかりみたいなふく',
    price: 1500,
    emoji: '🌈',
    kind: 'wear',
  },
  {
    id: 'rocket-helmet',
    no: 12,
    name: 'ろけっとぼうし',
    description: 'しゅっぱつじゅんびばっちり',
    price: 2000,
    emoji: '🚀',
    kind: 'hat',
  },
  {
    id: 'aurora-wall',
    no: 13,
    name: 'ゆらゆらかべ',
    description: 'へやがゆらゆらあおくひかる',
    price: 2600,
    emoji: '🩵',
    kind: 'wallpaper',
  },
  {
    id: 'planet-view',
    no: 14,
    name: 'わくせいまど',
    description: 'おおきなほしをながめられる',
    price: 3300,
    emoji: '🪐',
    kind: 'background',
  },
  {
    id: 'crystal-desk',
    no: 15,
    name: 'すいしょうつくえ',
    description: 'もんだいがきらっとみえるつくえ',
    price: 4100,
    emoji: '💠',
    kind: 'furniture',
  },
  {
    id: 'comet-burst',
    no: 16,
    name: 'すいせいぱちぱち',
    description: 'れんぞくせいかいでひかりがはじける',
    price: 5000,
    emoji: '💥',
    kind: 'effect',
  },
  {
    id: 'luna-pet',
    no: 17,
    name: 'つきのなかま',
    description: 'つきのようにしずかによりそう',
    price: 6200,
    emoji: '🌝',
    kind: 'pet',
  },
  {
    id: 'galaxy-cloak',
    no: 18,
    name: 'ぎんがころも',
    description: 'ほしぞらをまとったふく',
    price: 7500,
    emoji: '🌠',
    kind: 'wear',
  },
  {
    id: 'crown-hat',
    no: 19,
    name: 'きんいろかんむり',
    description: 'がんばりやさんのかがやくぼうし',
    price: 9000,
    emoji: '👑',
    kind: 'hat',
  },
  {
    id: 'cosmos-stage',
    no: 20,
    name: 'こすもすひろば',
    description: 'うちゅうぜんたいがひろばになる',
    price: 10000,
    emoji: '🌟',
    kind: 'background',
  },
]

export function purchasedShopItemCount(ownedItems: string[]): number {
  const owned = new Set(ownedItems)
  return shopItems.filter((item) => owned.has(item.id)).length
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
