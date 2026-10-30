"use client";

type Props = {
  running: boolean;
  remaining: number;
  minutes: number;
  topicTitle?: string;
};

export default function StudyRoom3DDesk({ running, remaining, minutes, topicTitle }: Props) {
  const formattedTime = `${String(Math.floor(remaining / 60)).padStart(2, "0")}:${String(remaining % 60).padStart(2, "0")}`;
  const hourAngle = ((remaining % 43_200) / 43_200) * 360;
  const minuteAngle = ((remaining % 3_600) / 3_600) * 360;
  const secondAngle = ((remaining % 60) / 60) * 360;

  return (
    <section className={`focus-clock-module${running ? " is-running" : ""}`} aria-label="Focus timer clock">
      <div className="focus-clock-face" role="img" aria-label={`${formattedTime} remaining`}>
        <svg viewBox="0 0 160 160" aria-hidden="true">
          <circle className="focus-clock-dial" cx="80" cy="80" r="72" />
          {Array.from({ length: 12 }, (_, index) => {
            const major = index % 3 === 0;
            return (
              <line
                key={index}
                className={major ? "focus-clock-mark major" : "focus-clock-mark"}
                x1="80"
                y1={major ? "15" : "18"}
                x2="80"
                y2={major ? "27" : "24"}
                transform={`rotate(${index * 30} 80 80)`}
              />
            );
          })}
          <line className="focus-clock-hour-hand" x1="80" y1="80" x2="80" y2="55" style={{ transform: `rotate(${hourAngle}deg)` }} />
          <line className="focus-clock-minute-hand" x1="80" y1="80" x2="80" y2="39" style={{ transform: `rotate(${minuteAngle}deg)` }} />
          <line className="focus-clock-second-hand" x1="80" y1="86" x2="80" y2="28" style={{ transform: `rotate(${secondAngle}deg)` }} />
          <circle className="focus-clock-center" cx="80" cy="80" r="4" />
        </svg>
      </div>
      <div className="focus-clock-copy">
        <span className="focus-clock-kicker">FOCUS TIMER</span>
        <strong aria-live="off">{formattedTime}</strong>
        <span className="focus-clock-status">{running ? "In progress" : remaining === 0 ? "Time is up" : "Ready"}</span>
        <span className="focus-clock-topic">{topicTitle || `${minutes}-minute session`}</span>
      </div>
    </section>
  );
}
