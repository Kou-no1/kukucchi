export type LevelIconDefinition = {
  id: string
  label: string
  unlockLevel: number
  motif: 'star' | 'moon' | 'rocket' | 'ufo' | 'galaxy' | 'comet' | 'planet' | 'crown'
  colors: {
    base: string
    accent: string
    glow: string
  }
}

export const levelIconDefinitions: LevelIconDefinition[] = [
  {
    id: 'level-star',
    label: 'ほし',
    unlockLevel: 5,
    motif: 'star',
    colors: { base: '#ffe36e', accent: '#fff7bf', glow: '#ffd94a' },
  },
  {
    id: 'level-moon',
    label: 'つき',
    unlockLevel: 10,
    motif: 'moon',
    colors: { base: '#dffcff', accent: '#8fd3ff', glow: '#baf7ff' },
  },
  {
    id: 'level-rocket',
    label: 'ロケット',
    unlockLevel: 15,
    motif: 'rocket',
    colors: { base: '#ff9f43', accent: '#5be9f4', glow: '#ffcf75' },
  },
  {
    id: 'level-ufo',
    label: 'UFO',
    unlockLevel: 20,
    motif: 'ufo',
    colors: { base: '#7cf5ff', accent: '#a78bfa', glow: '#5be9f4' },
  },
  {
    id: 'level-galaxy',
    label: 'ぎんが',
    unlockLevel: 25,
    motif: 'galaxy',
    colors: { base: '#a78bfa', accent: '#ff72b6', glow: '#7d8dff' },
  },
  {
    id: 'level-comet',
    label: 'すいせい',
    unlockLevel: 30,
    motif: 'comet',
    colors: { base: '#8fd3ff', accent: '#ffffff', glow: '#5be9f4' },
  },
  {
    id: 'level-planet',
    label: 'わくせい',
    unlockLevel: 35,
    motif: 'planet',
    colors: { base: '#51d7b4', accent: '#ffe36e', glow: '#76f0a8' },
  },
  {
    id: 'level-crown',
    label: 'コスモ',
    unlockLevel: 40,
    motif: 'crown',
    colors: { base: '#ffd86a', accent: '#ff72b6', glow: '#fff2a8' },
  },
]

export function getLevelIconById(iconId: string | null | undefined): LevelIconDefinition | undefined {
  return levelIconDefinitions.find((icon) => icon.id === iconId)
}

export function getUnlockedLevelIcons(level: number): LevelIconDefinition[] {
  return levelIconDefinitions.filter((icon) => level >= icon.unlockLevel)
}

export function isLevelIconUnlocked(iconId: string, level: number): boolean {
  const icon = getLevelIconById(iconId)
  return Boolean(icon && level >= icon.unlockLevel)
}

export function getLevelIconUnlocksBetween(
  previousLevel: number,
  currentLevel: number,
): LevelIconDefinition[] {
  return levelIconDefinitions.filter(
    (icon) => previousLevel < icon.unlockLevel && currentLevel >= icon.unlockLevel,
  )
}
