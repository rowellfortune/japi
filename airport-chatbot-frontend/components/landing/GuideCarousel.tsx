'use client';

import Image from 'next/image';
import { ArrowRightIcon } from '../icons';
import { useHeroTabStore } from '@/lib/store';
import { askChat } from '@/lib/chatBus';

function scrollToFlightInfo() {
  document.getElementById('flight-info')?.scrollIntoView({ behavior: 'smooth' });
}

export default function GuideCarousel() {
  const setTab = useHeroTabStore((s) => s.setTab);

  const cards = [
    {
      image: '/images/guide-departures.jpg',
      title: 'Departures',
      onClick: () => {
        setTab('departures');
        scrollToFlightInfo();
      },
    },
    {
      image: '/images/guide-arrivals.jpg',
      title: 'Arrivals',
      onClick: () => {
        setTab('arrivals');
        scrollToFlightInfo();
      },
    },
    {
      image: '/images/guide-gates.jpg',
      title: 'Gate Status',
      onClick: () => {
        setTab('gates');
        scrollToFlightInfo();
      },
    },
    {
      image: '/images/guide-baggage.jpg',
      title: 'Track Baggage',
      onClick: () => askChat('Track my baggage'),
    },
    {
      image: '/images/guide-ask.jpg',
      title: 'Ask the Assistant',
      onClick: () => {
        setTab('ask');
        scrollToFlightInfo();
      },
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
      <h2 className="font-heading text-2xl font-bold text-navy mb-8">Your guide to PBM</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map(({ image, title, onClick }) => (
          <button
            key={title}
            onClick={onClick}
            className="cursor-pointer group relative h-40 rounded-xl overflow-hidden text-left"
          >
            <Image
              src={image}
              alt={title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/30 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4 flex items-center justify-between">
              <span className="font-heading font-semibold text-white text-sm">{title}</span>
              <ArrowRightIcon className="w-4 h-4 text-white transition-transform group-hover:translate-x-0.5" />
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
