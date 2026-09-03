import PageHero from '@/components/PageHero';

export const metadata = {
  title: 'Car Rentals | Johan Adolf Pengel International Airport',
};

type Provider = {
  name: string;
  address?: string;
  tel?: string;
  mobile?: string;
  fax?: string;
  email?: string;
  note?: string;
};

const PROVIDERS: Provider[] = [
  { name: 'AVIS Suriname', tel: '(+597) 551158', mobile: '(+597) 08775645', email: 'sales@avissuriname.com' },
  { name: 'Budget Suriname', tel: '(+597) 8810618 | 8748439' },
  { name: 'Europcar Suriname', note: 'Available at the airport.' },
  {
    name: 'Ross Rental Cars',
    address: 'Kwattaweg 264, Paramaribo, Suriname',
    tel: '(+597) 432200',
    mobile: '(+597) 8568668',
    fax: '(+597) 432782',
    email: 'info@rossrentalcars.com',
  },
];

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-2">
      <dt className="text-slate-muted w-16 shrink-0">{label}</dt>
      <dd className="text-navy font-medium">{value}</dd>
    </div>
  );
}

export default function CarRentalsPage() {
  return (
    <main className="flex-1">
      <PageHero eyebrow="Business & Services" title="Car Rentals" />
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <p className="text-slate-muted text-lg leading-relaxed max-w-3xl mb-8">
          The following car rental booths are located at the airport.
        </p>

        <div className="grid sm:grid-cols-2 gap-6">
          {PROVIDERS.map((p) => (
            <div key={p.name} className="rounded-xl border border-gray-200 p-6">
              <h2 className="font-heading text-lg font-bold text-navy mb-3">{p.name}</h2>
              {p.note && <p className="text-sm text-slate-muted">{p.note}</p>}
              <dl className="text-sm space-y-1">
                {p.address && <Row label="Address" value={p.address} />}
                {p.tel && <Row label="Tel" value={p.tel} />}
                {p.mobile && <Row label="Mobile" value={p.mobile} />}
                {p.fax && <Row label="Fax" value={p.fax} />}
                {p.email && (
                  <Row
                    label="Email"
                    value={
                      <a href={`mailto:${p.email}`} className="text-cta hover:text-navy transition-colors">
                        {p.email}
                      </a>
                    }
                  />
                )}
              </dl>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
