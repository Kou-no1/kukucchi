export type TreasureTheme = 'star' | 'space' | 'sparkle' | 'creature' | 'sweets'
export type TreasureRarity = 1 | 2 | 3 | 4

export type TreasureItem = {
  id: string
  no: number
  name: string
  theme: TreasureTheme
  rarity: TreasureRarity
  description: string
  placeable: boolean
}

export const treasureThemeLabels: Record<TreasureTheme, string> = {
  star: 'ほし',
  space: 'うちゅう',
  sparkle: 'きらきら',
  creature: 'いきもの',
  sweets: 'おかし',
}

export const treasureItems: TreasureItem[] = [
  { id: 'tiny-star-chip', no: 1, name: 'ちびほしチップ', theme: 'star', rarity: 1, description: 'ちいさなほしのかけら', placeable: true },
  { id: 'moon-drop', no: 2, name: 'つきのしずく', theme: 'star', rarity: 1, description: 'まるいつきからおちたひかり', placeable: true },
  { id: 'star-bell', no: 3, name: 'ほしのベル', theme: 'star', rarity: 2, description: 'ちりんとひかるベル', placeable: true },
  { id: 'milky-star', no: 4, name: 'あまのがわほし', theme: 'star', rarity: 3, description: 'ながれるほしのしるし', placeable: true },
  { id: 'mini-planet', no: 5, name: 'みにわくせい', theme: 'space', rarity: 1, description: 'てのひらサイズのわくせい', placeable: true },
  { id: 'rocket-bolt', no: 6, name: 'ろけっとねじ', theme: 'space', rarity: 1, description: 'ろけっとからみつけたねじ', placeable: true },
  { id: 'comet-bottle', no: 7, name: 'すいせいびん', theme: 'space', rarity: 2, description: 'すいせいのしっぽをいれたびん', placeable: true },
  { id: 'galaxy-map', no: 8, name: 'ぎんがちず', theme: 'space', rarity: 4, description: 'ひみつのほしみちがひかる', placeable: true },
  { id: 'pika-gem', no: 9, name: 'ぴかぴかいし', theme: 'sparkle', rarity: 1, description: 'あおくひかるまるいいし', placeable: true },
  { id: 'mirror-flake', no: 10, name: 'かがみのかけら', theme: 'sparkle', rarity: 2, description: 'ちいさくきらめくかけら', placeable: true },
  { id: 'rainbow-ribbon', no: 11, name: 'にじのリボン', theme: 'sparkle', rarity: 3, description: 'ふわりとにじいろにゆれる', placeable: true },
  { id: 'aurora-crystal', no: 12, name: 'ゆらゆらすいしょう', theme: 'sparkle', rarity: 4, description: 'ゆめみたいにゆれるひかり', placeable: true },
  { id: 'space-snail', no: 13, name: 'うちゅうまいまい', theme: 'creature', rarity: 1, description: 'ゆっくりすすむなかま', placeable: true },
  { id: 'star-fish-friend', no: 14, name: 'ほしうお', theme: 'creature', rarity: 2, description: 'ほしのうみをおよぐ', placeable: true },
  { id: 'moon-rabbit-flag', no: 15, name: 'つきうさフラッグ', theme: 'creature', rarity: 3, description: 'ぴょんとはねるしるし', placeable: true },
  { id: 'nebula-dragon', no: 16, name: 'せいうんりゅう', theme: 'creature', rarity: 4, description: 'くものようにやさしいりゅう', placeable: true },
  { id: 'star-cookie', no: 17, name: 'ほしクッキー', theme: 'sweets', rarity: 1, description: 'さくさくのほしがたおかし', placeable: true },
  { id: 'moon-candy', no: 18, name: 'つきキャンディ', theme: 'sweets', rarity: 2, description: 'まんまるであまいひかり', placeable: true },
  { id: 'comet-parfait', no: 19, name: 'すいせいパフェ', theme: 'sweets', rarity: 3, description: 'しっぽがきらきらのパフェ', placeable: true },
  { id: 'galaxy-cake', no: 20, name: 'ぎんがケーキ', theme: 'sweets', rarity: 4, description: 'うちゅうみたいなごほうび', placeable: true },
]

export function getTreasureItemById(itemId: string): TreasureItem | undefined {
  return treasureItems.find((item) => item.id === itemId)
}

export function rarityStars(rarity: TreasureRarity): string {
  return '★'.repeat(rarity)
}
