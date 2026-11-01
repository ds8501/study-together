"use client";

import { Crown } from "lucide-react";

type Row = {
  name: string;
  completed: number;
  streak?: number;
  you?: boolean;
};

type Props = {
  rows: Row[];
};

export default function Leaderboard3DPodium({ rows }: Props) {
  const places = [
    { rank: 2, row: rows[1] },
    { rank: 1, row: rows[0] },
    { rank: 3, row: rows[2] }
  ];

  return (
    <section className="leaderboard-podium" aria-label="Top three leaderboard podium">
      {places.map(({ rank, row }) => (
        <article className={`podium-place podium-place-${rank}`} key={rank}>
          <div className="podium-person">
            {rank === 1 && <Crown className="podium-crown" size={19} aria-label="First place" />}
            <span className={`podium-avatar${row ? "" : " is-empty"}`} aria-hidden="true">{row?.name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join("").toUpperCase() ?? "?"}</span>
            <span className="podium-rank">{rank === 1 ? "1st" : rank === 2 ? "2nd" : "3rd"}</span>
            <strong>{row?.name ?? (rank === 3 ? "Open spot" : "Waiting for a challenger")}{row?.you && <small>YOU</small>}</strong>
            <span>{row ? `${row.completed} topics completed` : "Invite a friend to join"}</span>
          </div>
          <div className="podium-block" aria-hidden="true"><b>{String(rank).padStart(2, "0")}</b></div>
        </article>
      ))}
    </section>
  );
}
