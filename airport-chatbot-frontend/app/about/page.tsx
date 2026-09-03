import PageHero from '@/components/PageHero';

export const metadata = {
  title: 'About JAPI-Airport | Johan Adolf Pengel International Airport',
};

const CODES = [
  { label: 'IATA', value: 'PBM' },
  { label: 'ICAO', value: 'SMJP' },
];

export default function AboutPage() {
  return (
    <main className="flex-1">
      <PageHero eyebrow="About" title="About JAPI-Airport" />

      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-12">
        <div className="grid md:grid-cols-2 gap-10 items-start">
          <div id="history">
            <h2 className="font-heading text-2xl font-bold text-navy mb-3">History</h2>
            <p className="text-slate-muted leading-relaxed">
              Johan Adolf Pengel International Airport (IATA: PBM, ICAO: SMJP), also known as
              Paramaribo-Zanderij International Airport, is an airport located in the town of Zanderij,
              45 km south of Paramaribo.
            </p>
            <h3 className="font-heading text-lg font-bold text-navy mt-6 mb-2">Our mission</h3>
            <p className="text-slate-muted leading-relaxed">
              To manage, exploit and sustainably develop safe and customer-oriented airports in
              Suriname.
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 p-6">
            <h3 className="font-heading font-bold text-navy mb-4">Airport codes</h3>
            <div className="grid grid-cols-2 gap-4">
              {CODES.map((c) => (
                <div key={c.label}>
                  <p className="font-heading text-3xl font-extrabold text-navy">{c.value}</p>
                  <p className="text-xs text-slate-muted uppercase tracking-widest mt-1">{c.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div id="contact" className="scroll-mt-16 rounded-xl bg-navy text-white p-6 sm:p-8">
          <h2 className="font-heading text-2xl font-bold mb-5">Contact</h2>
          <dl className="grid sm:grid-cols-2 gap-x-10 gap-y-4 text-sm">
            <div>
              <dt className="text-slate-400 uppercase tracking-wide text-xs mb-1">Address</dt>
              <dd>Wayambostraat #5, Zorg &amp; Hoop</dd>
            </div>
            <div>
              <dt className="text-slate-400 uppercase tracking-wide text-xs mb-1">Email</dt>
              <dd>
                <a href="mailto:info@japi-airport.com" className="hover:text-cta transition-colors">
                  info@japi-airport.com
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-slate-400 uppercase tracking-wide text-xs mb-1">Telephone</dt>
              <dd>401348</dd>
            </div>
            <div>
              <dt className="text-slate-400 uppercase tracking-wide text-xs mb-1">Fax</dt>
              <dd>401600</dd>
            </div>
          </dl>
        </div>
      </section>
    </main>
  );
}
