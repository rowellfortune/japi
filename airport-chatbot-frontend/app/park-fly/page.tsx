import Link from 'next/link';
import PageHero from '@/components/PageHero';
import ContactBlock from '@/components/ContactBlock';
import { ArrowRightIcon } from '@/components/icons';

export const metadata = {
  title: 'Park & Fly | Johan Adolf Pengel International Airport',
};

const OPTIONS = [
  { title: 'Covered Garage Boxen', body: 'Keep your vehicle in a covered, enclosed parking box while you travel.' },
  { title: 'Secured Area Parking', body: 'Park in a secured, monitored area for the duration of your trip.' },
];

export default function ParkFlyPage() {
  return (
    <main className="flex-1">
      <PageHero eyebrow="Business & Services" title="Park & Fly" />
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-10">
        <p className="text-slate-muted text-lg leading-relaxed max-w-3xl">
          Need to fly and park your car at the airport? We have several solutions for you.
        </p>

        <div className="grid sm:grid-cols-2 gap-6">
          {OPTIONS.map((o) => (
            <div key={o.title} className="rounded-xl border border-gray-200 p-6">
              <h2 className="font-heading text-lg font-bold text-navy mb-2">{o.title}</h2>
              <p className="text-sm text-slate-muted leading-relaxed">{o.body}</p>
            </div>
          ))}
        </div>

        <Link
          href="/parking"
          className="cursor-pointer inline-flex items-center gap-1.5 text-cta font-semibold hover:text-navy transition-colors"
        >
          More about airport parking
          <ArrowRightIcon className="w-4 h-4" />
        </Link>

        <ContactBlock
          heading="Reservations"
          org="Commercial Affairs Department"
          tel="+597 325113"
          email="comzak@japi-airport.com"
        />
      </section>
    </main>
  );
}
