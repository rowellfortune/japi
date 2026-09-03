'use client';

import Link from 'next/link';
import { ChatFlightDetail } from '@/lib/types';
import { colorFor, splitFlightNumber, getTimeDelta } from '@/lib/flightDisplay';
import { formatTime, formatDateLabel, statusDotClass, statusTextClass } from '../landing/statusStyles';
import { PlaneIcon } from '../icons';
import AirlineLogo from './AirlineLogo';

interface FlightDetailCardProps {
  flight: ChatFlightDetail;
}

function updatedLabel(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' });
}

function AirportTime({ iso, scheduledIso, align }: { iso: string; scheduledIso: string | null; align: 'left' | 'right' }) {
  const delta = getTimeDelta(scheduledIso, iso);
  return (
    <div className={align === 'right' ? 'text-right' : 'text-left'}>
      <div className="text-xs text-slate-500">{formatDateLabel(iso)}</div>
      <div className={`text-base font-extrabold ${delta?.isDelayed ? 'text-amber-600' : 'text-navy'}`}>{formatTime(iso)}</div>
    </div>
  );
}

export default function FlightDetailCard({ flight }: FlightDetailCardProps) {
  const { code, num } = splitFlightNumber(flight.flightNumber);

  return (
    <Link
      href={`/flights/detail?flightNumber=${encodeURIComponent(flight.flightNumber)}`}
      className="block mt-2 w-full rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="bg-gradient-to-br from-blue-600 to-blue-900 px-4 pt-3 pb-2.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <AirlineLogo airline={flight.airline} code={code} className="w-6 h-6" />
            <span className="font-bold text-white text-sm truncate">
              {code} {num}
            </span>
            <span className="text-white/70 text-sm">&rarr;</span>
          </div>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold shrink-0 bg-white ${statusTextClass(flight.status)}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusDotClass(flight.status)}`} />
            {flight.status}
          </span>
        </div>
        <div className="text-[11px] text-white/60 mt-1">Updated: {updatedLabel(flight.updatedAt)}</div>
      </div>

      <div className="bg-slate-50 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <span className="font-heading text-2xl font-extrabold text-navy">{flight.origin}</span>
          <span className="flex-1 flex items-center gap-1.5 px-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cta shrink-0" />
            <span className="h-px flex-1 bg-cta/30" />
            <PlaneIcon className="w-4 h-4 text-cta rotate-90 shrink-0" />
            <span className="h-px flex-1 bg-cta/30" />
          </span>
          <span className="font-heading text-2xl font-extrabold text-navy">{flight.destination}</span>
        </div>

        <div className="flex items-start justify-between gap-3 mt-1">
          <AirportTime iso={flight.departureTime} scheduledIso={flight.scheduledDepartureTime} align="left" />
          <AirportTime iso={flight.arrivalTime} scheduledIso={flight.scheduledArrivalTime} align="right" />
        </div>

        {(flight.terminal || flight.gate) && (
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-black/5 text-xs text-slate-600">
            {flight.terminal && (
              <div className="flex items-center gap-1.5">
                <span>Terminal</span>
                <span className={`px-1.5 py-0.5 rounded text-white text-[10px] font-bold ${colorFor(flight.terminal)}`}>{flight.terminal}</span>
              </div>
            )}
            {flight.gate && (
              <div>
                Gate <span className="font-bold text-navy">{flight.gate}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
