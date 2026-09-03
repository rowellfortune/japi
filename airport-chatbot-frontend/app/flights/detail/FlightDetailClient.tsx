'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { publicAPI } from '@/lib/api';
import { PublicFlightDetail } from '@/lib/types';
import { colorFor, splitFlightNumber, getTimeDelta } from '@/lib/flightDisplay';
import { formatTime, statusBadgeClass, statusDotClass, statusTextClass } from '@/components/landing/statusStyles';
import { PlaneIcon } from '@/components/icons';
import SurinameClock from '@/components/flights/SurinameClock';

// Mirrors HOME_AIRPORTS in the backend's config/fr24.ts — the only two airports this app assigns
// gates/terminals for, so that's the side of the route a flight's terminal/gate belongs to.
const HOME_AIRPORTS = ['PBM'];

function formatFullDate(iso: string): string {
  return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function formatDistance(km: number): string {
  return `${Math.round(km).toLocaleString()} km`;
}

function DetailItem({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div>
      <span className="block text-[10px] font-semibold uppercase tracking-wide text-slate-muted">{label}</span>
      <span className="text-sm font-semibold text-navy">{value}</span>
    </div>
  );
}

function AirportBlock({ code, name, align }: { code: string; name: string | null; align: 'left' | 'right' }) {
  return (
    <div className={align === 'right' ? 'text-right' : 'text-left'}>
      <div className="font-heading text-3xl sm:text-4xl font-extrabold text-navy">{code}</div>
      <div className="text-sm text-slate-muted mt-0.5 max-w-[160px] sm:max-w-[220px]">{name ?? ' '}</div>
    </div>
  );
}

function EventColumn({
  label,
  iso,
  scheduledIso,
  showGate,
  gateNumber,
  terminal,
}: {
  label: string;
  iso: string;
  scheduledIso: string | null;
  showGate: boolean;
  gateNumber: string | null;
  terminal: string | null;
}) {
  const delta = getTimeDelta(scheduledIso, iso);

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-muted mb-1">{label}</p>
      <p className="text-sm text-slate-500">{formatFullDate(iso)}</p>
      <p className={`font-heading text-2xl font-extrabold ${delta?.isDelayed ? 'text-amber-600' : 'text-navy'}`}>{formatTime(iso)}</p>
      {delta?.label && (
        <p className="text-xs text-slate-400 mt-0.5">
          <span className="line-through">{formatTime(scheduledIso!)}</span>{' '}
          <span className={delta.isDelayed ? 'text-amber-600 font-semibold' : 'text-green-600 font-semibold'}>{delta.label}</span>
        </p>
      )}

      {showGate && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3">
          {terminal && (
            <div>
              <span className="block text-[10px] font-semibold uppercase tracking-wide text-slate-muted">Terminal</span>
              <span className={`inline-block mt-0.5 px-2 py-0.5 rounded text-white text-xs font-bold ${colorFor(terminal)}`}>{terminal}</span>
            </div>
          )}
          <div>
            <span className="block text-[10px] font-semibold uppercase tracking-wide text-slate-muted">Gate</span>
            <span className="text-sm font-semibold text-navy">{gateNumber ?? '—'}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FlightDetailClient() {
  const searchParams = useSearchParams();
  const flightNumber = searchParams.get('flightNumber') ?? '';

  const [flight, setFlight] = useState<PublicFlightDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!flightNumber) {
      setError('No flight number given.');
      return;
    }
    setFlight(null);
    setError(null);
    publicAPI
      .getFlight(flightNumber)
      .then(setFlight)
      .catch((err) => {
        setError(err?.response?.status === 404 ? `No flight found matching "${flightNumber}".` : 'Could not load flight details right now.');
      });
  }, [flightNumber]);

  if (error) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center gap-4 py-24 px-4 text-center">
        <p className="text-slate-600">{error}</p>
        <Link href="/flights?showAllFlights=true" className="text-cta font-semibold hover:text-navy transition-colors">
          &larr; Back to flights
        </Link>
      </main>
    );
  }

  if (!flight) {
    return (
      <main className="flex-1">
        <div className="h-56 bg-navy animate-pulse" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-3">
          <div className="h-24 rounded-lg bg-slate-100 animate-pulse" />
          <div className="h-32 rounded-lg bg-slate-100 animate-pulse" />
        </div>
      </main>
    );
  }

  const { code, num } = splitFlightNumber(flight.flightNumber);
  const isOriginHome = HOME_AIRPORTS.includes(flight.origin);
  const isDestinationHome = HOME_AIRPORTS.includes(flight.destination);

  // Nothing in FR24 ever reports "Delayed" (see the backend's fr24Service.ts) — a time change
  // vs. the flight's original schedule is the only signal we actually have for it, so derive the
  // displayed status from that instead of trusting the stored value.
  const departureDelta = flight.status !== 'Cancelled' ? getTimeDelta(flight.scheduledDepartureTime, flight.departureTime) : null;
  const arrivalDelta = flight.status !== 'Cancelled' ? getTimeDelta(flight.scheduledArrivalTime, flight.arrivalTime) : null;
  const displayStatus = departureDelta?.isDelayed || arrivalDelta?.isDelayed ? 'Delayed' : flight.status;

  return (
    <main className="flex-1">
      
      <section className="relative bg-navy overflow-hidden">
        <Image src="/images/flights-hero.jpg" alt="" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/85 to-navy/40" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-16">
          <SurinameClock className="text-white/80 text-xs mb-4" />
          <p className="text-xs font-semibold uppercase tracking-widest text-white/70 mb-2">
            {flight.airline} {code} {num} to
          </p>
          <h1 className="font-heading text-3xl sm:text-5xl font-extrabold text-white leading-tight">
            {flight.destinationName ?? flight.destination}
          </h1>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-6 relative z-10">
        <div className="bg-white rounded-lg shadow-xl p-5 sm:p-8">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusBadgeClass(displayStatus)}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusDotClass(displayStatus)}`} />
              <span className={statusTextClass(displayStatus)}>{displayStatus}</span>
            </span>
            <span className="text-xs text-slate-muted">
              Last updated{' '}
              {new Date(flight.updatedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' })}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 pb-6 border-b border-gray-100">
            <AirportBlock code={flight.origin} name={flight.originName} align="left" />
            <div className="flex-1 flex items-center gap-2 px-2">
              <span className="h-px flex-1 bg-cta/30" />
              <PlaneIcon className="w-5 h-5 text-cta rotate-90" />
              <span className="h-px flex-1 bg-cta/30" />
            </div>
            <AirportBlock code={flight.destination} name={flight.destinationName} align="right" />
          </div>

          <div className="grid grid-cols-2 gap-6 sm:gap-10 pt-6">
            <EventColumn
              label="Departure"
              iso={flight.departureTime}
              scheduledIso={flight.scheduledDepartureTime}
              showGate={isOriginHome}
              gateNumber={flight.gateNumber}
              terminal={flight.terminal}
            />
            <EventColumn
              label="Arrival"
              iso={flight.arrivalTime}
              scheduledIso={flight.scheduledArrivalTime}
              showGate={isDestinationHome}
              gateNumber={flight.gateNumber}
              terminal={flight.terminal}
            />
          </div>

          {flight.fr24 && (
            <div className="pt-6 mt-6 border-t border-gray-100">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-muted mb-3">Flight Details</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-4">
                <DetailItem label="Aircraft" value={flight.aircraft} />
                <DetailItem label="Registration" value={flight.fr24.registration} />
                <DetailItem label="Callsign" value={flight.fr24.callsign} />
                <DetailItem label="Category" value={flight.fr24.category} />
                <DetailItem
                  label="Flight Duration"
                  value={flight.fr24.flightTimeSeconds != null ? formatDuration(flight.fr24.flightTimeSeconds) : null}
                />
                <DetailItem
                  label="Distance Flown"
                  value={flight.fr24.actualDistanceKm != null ? formatDistance(flight.fr24.actualDistanceKm) : null}
                />
                <DetailItem label="Takeoff Runway" value={flight.fr24.runwayTakeoff} />
                <DetailItem label="Landing Runway" value={flight.fr24.runwayLanded} />
              </div>
            </div>
          )}

          <p className="text-xs text-slate-muted mt-8 pt-6 border-t border-gray-100">
            Flight information is subject to change. Please verify details with your airline before traveling.
          </p>
        </div>
      </section>

      <div className="h-14" />
    </main>
  );
}
