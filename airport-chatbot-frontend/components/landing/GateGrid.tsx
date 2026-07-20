'use client';

import { useEffect, useState } from 'react';
import { publicAPI } from '@/lib/api';
import { PublicGate } from '@/lib/types';
import { statusBadgeClass } from './statusStyles';

export default function GateGrid() {
  const [gates, setGates] = useState<PublicGate[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    publicAPI
      .getGates()
      .then((data) => {
        if (!cancelled) setGates(data);
      })
      .catch(() => {
        if (!cancelled) setError('Could not load gate data right now.');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return <p className="text-sm text-red-600 py-6 text-center">{error}</p>;
  }

  if (!gates) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-2" aria-label="Loading gates" aria-live="polite">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-20 rounded-lg bg-slate-100 animate-pulse" />
        ))}
      </div>
    );
  }

  if (gates.length === 0) {
    return <p className="text-sm text-slate-muted py-6 text-center">No gate data available.</p>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {gates.map((g) => (
        <div key={g.gateNumber} className="rounded-lg border border-gray-200 p-3">
          <div className="flex items-center justify-between">
            <span className="font-heading font-bold text-navy">{g.gateNumber}</span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${statusBadgeClass(g.status)}`}>
              {g.status}
            </span>
          </div>
          <p className="text-xs text-slate-muted mt-1">{g.terminal}</p>
          {g.currentFlightNumber && (
            <p className="text-xs text-slate-700 mt-1">Flight {g.currentFlightNumber}</p>
          )}
        </div>
      ))}
    </div>
  );
}
