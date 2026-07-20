'use client';

import { useEffect, useState } from 'react';
import { publicAPI } from '@/lib/api';

const STATUS_BADGE: Record<string, string> = {
  Scheduled: 'bg-blue-600',
  Boarding: 'bg-amber-500',
  Delayed: 'bg-red-600',
  Arrived: 'bg-green-600',
};

const TRACKED_STATUSES = ['Scheduled', 'Boarding', 'Delayed', 'Arrived'] as const;

export default function StatusCard() {
  const [counts, setCounts] = useState<Record<string, number> | null>(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let cancelled = false;
    publicAPI
      .getFlights(undefined, 50)
      .then((flights) => {
        if (cancelled) return;
        const tally: Record<string, number> = {};
        for (const f of flights) tally[f.status] = (tally[f.status] ?? 0) + 1;
        setCounts(tally);
        setTotal(flights.length);
      })
      .catch(() => {
        if (!cancelled) setCounts({});
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="bg-cta/5 border border-cta/20 rounded-lg overflow-hidden">
      <div className="px-5 py-3 border-b border-cta/20">
        <h2 className="font-heading font-bold text-navy text-sm uppercase tracking-wide">Live Flight Status</h2>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-navy text-white text-left">
            <th className="py-2 px-4 font-semibold">Status</th>
            <th className="py-2 px-4 font-semibold text-right">Flights</th>
          </tr>
        </thead>
        <tbody>
          {TRACKED_STATUSES.map((status) => (
            <tr key={status} className="border-t border-cta/10">
              <td className="py-2.5 px-4">
                <span className="inline-flex items-center gap-2">
                  <span
                    className={`w-5 h-5 rounded flex items-center justify-center text-white text-[10px] font-bold shrink-0 ${STATUS_BADGE[status]}`}
                  >
                    {status[0]}
                  </span>
                  {status}
                </span>
              </td>
              <td className="py-2.5 px-4 text-right text-slate-700 font-medium">{counts ? counts[status] ?? 0 : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="px-5 py-3 text-xs text-slate-muted border-t border-cta/10">
        {counts ? `${total} flights tracked — updated live` : 'Loading…'}
      </p>
    </div>
  );
}
