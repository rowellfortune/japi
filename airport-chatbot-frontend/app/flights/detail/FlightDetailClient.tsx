'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { publicAPI } from '@/lib/api';
import { PublicFlightDetail, FlightFr24Data } from '@/lib/types';
import { colorFor, splitFlightNumber, getTimeDelta } from '@/lib/flightDisplay';
import { formatTime, formatDateLabel, statusBadgeClass, statusDotClass, statusTextClass } from '@/components/landing/statusStyles';
import { PlaneIcon } from '@/components/icons';
import SurinameClock from '@/components/flights/SurinameClock';

// Mirrors HOME_AIRPORTS in the backend's config/fr24.ts — the only two airports this app assigns
// gates/terminals for, so that's the side of the route a flight's terminal/gate belongs to.
const HOME_AIRPORTS = ['PBM'];

// Suriname has one timezone, no DST — mirrors statusStyles.ts's formatTime/formatDateLabel and
// SurinameClock.tsx. Pinned explicitly so the page reads correctly for any visitor regardless of
// their own device's timezone, not just one who happens to be in Suriname already.
const TIME_ZONE = 'America/Paramaribo';

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function formatDistance(km: number): string {
  return `${Math.round(km).toLocaleString()} km`;
}

// How stale a live ADS-B position report can be before we stop trusting it enough to display —
// FR24 syncs run periodically, so a "live" fix can lag by a few minutes even for an airborne
// aircraft; past this it more likely means the flight has landed and dropped off live tracking.
const LIVE_POSITION_MAX_AGE_MS = 20 * 60 * 1000;

function isLivePositionFresh(updatedAtIso: string | null): boolean {
  if (!updatedAtIso) return false;
  return Date.now() - new Date(updatedAtIso).getTime() < LIVE_POSITION_MAX_AGE_MS;
}

const COMPASS_POINTS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];

function formatHeading(deg: number): string {
  const point = COMPASS_POINTS[Math.round(deg / 22.5) % 16];
  return `${Math.round(deg)}° ${point}`;
}

function formatVerticalSpeed(fpm: number): string {
  if (Math.abs(fpm) < 100) return 'Level';
  const direction = fpm > 0 ? 'Climbing' : 'Descending';
  return `${direction}, ${Math.round(Math.abs(fpm)).toLocaleString()} ft/min`;
}

function LiveFlightData({ fr24 }: { fr24: FlightFr24Data }) {
  return (
    <div className="pt-6 mt-6 border-t border-gray-100">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-muted mb-3 flex items-center gap-1.5">
        <span className="relative flex w-1.5 h-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full w-1.5 h-1.5 bg-green-500" />
        </span>
        Live Position
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-4">
        <DetailItem label="Altitude" value={fr24.liveAltitudeFt != null ? `${Math.round(fr24.liveAltitudeFt).toLocaleString()} ft` : null} />
        <DetailItem label="Ground Speed" value={fr24.liveGroundSpeedKts != null ? `${Math.round(fr24.liveGroundSpeedKts)} kts` : null} />
        <DetailItem label="Vertical Speed" value={fr24.liveVerticalSpeedFpm != null ? formatVerticalSpeed(fr24.liveVerticalSpeedFpm) : null} />
        <DetailItem label="Heading" value={fr24.liveTrackDeg != null ? formatHeading(fr24.liveTrackDeg) : null} />
      </div>
    </div>
  );
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

// Where the plane sits between origin and destination, 0 = still at gate, 1 = at destination.
// Elapsed time against the ETA, not distance: FR24's actual_distance/circle_distance on the
// flight-summary endpoint both measure from the origin to the aircraft's *current* tracked
// position (confirmed by watching both climb together in lockstep call after call), not to the
// destination — so their ratio sits near 100% almost immediately and isn't a usable trip-progress
// signal. Elapsed-vs-ETA is: uses only real timestamps, and — because it's a function of `nowMs`
// (ticking every second, see the caller) against `liveEta` (refreshed every sync to reflect the
// aircraft's actual current speed) — the icon creeps forward continuously and self-corrects on
// each sync, with no separate speed-extrapolation step needed.
function computeRouteProgress(flight: PublicFlightDetail, displayStatus: string, nowMs: number): number {
  if (displayStatus === 'Cancelled' || displayStatus === 'Scheduled' || displayStatus === 'Boarding') return 0;
  if (displayStatus === 'Arrived') return 1;

  const dep = new Date(flight.departureTime).getTime();
  const eta = new Date(flight.fr24?.liveEta ?? flight.arrivalTime).getTime();
  if (eta > dep) {
    return Math.min(1, Math.max(0, (nowMs - dep) / (eta - dep)));
  }
  return 0;
}

// "1h 7m remaining" / "42m remaining" while a flight is in the air; null once it's landed or hasn't left yet.
function formatRemaining(ms: number): string | null {
  if (ms <= 0) return null;
  const totalMinutes = Math.round(ms / 60000);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return h > 0 ? `${h}h ${m}m remaining` : `${m}m remaining`;
}

function RouteProgress({ progress, isInFlight, remainingLabel }: { progress: number; isInFlight: boolean; remainingLabel: string | null }) {
  const pct = `${Math.round(progress * 100)}%`;
  return (
    <div className="flex-1 flex flex-col items-center gap-2 px-3">
      <div className="relative w-full h-3 flex items-center">
        <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[3px] rounded-full bg-slate-200" />
        <span
          className="absolute left-0 top-1/2 -translate-y-1/2 h-[3px] rounded-full bg-navy transition-[width] duration-1000 ease-out"
          style={{ width: `${progress * 100}%` }}
        />
        <span className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-navy" />
        <span className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-2 h-2 rounded-full bg-slate-300" />
        <span
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-[left] duration-1000 ease-out"
          style={{ left: `${progress * 100}%` }}
        >
          <PlaneIcon className={`w-4 h-4 text-navy rotate-90 ${isInFlight ? 'animate-pulse' : ''}`} />
        </span>
      </div>
      {remainingLabel ? (
        <span className="text-xs font-medium text-slate-500">{remainingLabel}</span>
      ) : (
        <span className="sr-only">{`Flight is ${pct} of the way to its destination`}</span>
      )}
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
      <p className="text-sm text-slate-500">{formatDateLabel(iso)}</p>
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
  // Ticks once a second so the plane icon visibly creeps forward (extrapolated from live ground
  // speed) and the remaining-time countdown counts down, instead of both sitting frozen between
  // FR24 syncs.
  const [nowMs, setNowMs] = useState(() => Date.now());

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

  useEffect(() => {
    const interval = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

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
  const routeProgress = computeRouteProgress(flight, displayStatus, nowMs);
  const isInFlight = displayStatus === 'Departed' || displayStatus === 'Delayed';
  // Prefer the real live ETA from ADS-B tracking (updated every sync while airborne) over the
  // arrivalTime estimate, which for a still-airborne flight is only a same-route block-time
  // average computed once at first sighting (see the backend's fr24Service.ts).
  const etaSource = flight.fr24?.liveEta ?? flight.arrivalTime;
  const remainingLabel = isInFlight ? formatRemaining(new Date(etaSource).getTime() - nowMs) : null;
  const livePosition = isInFlight && isLivePositionFresh(flight.fr24?.livePositionUpdatedAt ?? null) ? flight.fr24 : null;

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
              {new Date(flight.updatedAt).toLocaleTimeString('en-US', { timeZone: TIME_ZONE, hour: 'numeric', minute: '2-digit', timeZoneName: 'short' })}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 pb-6 border-b border-gray-100">
            <AirportBlock code={flight.origin} name={flight.originName} align="left" />
            <RouteProgress progress={routeProgress} isInFlight={isInFlight} remainingLabel={remainingLabel} />
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

          {livePosition && <LiveFlightData fr24={livePosition} />}

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
