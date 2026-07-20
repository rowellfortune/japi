'use client';

import { ArrowRightIcon } from '../icons';
import { askChat } from '@/lib/chatBus';

export default function SpotlightBanner() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
      <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
        {/* Bold typographic graphic block (JFK's World Cup-style panel) */}
        <div className="rounded-lg bg-cta p-8 sm:p-10 flex items-center min-h-[240px]">
          <p className="font-heading font-black text-white leading-[0.9] text-5xl sm:text-6xl uppercase tracking-tight">
            Your journey
            <br />
            starts <span className="text-navy">here</span>
          </p>
        </div>

        <div>
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-navy leading-tight">
            Meet your AI travel assistant
          </h2>
          <p className="mt-4 text-slate-muted leading-relaxed">
            Get real-time answers about flights, gates, and baggage the moment you need them —
            in plain language, any time of day. Ask about a flight number, a gate assignment, or
            where to find your bag, and get a straight answer.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <button
              onClick={() => askChat('What can you help me with?')}
              className="cursor-pointer inline-flex items-center gap-2 text-cta font-semibold hover:text-navy transition-colors group"
            >
              Ask the assistant
              <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={() => askChat('List all flights')}
              className="cursor-pointer inline-flex items-center gap-2 text-cta font-semibold hover:text-navy transition-colors group"
            >
              See today&apos;s flights
              <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
