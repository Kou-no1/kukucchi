export function StatPill({
  label,
  value,
  icon,
}: {
  label: string
  value: string | number
  icon?: string
}) {
  return (
    <div className="stat-pill">
      {icon ? (
        <span className="stat-icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span className="stat-label">{label}</span>
      <strong>{value}</strong>
    </div>
  )
}
