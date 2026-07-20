import PageHero from '@/components/PageHero';

export const metadata = {
  title: 'Airport Fees and Charges | Johann Adolf Pengel International Airport',
};

const FEES: { category: string; rate: string }[] = [
  { category: 'Aircraft Landing Charges (up to 5,000 kg)', rate: 'USD 25 per flight' },
  { category: 'Aircraft Landing Charges (over 5,000 kg)', rate: 'USD 5.50 per 1,000 kg' },
  { category: 'Aircraft Parking Fees', rate: 'First 4 hours free, thereafter USD 0.50 per 1,000 kg per 24 hrs' },
  { category: 'Air Navigation Facility Charge (international, under 10,000 kg)', rate: 'USD 50 per flight' },
  { category: 'Passenger Service Charge (facility)', rate: 'USD 35 per departing passenger' },
  { category: 'Passenger Service Charge (security)', rate: 'USD 18 per departing passenger' },
  { category: 'Cargo Cold Storage', rate: 'USD 0.09 per kg per 24 hrs' },
  { category: 'Landside Car Parking (daily)', rate: 'USD 3 per vehicle per time' },
  { category: 'Landside Car Parking (overnight)', rate: 'USD 12.50' },
  { category: 'Airport Activity — Security Fee', rate: '15% of subtotal' },
];

export default function AirportFeesPage() {
  return (
    <main className="flex-1">
      <PageHero eyebrow="Business & Services" title="Airport Fees and Charges" />
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <p className="text-slate-muted leading-relaxed max-w-3xl mb-8">
          The fee schedule below was last updated September 2025. All rates exclude 10% VAT.
          Commercial advertising rates (billboards, wall space, banners) are available on request from
          Commercial Affairs.
        </p>

        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-navy text-white text-left">
                <th className="py-3 px-4 font-semibold uppercase tracking-wide">Category</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wide">Rate</th>
              </tr>
            </thead>
            <tbody>
              {FEES.map((f, i) => (
                <tr key={f.category} className={`border-t border-gray-100 ${i % 2 === 1 ? 'bg-slate-50/60' : ''}`}>
                  <td className="py-3 px-4 text-slate-700">{f.category}</td>
                  <td className="py-3 px-4 font-medium text-navy whitespace-nowrap">{f.rate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-slate-muted mt-4">
          Rates are provided for reference and may change — confirm current charges with Commercial
          Affairs before operating.
        </p>
      </section>
    </main>
  );
}
