'use client';

import { useEffect, useState } from 'react';
import { ClockIcon } from '@/components/icons';

// Suriname has one timezone, no DST — America/Paramaribo is always UTC-3.
const TIME_ZONE = 'America/Paramaribo';

// Ticks every second so it reads as a live clock, not a static timestamp. Starts null so the
// server-rendered markup and the first client render match (a "now" computed at build/request
// time would drift from the browser's, causing a hydration mismatch) — it fills in a moment
// after mount instead.
export default function SurinameClock({ className = '' }: { className?: string }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!now) return null;

  const time = now.toLocaleTimeString('en-US', {
    timeZone: TIME_ZONE,
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <ClockIcon className="w-3.5 h-3.5" />
      <span className="uppercase tracking-wide">Suriname Time</span>
      <span className="font-mono tabular-nums font-bold">{time}</span>
    </div>
  );
}
