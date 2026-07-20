'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface FlightSearchFormProps {
  direction: 'departures' | 'arrivals';
  initialSearchBy?: 'airport' | 'flightNumber';
  initialAirport?: string;
  initialFlightNumber?: string;
  initialDate?: string;
}

const today = () => new Date().toISOString().slice(0, 10);

// Submitting always navigates to the dedicated /flights results page (even when already
// there — it just updates the query string and the results section re-reads it), matching
// how a real airport site separates "search" from "results" into their own URL/page.
export default function FlightSearchForm({
  direction,
  initialSearchBy = 'airport',
  initialAirport = '',
  initialFlightNumber = '',
  initialDate,
}: FlightSearchFormProps) {
  const router = useRouter();
  const airportLabel = direction === 'arrivals' ? 'Origin' : 'Destination';

  const [searchBy, setSearchBy] = useState<'airport' | 'flightNumber'>(initialSearchBy);
  const [airport, setAirport] = useState(initialAirport);
  const [flightNumber, setFlightNumber] = useState(initialFlightNumber);
  const [date, setDate] = useState(initialDate ?? today());

  const buildParams = (showAll: boolean) => {
    const params = new URLSearchParams();
    params.set('direction', direction);
    params.set('date', date);
    if (showAll) {
      params.set('showAllFlights', 'true');
    } else {
      params.set('searchBy', searchBy);
      if (searchBy === 'airport' && airport.trim()) params.set('airport', airport.trim());
      if (searchBy === 'flightNumber' && flightNumber.trim()) params.set('flightNumber', flightNumber.trim());
    }
    return params.toString();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/flights?${buildParams(false)}`);
  };

  return (
    <div>
      <div className="flex items-center gap-6 text-sm mb-4">
        <span className="text-xs font-semibold tracking-wide text-slate-muted uppercase">Search by</span>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name={`${direction}-search-by`}
            checked={searchBy === 'airport'}
            onChange={() => setSearchBy('airport')}
            className="accent-cta cursor-pointer"
          />
          <span className="font-medium text-navy">{airportLabel}</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name={`${direction}-search-by`}
            checked={searchBy === 'flightNumber'}
            onChange={() => setSearchBy('flightNumber')}
            className="accent-cta cursor-pointer"
          />
          <span className="font-medium text-navy">Flight Number</span>
        </label>
      </div>

      <form onSubmit={handleSubmit} className="grid sm:grid-cols-[1fr_1fr_auto] gap-3 items-end">
        <div>
          <label htmlFor={`${direction}-date`} className="block text-xs font-semibold text-slate-muted uppercase mb-1">
            Date
          </label>
          <input
            id={`${direction}-date`}
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cta"
          />
        </div>

        {searchBy === 'airport' ? (
          <div>
            <label htmlFor={`${direction}-airport`} className="block text-xs font-semibold text-slate-muted uppercase mb-1">
              {airportLabel} Airport
            </label>
            <input
              id={`${direction}-airport`}
              value={airport}
              onChange={(e) => setAirport(e.target.value)}
              placeholder={`Select your ${airportLabel.toLowerCase()} (e.g. AMS)`}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cta"
            />
          </div>
        ) : (
          <div>
            <label htmlFor={`${direction}-flight-number`} className="block text-xs font-semibold text-slate-muted uppercase mb-1">
              Flight Number
            </label>
            <input
              id={`${direction}-flight-number`}
              value={flightNumber}
              onChange={(e) => setFlightNumber(e.target.value)}
              placeholder="e.g. KL713"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cta"
            />
          </div>
        )}

        <button
          type="submit"
          className="cursor-pointer px-6 py-2.5 rounded-md bg-cta text-white text-sm font-semibold hover:bg-navy transition-colors"
        >
          Search
        </button>
      </form>

      <button
        onClick={() => router.push(`/flights?${buildParams(true)}`)}
        className="cursor-pointer mt-4 text-sm font-medium text-cta hover:text-navy transition-colors inline-flex items-center gap-1"
      >
        All {direction} flights →
      </button>
    </div>
  );
}
