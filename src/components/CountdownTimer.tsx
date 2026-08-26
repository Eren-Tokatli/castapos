"use client";

import { useEffect, useState } from "react";

function msUntilNextMidnight() {
  const now = new Date();
  const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
  return nextMidnight.getTime() - now.getTime();
}

function formatDuration(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${days} Gün ${pad(hours)} Saat ${pad(minutes)} Dakika ${pad(seconds)} Saniye`;
}

/** Cosmetic countdown to local midnight — purely a front-end "today's deals"
 * urgency cue, not tied to any real expiry/inventory data. */
export function CountdownTimer() {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    // Client-only: avoids an SSR/client hydration mismatch on the initial value.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRemaining(msUntilNextMidnight());
    const interval = setInterval(() => {
      setRemaining(msUntilNextMidnight());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (remaining === null) {
    return <span className="countdown-timer">-- Gün -- Saat -- Dakika -- Saniye</span>;
  }

  return <span className="countdown-timer">{formatDuration(remaining)}</span>;
}
