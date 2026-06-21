export type EffectPerformanceMode = 'rich' | 'low' | 'static'

export function averageFrameRate(frameIntervalsMs: number[]): number {
  const usable = frameIntervalsMs.filter((interval) => interval > 0)
  if (usable.length === 0) {
    return 60
  }
  const averageMs = usable.reduce((sum, interval) => sum + interval, 0) / usable.length
  return 1000 / averageMs
}

export function chooseEffectPerformanceMode({
  frameIntervalsMs,
  prefersReducedMotion = false,
  minimumFps = 30,
}: {
  frameIntervalsMs: number[]
  prefersReducedMotion?: boolean
  minimumFps?: number
}): EffectPerformanceMode {
  if (prefersReducedMotion) {
    return 'static'
  }
  return averageFrameRate(frameIntervalsMs) < minimumFps ? 'low' : 'rich'
}
