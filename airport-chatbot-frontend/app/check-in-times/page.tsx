import Link from 'next/link';
import PageHero from '@/components/PageHero';
import { ClockIcon, ArrowRightIcon } from '@/components/icons';

export const metadata = {
  title: 'Check-In Times | Johan Adolf Pengel International Airport',
};

const WINDOWS = [
  {
    label: 'Amsterdam (AMS) bound flights',
    opens: '5 hours',
    closes: '2 hours',
    note: 'Check-in starts five (05) hours and ends two (02) hours before scheduled departure time.',
  },
  {
    label: 'Regional flights',
    opens: '3 hours',
    closes: '2 hours',
    note: 'Check-in starts three (03) hours and ends two (02) hours before scheduled departure time.',
  },
];

export default function CheckInTimesPage() {
  return (
    <main className="flex-1">
      <PageHero eyebrow="Flight Schedule" title="Check-In Times" />

      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <p className="text-slate-muted text-lg leading-relaxed max-w-2xl">
          Check-in hours vary between airlines and destinations. Consult your airline for more
          information.
        </p>

        <div className="grid sm:grid-cols-2 gap-6 mt-8">
          {WINDOWS.map((w) => (
            <div key={w.label} className="rounded-xl border border-gray-200 p-6">
              <div className="w-10 h-10 rounded-full bg-cta/10 flex items-center justify-center mb-4">
                <ClockIcon className="w-5 h-5 text-cta" />
              </div>
              <h2 className="font-heading font-bold text-navy text-lg mb-3">{w.label}</h2>
              <div className="flex gap-8 mb-3">
                <div>
                  <p className="font-heading text-2xl font-extrabold text-navy">{w.opens}</p>
                  <p className="text-xs text-slate-muted uppercase tracking-wide mt-0.5">before — opens</p>
                </div>
                <div>
                  <p className="font-heading text-2xl font-extrabold text-navy">{w.closes}</p>
                  <p className="text-xs text-slate-muted uppercase tracking-wide mt-0.5">before — closes</p>
                </div>
              </div>
              <p className="text-sm text-slate-muted leading-relaxed">{w.note}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2">
          <Link
            href="/airlines"
            className="cursor-pointer inline-flex items-center gap-1.5 text-cta font-semibold hover:text-navy transition-colors"
          >
            Airlines &amp; destinations
            <ArrowRightIcon className="w-4 h-4" />
          </Link>
          <Link
            href="/flights?direction=departures&showAllFlights=true"
            className="cursor-pointer inline-flex items-center gap-1.5 text-cta font-semibold hover:text-navy transition-colors"
          >
            View flight schedule
            <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
