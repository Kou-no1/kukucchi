export function KukucchiCharacter({
  mood = 'happy',
  level = 1,
}: {
  mood?: 'happy' | 'thinking' | 'cheer'
  level?: number
}) {
  return (
    <div className={`kukucchi kukucchi-${mood}`} aria-label="くくっち">
      <div className="ufo-ring">
        <div className="ufo-cockpit">
          <div className="kukucchi-body">
            <span className="antenna antenna-left" />
            <span className="antenna antenna-right" />
            <span className="eye left-eye" />
            <span className="eye right-eye" />
            <span className="mouth" />
            <span className="belly">{level}</span>
          </div>
        </div>
        <div className="ufo-ship">
          <span className="ufo-light light-a" />
          <span className="ufo-light light-b" />
          <span className="ufo-light light-c" />
          <span className="ufo-light light-d" />
        </div>
      </div>
      <div className="kukucchi-shadow" />
    </div>
  )
}
