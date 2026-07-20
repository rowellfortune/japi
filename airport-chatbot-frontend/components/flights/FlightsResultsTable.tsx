'use client';

import { useState } from 'react';
import { PublicFlight } from '@/lib/types';
import { formatTime, statusDotClass, statusTextClass } from '../landing/statusStyles';

interface FlightsResultsTableProps {
  flights: PublicFlight[];
  direction: 'arrivals' | 'departures';
}

const PAGE_SIZE = 10;

export default function FlightsResultsTable({ flights, direction }: FlightsResultsTableProps) {
  const [visible, setVisible] = useState(PAGE_SIZE);

  if (flights.length === 0) {
    return <p className="text-sm text-slate-muted py-10 text-center">No matching flights found.</p>;
  }

  const otherAirportLabel = direction === 'arrivals' ? 'Origin' : 'Destination';
  const shown = flights.slice(0, visible);

  return (
    <div>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-navy text-white text-left">
              <th className="py-3 px-4 font-semibold">Time</th>
              <th className="py-3 px-4 font-semibold">{otherAirportLabel}</th>
              <th className="py-3 px-4 font-semibold">Airline</th>
              <th className="py-3 px-4 font-semibold">Flight</th>
              <th className="py-3 px-4 font-semibold">Gate</th>
              <th className="py-3 px-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((f, i) => (
              <tr
                key={f.flightNumber}
                className={`border-t border-gray-100 ${i % 2 === 1 ? 'bg-slate-50/60' : ''}`}
              >
                <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                  {f.status === 'Cancelled' && (
                    <span className="block text-xs font-bold text-red-600 uppercase mb-0.5">Cancelled</span>
                  )}
                  <span className={f.status === 'Cancelled' ? 'line-through text-slate-400' : ''}>
                    {formatTime(direction === 'arrivals' ? f.arrivalTime : f.departureTime)}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-700">
                  {direction === 'arrivals' ? f.origin : f.destination}
                </td>
                <td className="py-3 px-4 text-slate-700">{f.airline}</td>
                <td className="py-3 px-4 font-semibold text-navy">{f.flightNumber}</td>
                <td className="py-3 px-4 text-slate-700">{f.gateNumber ?? '—'}</td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center gap-1.5 font-medium ${statusTextClass(f.status)}`}>
                    <span className={`w-2 h-2 rounded-full ${statusDotClass(f.status)}`} />
                    {f.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {visible < flights.length && (
        <div className="text-center mt-4">
          <button
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
            className="cursor-pointer text-sm font-medium text-cta hover:text-navy transition-colors inline-flex items-center gap-1"
          >
            Load more ↓
          </button>
        </div>
      )}

      <p className="text-xs text-slate-muted mt-6">
        Flight information is subject to change. Please verify details with your airline before traveling.
      </p>
    </div>
  );
}
