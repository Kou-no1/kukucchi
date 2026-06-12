import type { UfoDefinition } from '../../data/ufos'

type UfoBadgeProps = {
  ufo?: UfoDefinition
  locked?: boolean
  compact?: boolean
  className?: string
}

export function UfoBadge({
  ufo,
  locked = false,
  compact = false,
  className = '',
}: UfoBadgeProps) {
  const visibleLights = locked || !ufo ? 3 : ufo.lights
  const classes = [
    'ufo-badge',
    ufo ? `ufo-badge-${ufo.variant}` : '',
    locked ? 'locked' : '',
    compact ? 'compact' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classes} aria-hidden="true">
      <div className="ufo-badge-dome">
        <span>{locked || !ufo ? '?' : ufo.motif}</span>
      </div>
      <div className="ufo-badge-body">
        {Array.from({ length: visibleLights }, (_, index) => (
          <i key={index} />
        ))}
      </div>
      <div className="ufo-badge-beam" />
    </div>
  )
}
