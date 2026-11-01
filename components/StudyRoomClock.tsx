"use client";

import { useEffect, useState } from "react";

type Props = {
  running: boolean;
  remaining: number;
  minutes: number;
  topicTitle?: string;
  todayFocusMinutes: number;
};

export default function StudyRoomClock({ running, remaining, minutes, topicTitle, todayFocusMinutes }: Props) {
  const formattedTime = `${String(Math.floor(remaining / 60)).padStart(2, "0")}:${String(remaining % 60).padStart(2, "0")}`;
  const [visualRemaining, setVisualRemaining] = useState(remaining);

  useEffect(() => {
    setVisualRemaining(remaining);
    if (!running) return;

    // Smooth the clock hands between the main timer's one-second updates.
    const ticker = window.setInterval(() => {
      setVisualRemaining(value => Math.max(0, value - 0.05));
    }, 50);
    return () => window.clearInterval(ticker);
  }, [remaining, running]);

  const elapsedRatio = Math.min(1, Math.max(0, (minutes * 60 - visualRemaining) / Math.max(1, minutes * 60)));
  const hourAngle = elapsedRatio * 30;
  const minuteAngle = elapsedRatio * 360;
  const secondAngle = ((minutes * 60 - visualRemaining) % 60) * 6;

  return (
    <section className={`focus-clock-module${running ? " is-running" : ""}${remaining === 0 ? " is-ringing" : ""}`} aria-label="Focus timer clock">
      <div className="focus-clock-face" role="img" aria-label={`${formattedTime} remaining`}>
        <svg viewBox="0 0 200 180" aria-hidden="true">
          <path className="focus-clock-bell focus-clock-bell-left" d="M48 47 42 38Q41 26 51 20L59 16Q71 14 79 23L88 43Z" />
          <path className="focus-clock-bell focus-clock-bell-right" d="m152 47 6-9q1-12-9-18l-8-4q-12-2-20 7l-9 20z" />
          <path className="focus-clock-handle" d="M88 30q12-19 24 0" />
          <path className="focus-clock-support" d="m78 44 9 9m35-9-9 9" />
          <circle className="focus-clock-shell" cx="100" cy="101" r="59" />
          <circle className="focus-clock-dial" cx="100" cy="101" r="50" />
          {Array.from({ length: 12 }, (_, index) => {
            const major = index % 3 === 0;
            return (
              <line
                key={index}
                className={major ? "focus-clock-mark major" : "focus-clock-mark"}
                x1="100"
                y1={major ? "57" : "59"}
                x2="100"
                y2={major ? "68" : "66"}
                transform={`rotate(${index * 30} 100 101)`}
              />
            );
          })}
          <line className="focus-clock-hour-hand" x1="100" y1="101" x2="100" y2="82" style={{ transform: `rotate(${hourAngle}deg)` }} />
          <line className="focus-clock-minute-hand" x1="100" y1="101" x2="100" y2="67" style={{ transform: `rotate(${minuteAngle}deg)` }} />
          <line className="focus-clock-second-hand" x1="100" y1="107" x2="100" y2="58" style={{ transform: `rotate(${secondAngle}deg)` }} />
          <circle className="focus-clock-center" cx="100" cy="101" r="4.5" />
          <path className="focus-clock-leg" d="m61 144-7 15m85-15 7 15" />
        </svg>
      </div>
      <div className="focus-clock-copy">
        <span className="focus-clock-kicker">FOCUS TIMER</span>
        <strong aria-live="off">{formattedTime}</strong>
        <span className="focus-clock-status">{running ? "In progress" : remaining === 0 ? "Time is up" : "Ready"}</span>
        <span className="focus-clock-topic">{topicTitle || `${minutes}-minute session`}</span>
      </div>
      <div className="focus-clock-today" aria-live="polite"><span>TODAY’S FOCUS</span><strong>{todayFocusMinutes}<small> min</small></strong><small>Total focused today</small></div>
    </section>
  );
}
