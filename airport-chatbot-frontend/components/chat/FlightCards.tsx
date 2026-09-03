'use client';

import Link from 'next/link';
import { ChatFlightSummary } from '@/lib/types';
import { colorFor, splitFlightNumber } from '@/lib/flightDisplay';
import { formatTime, formatDateLabel, statusDotClass, statusTextClass } from '../landing/statusStyles';
import AirlineLogo from './AirlineLogo';

interface FlightCardsProps {
  flights: ChatFlightSummary[];
}

export default function FlightCards({ flights }: FlightCardsProps) {
  if (flights.length === 0) return null;

  return (
    <div className="space-y-2 mt-2 w-full">
      {flights.map((f) => {
        const { code, num } = splitFlightNumber(f.flightNumber);
        const primaryTime = f.status === 'Arrived' ? f.arrivalTime : f.departureTime;

        return (
          <Link
            key={f.flightNumber}
            href={`/flights/detail?flightNumber=${encodeURIComponent(f.flightNumber)}`}
            className="block bg-white border border-black/5 rounded-xl shadow-sm p-3 hover:shadow-md hover:border-cta/20 transition-all"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <AirlineLogo airline={f.airline} code={code} className="w-5 h-5" />
                <span className="font-bold text-navy text-sm truncate">
                  {code} {num}
                </span>
              </div>
              <div className="text-right shrink-0 flex flex-row items-center gap-2">
                <div className="text-sm text-slate-400">{formatDateLabel(primaryTime)}</div>
                <div className="text-sm font-bold text-amber-600">{formatTime(primaryTime)}</div>
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 mt-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-600 min-w-0">
                {f.terminal && (
                  <>
                    <span className="shrink-0">Terminal</span>
                    <span className={`px-1.5 py-0.5 rounded text-white text-[10px] font-bold shrink-0 ${colorFor(f.terminal)}`}>
                      {f.terminal}
                    </span>
                  </>
                )}
                {f.gate && <span className="shrink-0">Gate {f.gate}</span>}
              </div>
              <span className={`inline-flex items-center gap-1 text-xs font-semibold shrink-0 ${statusTextClass(f.status)}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusDotClass(f.status)}`} />
                {f.status}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
