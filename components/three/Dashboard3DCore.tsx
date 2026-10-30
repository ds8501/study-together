type Props = {
  progress: number;
  completed: number;
  inProgress: number;
  remaining: number;
  streak: number;
};

export default function Dashboard3DCore({ progress, completed, inProgress, remaining, streak }: Props) {
  const radius = 57;
  const circumference = 2 * Math.PI * radius;
  const safeProgress = Math.max(0, Math.min(progress, 100));

  return (
    <div className="mastery-visual" aria-label={`${safeProgress}% roadmap mastery`}>
      <svg className="mastery-visual-ring" viewBox="0 0 144 144" aria-hidden="true">
        <circle className="mastery-visual-track" cx="72" cy="72" r={radius} />
        <circle
          className="mastery-visual-progress"
          cx="72"
          cy="72"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - safeProgress / 100)}
        />
      </svg>
      <div className="mastery-visual-center">
        <strong>{safeProgress}%</strong>
        <span>Mastery</span>
      </div>
      <div className="mastery-visual-caption">
        <span>{completed} completed</span><i />
        <span>{inProgress} active</span>
      </div>
      {streak > 0 && <span className="mastery-streak">{streak} day streak</span>}
      <span className="mastery-visual-sr">{remaining} topics remaining</span>
    </div>
  );
}
