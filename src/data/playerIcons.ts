import { getLevelIconById } from './levelIcons'

export type PlayerIcon = {
  id: string
  label: string
  motif: 'egg' | 'star' | 'flower' | 'sky'
  colors: {
    base: string
    accent: string
    glow: string
  }
}

export const playerIcons: PlayerIcon[] = [
  {
    id: 'たまご',
    label: 'たまご',
    motif: 'egg',
    colors: { base: '#fff3d0', accent: '#ffd86a', glow: '#fff7bf' },
  },
  {
    id: 'ほし',
    label: 'ほし',
    motif: 'star',
    colors: { base: '#ffe36e', accent: '#fff7bf', glow: '#ffd94a' },
  },
  {
    id: 'はな',
    label: 'はな',
    motif: 'flower',
    colors: { base: '#ff9cca', accent: '#fff7bf', glow: '#ffc9e0' },
  },
  {
    id: 'そら',
    label: 'そら',
    motif: 'sky',
    colors: { base: '#8fd3ff', accent: '#ffffff', glow: '#baf7ff' },
  },
]

export function getPlayerIcon(iconId: string | null | undefined): PlayerIcon {
  const levelIcon = getLevelIconById(iconId)
  if (levelIcon) {
    return {
      id: levelIcon.id,
      label: levelIcon.label,
      motif: 'star',
      colors: levelIcon.colors,
    }
  }
  return playerIcons.find((icon) => icon.id === iconId) ?? playerIcons[0]
}
