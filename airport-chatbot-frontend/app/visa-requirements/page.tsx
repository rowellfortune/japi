import PageHero from '@/components/PageHero';

export const metadata = {
  title: 'Visa Requirements & Health Information | Johan Adolf Pengel International Airport',
};

const EXEMPTIONS = [
  'Holders of a passport from Vatican City',
  'Holders of passports from CARICOM countries',
  'Holders of Diplomatic and Service passports',
  'Holders of a UN Laissez-passer',
  'Holders of a PSA document or PSA card',
  'Those with a still-valid visa',
  'Residents of Suriname',
];

export default function VisaRequirementsPage() {
  return (
    <main className="flex-1">
      <PageHero eyebrow="Flight Schedule" title="Visa Requirements & Health Information" />

      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-10">
        <div>
          <h2 className="font-heading text-2xl font-bold text-navy mb-3">Entry Fee</h2>
          <p className="text-slate-muted leading-relaxed max-w-3xl">
            Starting from July 01, 2022, travelers wishing to visit Suriname for tourism purposes are
            required to pay the Entry Fee to be admitted to the territory of the Republic of Suriname.
            Citizens of <strong className="text-navy">all countries</strong> pay the Entry Fee.
          </p>

          <div className="grid sm:grid-cols-2 gap-4 mt-6 max-w-2xl">
            <div className="rounded-xl border border-gray-200 p-5">
              <p className="font-heading text-3xl font-extrabold text-navy">USD 25 / EUR 25</p>
              <p className="text-sm text-slate-muted mt-1">Entry Fee</p>
            </div>
            <div className="rounded-xl border border-gray-200 p-5">
              <p className="font-heading text-3xl font-extrabold text-navy">USD 8 / EUR 8</p>
              <p className="text-sm text-slate-muted mt-1">VFS service fee</p>
            </div>
          </div>

          <p className="text-sm text-slate-muted leading-relaxed max-w-3xl mt-6">
            Persons in transit who want to leave the airport must have a transit visa and do not pay
            the Entry Fee.
          </p>
        </div>

        <div>
          <h2 className="font-heading text-2xl font-bold text-navy mb-3">Exemptions</h2>
          <p className="text-slate-muted mb-4">The following groups are excluded from payment:</p>
          <ul className="space-y-2 max-w-2xl">
            {EXEMPTIONS.map((e) => (
              <li key={e} className="flex items-start gap-3 text-slate-700">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-cta shrink-0" />
                {e}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl bg-cta/5 border border-cta/20 p-6">
          <h2 className="font-heading text-lg font-bold text-navy mb-2">How to apply</h2>
          <p className="text-sm text-slate-muted leading-relaxed max-w-3xl">
            Apply online through the VFS Global Suriname portal. You will need to upload a copy of your
            passport to complete the Entry Fee Voucher application. Contact your airline or VFS Global
            Suriname for the current application link and processing details.
          </p>
        </div>
      </section>
    </main>
  );
}
