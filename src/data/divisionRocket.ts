import type { DivisionAreaId } from './planets'

export type DivisionRocketDifficultyId = 'easy' | 'normal' | 'hard'

export type DivisionRocketDifficultyDefinition = {
  id: DivisionRocketDifficultyId
  label: string
  description: string
  areaIds: DivisionAreaId[]
  title: string
}

export const divisionRocketDifficulties: DivisionRocketDifficultyDefinition[] = [
  {
    id: 'easy',
    label: 'やさしい',
    description: 'あまりなしのわりざん',
    areaIds: ['divide-no-remainder'],
    title: 'わりざんロケットビギナー',
  },
  {
    id: 'normal',
    label: 'ふつう',
    description: 'あまりのあるわりざん',
    areaIds: ['divide-with-remainder'],
    title: 'わりざんロケットパイロット',
  },
  {
    id: 'hard',
    label: 'むずかしい',
    description: '大きいかずのわりざん',
    areaIds: ['divide-large'],
    title: 'わりざんロケットキャプテン',
  },
]

export function getDivisionRocketDifficulty(
  difficultyId: DivisionRocketDifficultyId,
): DivisionRocketDifficultyDefinition {
  return (
    divisionRocketDifficulties.find((difficulty) => difficulty.id === difficultyId) ??
    divisionRocketDifficulties[0]
  )
}
