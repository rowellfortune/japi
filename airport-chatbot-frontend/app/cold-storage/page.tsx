import PageHero from '@/components/PageHero';
import ContactBlock from '@/components/ContactBlock';

export const metadata = {
  title: 'Cold Storage | Johann Adolf Pengel International Airport',
};

const STATS = [
  { value: '5', label: 'Cold chambers' },
  { value: '51,000 kg', label: 'Total capacity' },
  { value: '60 ton', label: 'Cargo bridge' },
  { value: '24/7', label: 'Availability' },
];

export default function ColdStoragePage() {
  return (
    <main className="flex-1">
      <PageHero eyebrow="Business & Services" title="Cold Storage" />
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-10">
        <p className="text-slate-muted text-lg leading-relaxed max-w-3xl">
          Our cold storage facility can handle your perishable cargo 24/7. We have 5 cold chambers
          available with storage capacity up to 51,000 kg in total, and a 60-ton bridge for cargo
          weight support.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {STATS.map((s) => (
            <div key={s.label} className="rounded-xl border border-gray-200 p-5">
              <p className="font-heading text-2xl font-extrabold text-navy">{s.value}</p>
              <p className="text-xs text-slate-muted uppercase tracking-wide mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <ContactBlock
          heading="Cargo enquiries"
          org="Commercial Affairs, N.V. Luchthavenbeheer"
          address="Wayambostraat 5 – Zorg en Hoop, Paramaribo, Suriname"
          tel="+597 (0) 325 113"
          email="comzak@japi-airport.com"
        />
      </section>
    </main>
  );
}
