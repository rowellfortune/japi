'use client';

import { useState } from 'react';
import Image from 'next/image';
import FlightSearchForm from '@/components/flights/FlightSearchForm';
import GateGrid from './GateGrid';
import { PlaneIcon } from '../icons';
import { askChat } from '@/lib/chatBus';
import { useHeroTabStore, HeroTab } from '@/lib/store';

const TABS: { id: HeroTab; label: string }[] = [
  { id: 'ask', label: 'Ask' },
  { id: 'departures', label: 'Departures' },
  { id: 'arrivals', label: 'Arrivals' },
  { id: 'gates', label: 'Gates' },
];

const ASK_SUGGESTIONS = [
  'What gate is my flight at?',
  'Is my flight delayed?',
  'Track my baggage',
  'List all flights',
];

export default function Hero() {
  const { tab, setTab } = useHeroTabStore();
  const [question, setQuestion] = useState('');

  const submitQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    askChat(question);
    setQuestion('');
  };

  return (
    <section id="flight-info" className="scroll-mt-16">
      {/* Photographic hero with the giant airport code, JFK-style */}
      <div className="relative overflow-hidden">
        <Image
          src="/images/hero.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* navy wash keeps the giant white code legible over the photo */}
        <div className="absolute inset-0 bg-gradient-to-b from-navy/85 via-navy/80 to-[#010b3a]/95" />
        {/* faint skyline silhouette for depth */}
        <svg
          aria-hidden="true"
          viewBox="0 0 1200 200"
          preserveAspectRatio="none"
          className="absolute bottom-0 left-0 w-full h-32 text-[#010b3a]"
        >
          <path
            fill="currentColor"
            d="M0 200V120l40-10v40l30-60 25 20V90l35-25v55l40-70 30 40V70l45 30v-30l30 15 35-45v90l40-60 25 35V80l50 40V70l30 20 40-50v110l35-70 30 45V90l45 25V80l35 25 30-40v120l40-80 25 55V110l45 30V90l35 20 30-45v135l40-90 30 60V120l45 25V95l35 30 30-40v90H0z"
          />
        </svg>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-24 sm:pb-32">
          <p className="font-sans text-sm font-semibold tracking-[0.25em] text-white/70 uppercase mb-2">
            Johann Adolf Pengel International Airport
          </p>
          <h1 className="font-heading font-black text-white leading-[0.85] text-[24vw] sm:text-[16rem]">
            PBM
          </h1>
        </div>
      </div>

      {/* Overlapping white card with the tab switcher */}
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 -mt-16 sm:-mt-20 pb-14 z-10">
        <div className="bg-white rounded-lg shadow-xl">
          <div className="flex gap-5 sm:gap-8 border-b border-gray-200 px-5 sm:px-6 pt-4">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`cursor-pointer flex items-center gap-1.5 pb-3 text-lg sm:text-2xl font-heading font-extrabold uppercase tracking-tight border-b-[3px] -mb-px transition-colors ${
                  tab === t.id
                    ? 'text-navy border-cta'
                    : 'text-cta/70 border-transparent hover:text-cta'
                }`}
              >
                {t.label}
                {t.id === 'ask' && <PlaneIcon className="w-4 h-4" />}
              </button>
            ))}
          </div>

          <div className="p-5 sm:p-6 min-h-[200px]">
            {tab === 'ask' && (
              <div>
                <form onSubmit={submitQuestion} className="flex gap-2">
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Ask me anything about your trip"
                    className="flex-1 px-4 py-3 rounded-md border border-gray-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-cta"
                  />
                  <button
                    type="submit"
                    disabled={!question.trim()}
                    aria-label="Ask"
                    className="cursor-pointer shrink-0 w-12 h-12 rounded-md bg-cta text-white flex items-center justify-center hover:bg-navy transition-colors disabled:opacity-50"
                  >
                    <PlaneIcon className="w-5 h-5" />
                  </button>
                </form>

                <div className="flex flex-wrap gap-2 mt-4">
                  {ASK_SUGGESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => askChat(q)}
                      className="cursor-pointer px-4 py-2 rounded-full border border-cta/30 bg-cta/5 text-cta text-sm hover:bg-cta/10 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {tab === 'departures' && <FlightSearchForm direction="departures" />}

            {tab === 'arrivals' && <FlightSearchForm direction="arrivals" />}

            {tab === 'gates' && (
              <div>
                <h2 className="font-heading font-bold text-navy text-lg mb-4">Gate status</h2>
                <GateGrid />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
