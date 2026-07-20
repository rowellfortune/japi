'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import FlightsHero from '@/components/flights/FlightsHero';
import FlightSearchForm from '@/components/flights/FlightSearchForm';
import FlightsResultsTable from '@/components/flights/FlightsResultsTable';
import { publicAPI } from '@/lib/api';
import { PublicFlight } from '@/lib/types';

type Direction = 'departures' | 'arrivals';

const TIME_WINDOWS = [
  { id: 'all', label: 'All Times' },
  { id: 'morning', label: 'Morning (12am–12pm)' },
  { id: 'afternoon', label: 'Afternoon (12pm–6pm)' },
  { id: 'evening', label: 'Evening (6pm–12am)' },
] as const;

function inTimeWindow(hour: number, window: (typeof TIME_WINDOWS)[number]['id']): boolean {
  if (window === 'all') return true;
  if (window === 'morning') return hour < 12;
  if (window === 'afternoon') return hour >= 12 && hour < 18;
  return hour >= 18;
}

export default function FlightsPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const direction = (searchParams.get('direction') === 'arrivals' ? 'arrivals' : 'departures') as Direction;
  const showAllFlights = searchParams.get('showAllFlights') === 'true';
  const searchBy = searchParams.get('searchBy') === 'flightNumber' ? 'flightNumber' : 'airport';
  const airport = searchParams.get('airport') ?? '';
  const flightNumber = searchParams.get('flightNumber') ?? '';
  const date = searchParams.get('date') ?? new Date().toISOString().slice(0, 10);

  const [flights, setFlights] = useState<PublicFlight[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [airlineFilter, setAirlineFilter] = useState('all');
  const [timeWindow, setTimeWindow] = useState<(typeof TIME_WINDOWS)[number]['id']>('all');

  useEffect(() => {
    let cancelled = false;
    setFlights(null);
    setError(null);
    setAirlineFilter('all');

    publicAPI
      .getFlights(direction, 50)
      .then((data) => {
        if (cancelled) return;
        if (showAllFlights) {
          setFlights(data);
          return;
        }
        const filtered = data.filter((f) => {
          if (searchBy === 'flightNumber') {
            return flightNumber ? f.flightNumber.toLowerCase().includes(flightNumber.toLowerCase()) : true;
          }
          const code = direction === 'arrivals' ? f.origin : f.destination;
          return airport ? code.toLowerCase().includes(airport.toLowerCase()) : true;
        });
        setFlights(filtered);
      })
      .catch(() => {
        if (!cancelled) setError('Could not load flight data right now.');
      });

    return () => {
      cancelled = true;
    };
  }, [direction, showAllFlights, searchBy, airport, flightNumber]);

  const airlines = useMemo(() => {
    if (!flights) return [];
    return Array.from(new Set(flights.map((f) => f.airline))).sort();
  }, [flights]);

  const visibleFlights = useMemo(() => {
    if (!flights) return [];
    return flights.filter((f) => {
      if (airlineFilter !== 'all' && f.airline !== airlineFilter) return false;
      const iso = direction === 'arrivals' ? f.arrivalTime : f.departureTime;
      const hour = new Date(iso).getHours();
      return inTimeWindow(hour, timeWindow);
    });
  }, [flights, airlineFilter, timeWindow, direction]);

  // Parsing "YYYY-MM-DD" via `new Date(string)` treats it as UTC midnight, which can render
  // as the previous day in timezones behind UTC — build from local components instead.
  const [headingYear, headingMonth, headingDay] = date.split('-').map(Number);
  const heading = new Date(headingYear, headingMonth - 1, headingDay).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
  });

  return (
    <main className="flex-1">
      <FlightsHero />

      <section className="max-w-5xl mx-auto px-4 sm:px-6 -mt-8 relative z-10">
        <div className="bg-white rounded-lg shadow-xl p-5 sm:p-6">
          <div className="flex gap-8 border-b border-gray-200 mb-6">
            {(['departures', 'arrivals'] as Direction[]).map((d) => (
              <button
                key={d}
                onClick={() => router.push(`/flights?direction=${d}&showAllFlights=true`)}
                className={`cursor-pointer pb-3 text-lg font-heading font-extrabold uppercase tracking-tight border-b-2 -mb-px transition-colors ${
                  direction === d ? 'text-navy border-cta' : 'text-slate-400 border-transparent hover:text-slate-600'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          <FlightSearchForm
            direction={direction}
            initialSearchBy={searchBy}
            initialAirport={airport}
            initialFlightNumber={flightNumber}
            initialDate={date}
          />
        </div>

        <div className="bg-white rounded-lg shadow-xl mt-6 p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <h2 className="font-heading text-xl font-bold text-navy">
              {heading} {direction === 'departures' ? 'Departures' : 'Arrivals'}
            </h2>

            <div className="flex flex-wrap gap-4">
              <label className="text-xs">
                <span className="block font-semibold text-slate-muted uppercase mb-1">Filter by Airline</span>
                <select
                  value={airlineFilter}
                  onChange={(e) => setAirlineFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cta"
                >
                  <option value="all">All Airlines</option>
                  {airlines.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-xs">
                <span className="block font-semibold text-slate-muted uppercase mb-1">Filter by Time Window</span>
                <select
                  value={timeWindow}
                  onChange={(e) => setTimeWindow(e.target.value as typeof timeWindow)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cta"
                >
                  {TIME_WINDOWS.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {error && <p className="text-sm text-red-600 py-6 text-center">{error}</p>}

          {!error && !flights && (
            <div className="space-y-2 py-2" aria-label="Loading flights" aria-live="polite">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 rounded-md bg-slate-100 animate-pulse" />
              ))}
            </div>
          )}

          {!error && flights && <FlightsResultsTable flights={visibleFlights} direction={direction} />}
        </div>
      </section>

      <div className="h-14" />
    </main>
  );
}
