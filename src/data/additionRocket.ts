import type { AdditionAreaId } from './planets'

export type AdditionRocketDifficultyId = 'easy' | 'normal' | 'hard'

export type AdditionRocketDifficultyDefinition = {
  id: AdditionRocketDifficultyId
  label: string
  description: string
  title: string
  areaIds: AdditionAreaId[]
}

export const additionRocketDifficulties: AdditionRocketDifficultyDefinition[] = [
  {
    id: 'easy',
    label: 'やさしい',
    description: '1けたのたしざん',
    title: 'ろけっとびぎなー',
    areaIds: ['add-within-9', 'add-within-10', 'add-carry-basic'],
  },
  {
    id: 'normal',
    label: 'ふつう',
    description: '2けたまでのたしざん',
    title: 'ろけっとぱいろっと',
    areaIds: [
      'add-within-9',
      'add-within-10',
      'add-carry-basic',
      'add-two-digit-no-carry',
      'add-two-digit-carry',
    ],
  },
  {
    id: 'hard',
    label: 'むずかしい',
    description: '3けたまでのたしざん',
    title: 'ろけっときゃぷてん',
    areaIds: [
      'add-within-9',
      'add-within-10',
      'add-carry-basic',
      'add-two-digit-no-carry',
      'add-two-digit-carry',
      'add-three-digit',
    ],
  },
]

export function getAdditionRocketDifficulty(
  difficultyId: string | null | undefined,
): AdditionRocketDifficultyDefinition {
  return (
    additionRocketDifficulties.find((difficulty) => difficulty.id === difficultyId) ??
    additionRocketDifficulties[0]
  )
}
