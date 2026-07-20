'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRightIcon } from '../icons';
import { askChat } from '@/lib/chatBus';

type Item = {
  image: string;
  tag: string;
  title: string;
  body: string;
  cta: string;
} & ({ href: string } | { ask: string });

const ITEMS: Item[] = [
  {
    image: '/images/news-arrive.jpg',
    tag: 'Travel tip',
    title: 'Arrive early for your flight',
    body: 'Give yourself time for check-in, security, and getting to your gate — especially on busy travel days.',
    ask: 'How early should I arrive for my flight?',
    cta: 'Ask the assistant',
  },
  {
    image: '/images/news-baggage.jpg',
    tag: 'Baggage',
    title: 'Track your checked baggage',
    body: 'Have your baggage tag handy and check the status of your bag from check-in through arrival.',
    ask: 'Track my baggage',
    cta: 'Track baggage',
  },
  {
    image: '/images/news-access.jpg',
    tag: 'Accessibility',
    title: 'Assistance is available',
    body: 'Mobility support and help navigating gates, security, and customs. Arrange support in advance through your airline.',
    href: '/#accessibility',
    cta: 'Learn more',
  },
  {
    image: '/images/news-support.jpg',
    tag: 'Support',
    title: 'Questions? Just ask',
    body: 'The AI Assistant answers questions about flights, gates, and baggage in plain language, any time.',
    ask: 'What can you help me with?',
    cta: 'Open assistant',
  },
];

export default function NewsSection() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
      <p className="font-sans text-xs font-bold tracking-[0.2em] text-cta uppercase mb-3">
        News &amp; traveler tips
      </p>
      <h2 className="font-heading text-2xl font-bold text-navy mb-8">Helpful to know before you fly</h2>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {ITEMS.map((item) => {
          const inner = (
            <>
              <div className="relative h-32">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover"
                />
              </div>
              <div className="p-5">
                <span className="text-[11px] font-bold tracking-wide text-cta uppercase">{item.tag}</span>
                <h3 className="font-heading font-semibold text-navy mt-1 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-muted leading-relaxed">{item.body}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-cta text-sm font-semibold">
                  {item.cta}
                  <ArrowRightIcon className="w-4 h-4" />
                </span>
              </div>
            </>
          );

          const cardClass =
            'cursor-pointer text-left block rounded-xl border border-gray-200 overflow-hidden hover:border-cta hover:shadow-md transition-all';

          return 'href' in item ? (
            <Link key={item.title} href={item.href} className={cardClass}>
              {inner}
            </Link>
          ) : (
            <button key={item.title} onClick={() => askChat(item.ask)} className={cardClass}>
              {inner}
            </button>
          );
        })}
      </div>
    </section>
  );
}
