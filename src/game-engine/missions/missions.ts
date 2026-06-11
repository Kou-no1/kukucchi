import type { DailyMission } from '../../types/game'
import type { SaveData } from '../../types/save'
import { getLocalDateKey } from '../../utils/date'

export function generateDailyMissions(
  save: SaveData,
  date = new Date(),
): DailyMission[] {
  const stage =
    save.player?.learningLevel === 'first'
      ? 2
      : save.player?.learningLevel === 'challenge'
        ? 7
        : 5
  const missions: DailyMission[] = [
    {
      id: `${getLocalDateKey(date)}-correct-10`,
      label: '10もん せいかいしよう',
      kind: 'correct-count',
      target: 10,
      progress: 0,
      completed: false,
    },
    {
      id: `${getLocalDateKey(date)}-stage-${stage}`,
      label: `${stage}のだんを 5もん とこう`,
      kind: 'stage-practice',
      target: 5,
      progress: 0,
      completed: false,
    },
    {
      id: `${getLocalDateKey(date)}-combo-5`,
      label: '5れんぞくを めざそう',
      kind: 'combo',
      target: 5,
      progress: 0,
      completed: false,
    },
  ]
  return missions
}

export function refreshMissionsIfNeeded(
  save: SaveData,
  date = new Date(),
): SaveData {
  const key = getLocalDateKey(date)
  if (save.progress.missionDate === key && save.progress.missions.length > 0) {
    return save
  }
  return {
    ...save,
    progress: {
      ...save.progress,
      missionDate: key,
      missions: generateDailyMissions(save, date),
    },
  }
}
