import { getLevelIconById } from './levelIcons'

export type PlayerIcon = {
  id: string
  label: string
  emoji: string
}

export const playerIcons: PlayerIcon[] = [
  { id: 'たまご', label: 'たまご', emoji: '🥚' },
  { id: 'ほし', label: 'ほし', emoji: '⭐' },
  { id: 'はな', label: 'はな', emoji: '🌸' },
  { id: 'そら', label: 'そら', emoji: '☁️' },
]

export function getPlayerIcon(iconId: string | null | undefined): PlayerIcon {
  const levelIcon = getLevelIconById(iconId)
  if (levelIcon) {
    return {
      id: levelIcon.id,
      label: levelIcon.label,
      emoji: '✦',
    }
  }
  return playerIcons.find((icon) => icon.id === iconId) ?? playerIcons[0]
}
