export function KukucchiCharacter({
  mood = 'happy',
  level = 1,
}: {
  mood?: 'happy' | 'thinking' | 'cheer'
  level?: number
}) {
  return (
    <div className={`kukucchi kukucchi-${mood}`} aria-label="くくっち">
      <div className="kukucchi-body">
        <span className="eye left-eye" />
        <span className="eye right-eye" />
        <span className="mouth" />
        <span className="belly">{level}</span>
      </div>
      <div className="kukucchi-shadow" />
    </div>
  )
}
