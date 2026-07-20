import Link from 'next/link';
import PageHero from '@/components/PageHero';
import { ArrowRightIcon } from '@/components/icons';

export const metadata = {
  title: 'Business | Johann Adolf Pengel International Airport',
};

const SERVICES: { href: string; title: string; body: string }[] = [
  { href: '/advertising', title: 'Advertising', body: 'Prime, high-visibility advertising opportunities throughout the airport.' },
  { href: '/airport-fees', title: 'Airport Fees & Charges', body: 'The current schedule of landing, parking, passenger, and cargo charges.' },
  { href: '/cold-storage', title: 'Cold Storage', body: '5 cold chambers, up to 51,000 kg capacity, 24/7 perishable cargo handling.' },
  { href: '/shop-eat-relax', title: 'Shop, Eat & Relax', body: 'Tourist info, banking, duty-free, and the Commercial Activity Center.' },
  { href: '/parking', title: 'Parking', body: 'Comfortable, secured overnight parking while you travel.' },
  { href: '/park-fly', title: 'Park & Fly', body: 'Covered garage boxes and secured area parking solutions.' },
  { href: '/car-rentals', title: 'Car Rentals', body: 'AVIS, Budget, Europcar, and Ross Rental Cars at the airport.' },
  { href: '/fly-in-fuel', title: 'Fly-In & Fuel', body: 'JET A1 fuel and handling 24/7 for visiting pilots.' },
  { href: '/airport-courtesy-services', title: 'Airport Courtesy Services', body: 'Meet-and-assist courtesy services for travellers.' },
];

export default function BusinessPage() {
  return (
    <main className="flex-1">
      <PageHero eyebrow="Business & Services" title="Business" />

      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <p className="text-slate-muted leading-relaxed max-w-3xl mb-8">
          Johann Adolf Pengel International Airport offers a range of commercial and traveller
          services. Explore what&apos;s available below.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="cursor-pointer group rounded-xl border border-gray-200 p-6 hover:border-cta hover:shadow-md transition-all"
            >
              <h2 className="font-heading text-lg font-bold text-navy mb-2 flex items-center justify-between">
                {s.title}
                <ArrowRightIcon className="w-4 h-4 text-cta transition-transform group-hover:translate-x-0.5" />
              </h2>
              <p className="text-sm text-slate-muted leading-relaxed">{s.body}</p>
            </Link>
          ))}
        </div>

        <div className="mt-8 rounded-xl bg-cta/5 border border-cta/20 p-6">
          <h2 className="font-heading text-lg font-bold text-navy mb-2">Contact Commercial Affairs</h2>
          <p className="text-sm text-slate-muted leading-relaxed">
            For advertising, cargo, and commercial enquiries, contact Commercial Affairs, N.V.
            Luchthavenbeheer — Tel +597 (0) 325 113 ·{' '}
            <a href="mailto:comzak@japi-airport.com" className="text-cta font-medium hover:text-navy transition-colors">
              comzak@japi-airport.com
            </a>{' '}
            · or visit{' '}
            <a
              href="https://webshop.japi-airport.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cta font-medium hover:text-navy transition-colors"
            >
              webshop.japi-airport.com
            </a>
            .
          </p>
        </div>
      </section>
    </main>
  );
}
