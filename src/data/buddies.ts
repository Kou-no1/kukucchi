export type BuddyTheme = 'space-creature' | 'celestial' | 'robot'
export type BuddySource = 'shop' | 'treasure'

export type BuddyDefinition = {
  id: string
  no: number
  name: string
  theme: BuddyTheme
  price: number
  source: BuddySource
  description: string
}

export const buddyThemeLabels: Record<BuddyTheme, string> = {
  'space-creature': 'うちゅういきもの',
  celestial: 'てんたい',
  robot: 'ロボット',
}

export const buddyDefinitions: BuddyDefinition[] = [
  {
    id: 'star-jelly',
    no: 1,
    name: 'ほしクラゲ',
    theme: 'space-creature',
    price: 300,
    source: 'shop',
    description: 'ふわふわひかる うちゅうのなかま',
  },
  {
    id: 'space-cat',
    no: 2,
    name: 'うちゅうネコ',
    theme: 'space-creature',
    price: 350,
    source: 'shop',
    description: 'しずかによりそう ねこのなかま',
  },
  {
    id: 'space-rabbit',
    no: 3,
    name: 'スペースうさぎ',
    theme: 'space-creature',
    price: 350,
    source: 'shop',
    description: 'ぴょんととぶ うさぎのなかま',
  },
  {
    id: 'cosmo-penguin',
    no: 4,
    name: 'コスモペンギン',
    theme: 'space-creature',
    price: 400,
    source: 'shop',
    description: 'こおりのほしからきた なかま',
  },
  {
    id: 'tiny-star',
    no: 5,
    name: 'ちびほし',
    theme: 'celestial',
    price: 250,
    source: 'shop',
    description: 'ちいさくまたたく ほしのなかま',
  },
  {
    id: 'crescent-friend',
    no: 6,
    name: 'みかづきん',
    theme: 'celestial',
    price: 300,
    source: 'shop',
    description: 'にこにこした みかづきのなかま',
  },
  {
    id: 'planet-kun',
    no: 7,
    name: 'わくせいくん',
    theme: 'celestial',
    price: 300,
    source: 'shop',
    description: 'わっかをつけた わくせいのなかま',
  },
  {
    id: 'rainbow-star',
    no: 8,
    name: 'にじほし',
    theme: 'celestial',
    price: 350,
    source: 'treasure',
    description: 'にじいろにひかる とくべつなほし',
  },
  {
    id: 'navi-robo',
    no: 9,
    name: 'ナビロボ',
    theme: 'robot',
    price: 350,
    source: 'shop',
    description: 'すすむみちをおしえる ロボなかま',
  },
  {
    id: 'mini-droid',
    no: 10,
    name: 'ミニドロイド',
    theme: 'robot',
    price: 400,
    source: 'shop',
    description: 'ちいさなメカの なかま',
  },
  {
    id: 'star-bot',
    no: 11,
    name: 'スターボット',
    theme: 'robot',
    price: 400,
    source: 'shop',
    description: 'ほしマークの ロボなかま',
  },
  {
    id: 'cosmo-navi',
    no: 12,
    name: 'コスモナビ',
    theme: 'robot',
    price: 450,
    source: 'shop',
    description: 'うちゅうをあんないする ロボなかま',
  },
]

export const shopBuddyDefinitions = buddyDefinitions.filter((buddy) => buddy.source === 'shop')
export const treasureBuddyDefinitions = buddyDefinitions.filter(
  (buddy) => buddy.source === 'treasure',
)

export function getBuddyById(buddyId: string): BuddyDefinition | undefined {
  return buddyDefinitions.find((buddy) => buddy.id === buddyId)
}

export function isTreasureBuddyChest(chestId: string): boolean {
  return chestId === 'rainbow-chest' || chestId === 'star-chest'
}
