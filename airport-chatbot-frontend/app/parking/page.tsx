import Link from 'next/link';
import PageHero from '@/components/PageHero';
import ContactBlock from '@/components/ContactBlock';
import { ArrowRightIcon } from '@/components/icons';

export const metadata = {
  title: 'Parking | Johann Adolf Pengel International Airport',
};

export default function ParkingPage() {
  return (
    <main className="flex-1">
      <PageHero eyebrow="Business & Services" title="Parking" />
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-10">
        <p className="text-slate-muted text-lg leading-relaxed max-w-3xl">
          A growing number of local customers prefer to leave their vehicle at the airport when
          departing abroad. We have a comfortable and spacious overnight parking facility where the
          customer can leave their vehicle in a designated, closed parking box, for a registered
          period.
        </p>

        <Link
          href="/park-fly"
          className="cursor-pointer inline-flex items-center gap-1.5 text-cta font-semibold hover:text-navy transition-colors"
        >
          See our Park &amp; Fly options
          <ArrowRightIcon className="w-4 h-4" />
        </Link>

        <ContactBlock
          heading="Reservations & information"
          org="Commercial Affairs, N.V. Luchthavenbeheer"
          address="Wayambostraat 5 – Zorg en Hoop, Paramaribo, Suriname"
          tel="+597 (0) 325 113"
          email="comzak@japi-airport.com"
        />
      </section>
    </main>
  );
}
