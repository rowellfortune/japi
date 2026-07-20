'use client';

import Link from 'next/link';
import { askChat } from '@/lib/chatBus';

export default function AlertsSection() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
      <div className="grid md:grid-cols-2 gap-8 md:gap-12">
        <div>
          <p className="font-sans text-xs font-bold tracking-[0.2em] text-cta uppercase mb-3">
            Before you travel
          </p>
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-navy leading-tight">
            Check your flight status and gate before you leave for the airport
          </h2>
        </div>
        <div className="flex flex-col justify-center">
          <p className="text-slate-muted leading-relaxed">
            Flight times and gate assignments can change. Check the latest status for your flight,
            and reach the assistant any time if you have a question about departures, arrivals,
            gates, or baggage.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/flights?direction=departures&showAllFlights=true"
              className="cursor-pointer px-5 py-2.5 rounded-md bg-cta text-white text-sm font-semibold hover:bg-navy transition-colors"
            >
              View all flights
            </Link>
            <button
              onClick={() => askChat('Is my flight delayed?')}
              className="cursor-pointer px-5 py-2.5 rounded-md border border-cta text-cta text-sm font-semibold hover:bg-cta/5 transition-colors"
            >
              Ask about a flight
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
