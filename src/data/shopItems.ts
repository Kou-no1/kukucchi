export type ShopItem = {
  id: string
  name: string
  description: string
  price: number
  emoji: string
  kind: 'room' | 'ship' | 'pet'
}

export const shopItems: ShopItem[] = [
  {
    id: 'blue-neon-room',
    name: 'ブルーネオン室',
    description: 'くくっち号のまどが青くひかる',
    price: 80,
    emoji: '💎',
    kind: 'room',
  },
  {
    id: 'starry-seat',
    name: '星空シート',
    description: 'まいにちの練習席をきらきらにする',
    price: 120,
    emoji: '🌌',
    kind: 'room',
  },
  {
    id: 'comet-ship',
    name: 'すいせいブースター',
    description: 'スピードモードの気分が上がる',
    price: 160,
    emoji: '☄️',
    kind: 'ship',
  },
  {
    id: 'mini-orbit-pet',
    name: 'ミニオービット',
    description: '図鑑の横でふわふわするなかま',
    price: 200,
    emoji: '🛰️',
    kind: 'pet',
  },
]
