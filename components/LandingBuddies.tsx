"use client";

import { useEffect, useState, type CSSProperties } from "react";

type Look = { x: number; y: number };

function Buddy({ variant }: { variant: "one" | "two" | "three" }) {
  return (
    <svg className={`landing-buddy landing-buddy-${variant}`} viewBox="0 0 48 48" aria-hidden="true">
      <circle className="landing-buddy-backdrop" cx="24" cy="24" r="23" />
      <g className="landing-buddy-head">
        <path className="landing-buddy-hair" d="M8 25c-2-11 4-20 15-21C35 2 42 11 40 25l-3 5H11z" />
        <ellipse className="landing-buddy-face" cx="24" cy="27" rx="12.6" ry="15" />
        <path className="landing-buddy-fringe" d="M11 20C12 9 18 5 25 5c8 0 12 6 12 14-4-1-7-4-9-7-4 4-10 7-17 8z" />
        <ellipse className="landing-buddy-eye" cx="19" cy="25" rx="3" ry="3.7" />
        <ellipse className="landing-buddy-eye" cx="29" cy="25" rx="3" ry="3.7" />
        <circle className="landing-buddy-pupil" cx="19" cy="25" r="1.45" />
        <circle className="landing-buddy-pupil" cx="29" cy="25" r="1.45" />
        <path className="landing-buddy-smile" d="M21 34q3 2 6 0" />
      </g>
    </svg>
  );
}

export default function LandingBuddies() {
  const [look, setLook] = useState<Look>({ x: 0, y: 0 });

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const follow = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setLook({
        x: Math.max(-1, Math.min(1, (event.clientX / window.innerWidth - 0.5) * 2)),
        y: Math.max(-1, Math.min(1, (event.clientY / window.innerHeight - 0.5) * 2)),
      }));
    };
    const reset = () => setLook({ x: 0, y: 0 });
    window.addEventListener("pointermove", follow, { passive: true });
    window.addEventListener("pointerleave", reset);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", follow);
      window.removeEventListener("pointerleave", reset);
    };
  }, []);

  const style = {
    "--look-x": `${look.x * 1.25}px`,
    "--look-y": `${look.y * 1.1}px`,
    "--head-tilt": `${look.x * 3}deg`,
  } as CSSProperties;

  return <span className="landing-buddies" style={style} aria-hidden="true"><Buddy variant="one"/><Buddy variant="two"/><Buddy variant="three"/></span>;
}
