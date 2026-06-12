export type RocketBadgeDefinition = {
  id: string
  no: number
  name: string
  distance: number
  emoji: string
  description: string
}

export const rocketBadges: RocketBadgeDefinition[] = [
  {
    id: 'rocket-moon',
    no: 1,
    name: '月タッチ',
    distance: 80,
    emoji: '🌙',
    description: '月までとどいたしるし。',
  },
  {
    id: 'rocket-mars',
    no: 2,
    name: '火星ジャンプ',
    distance: 180,
    emoji: '🔴',
    description: '火星までぐんぐん進んだしるし。',
  },
  {
    id: 'rocket-jupiter',
    no: 3,
    name: '木星クルーズ',
    distance: 300,
    emoji: '🪐',
    description: '木星エリアまでとどいたしるし。',
  },
  {
    id: 'rocket-saturn',
    no: 4,
    name: '土星リング',
    distance: 430,
    emoji: '💫',
    description: '土星の輪まで飛べたしるし。',
  },
  {
    id: 'rocket-nebula',
    no: 5,
    name: '星雲トラベラー',
    distance: 520,
    emoji: '🌌',
    description: '星雲のむこうまで進んだしるし。',
  },
]

export function earnedRocketBadges(distance: number): string[] {
  return rocketBadges
    .filter((badge) => distance >= badge.distance)
    .map((badge) => badge.id)
}
