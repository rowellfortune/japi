import PageHero from '@/components/PageHero';

export const metadata = {
  title: 'Shop, Eat & Relax | Johann Adolf Pengel International Airport',
};

const SERVICES = [
  { title: 'Tourist Information', body: 'The Suriname Tourism Organization maintains an information desk in the Arrivals Terminal.' },
  { title: 'Banking', body: 'De Surinaamsche Bank N.V. operates banking services at the airport.' },
  { title: 'Paris Gallery', body: 'Duty-free perfumes.' },
  { title: "King's Duty Free Shop", body: 'For all your duty-free liquor & tobacco products.' },
];

const CAC_BUSINESSES = [
  'AVIS', 'Budget', 'Europcar', 'Ross Rental Cars',
  'Courtyard by Marriott', 'Bingo Pizza', 'Fernandes Bakkerij',
];

export default function ShopEatRelaxPage() {
  return (
    <main className="flex-1">
      <PageHero eyebrow="At the airport" title="Shop, Eat & Relax" />
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-10">
        <p className="text-slate-muted text-lg leading-relaxed max-w-3xl">
          We offer the following services located inside the Arrivals Terminal of Johann Adolf Pengel
          International Airport.
        </p>

        <div className="grid sm:grid-cols-2 gap-6">
          {SERVICES.map((s) => (
            <div key={s.title} className="rounded-xl border border-gray-200 p-6">
              <h2 className="font-heading text-lg font-bold text-navy mb-2">{s.title}</h2>
              <p className="text-sm text-slate-muted leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>

        <div className="rounded-xl bg-cta/5 border border-cta/20 p-6 sm:p-8">
          <h2 className="font-heading text-xl font-bold text-navy mb-2">Commercial Activity Center (C.A.C.)</h2>
          <p className="text-sm text-slate-muted leading-relaxed max-w-3xl">
            In July 2012, Airport Management Ltd. opened a new portion of the Arrival Terminal called
            the Commercial Activity Center. The facility accommodates around 30 units serving
            passengers and the general public — car rentals, hotels, restaurants, and more.
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            {CAC_BUSINESSES.map((b) => (
              <span key={b} className="px-3 py-1 rounded-full border border-cta/30 bg-white text-cta text-sm">
                {b}
              </span>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
