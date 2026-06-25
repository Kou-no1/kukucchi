import type { SubtractionAreaId } from './planets'

export type SubtractionRocketDifficultyId = 'easy' | 'normal' | 'hard'

export type SubtractionRocketDifficultyDefinition = {
  id: SubtractionRocketDifficultyId
  label: string
  description: string
  title: string
  areaIds: SubtractionAreaId[]
}

export const subtractionRocketDifficulties: SubtractionRocketDifficultyDefinition[] = [
  {
    id: 'easy',
    label: 'やさしい',
    description: '1けたのひきざん',
    title: 'ひきざんろけっとびぎなー',
    areaIds: ['sub-within-9', 'sub-within-10', 'sub-borrow-basic'],
  },
  {
    id: 'normal',
    label: 'ふつう',
    description: '2けたまでのひきざん',
    title: 'ひきざんろけっとぱいろっと',
    areaIds: [
      'sub-within-9',
      'sub-within-10',
      'sub-borrow-basic',
      'sub-two-digit-no-borrow',
      'sub-two-digit-borrow',
    ],
  },
  {
    id: 'hard',
    label: 'むずかしい',
    description: '3けたまでのひきざん',
    title: 'ひきざんろけっときゃぷてん',
    areaIds: [
      'sub-within-9',
      'sub-within-10',
      'sub-borrow-basic',
      'sub-two-digit-no-borrow',
      'sub-two-digit-borrow',
      'sub-three-digit',
    ],
  },
]

export function getSubtractionRocketDifficulty(
  difficultyId: string | null | undefined,
): SubtractionRocketDifficultyDefinition {
  return (
    subtractionRocketDifficulties.find((difficulty) => difficulty.id === difficultyId) ??
    subtractionRocketDifficulties[0]
  )
}
