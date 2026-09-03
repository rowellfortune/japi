import PageHero from '@/components/PageHero';
import ContactBlock from '@/components/ContactBlock';

export const metadata = {
  title: 'Airport Courtesy Services | Johan Adolf Pengel International Airport',
};

const REQUIRED = [
  'Name of person(s) who want to make use of the Courtesy Service',
  'Passport number(s)',
  'Flight information (flight number & travel date)',
];

export default function AirportCourtesyServicesPage() {
  return (
    <main className="flex-1">
      <PageHero eyebrow="At the airport" title="Airport Courtesy Services" />
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-10">
        <p className="text-slate-muted text-lg leading-relaxed max-w-3xl">
          Please find here information regarding our Airport Courtesy Services.
        </p>

        <div>
          <h2 className="font-heading text-2xl font-bold text-navy mb-4">To make a reservation</h2>
          <p className="text-slate-muted mb-4">Please provide the following information:</p>
          <ul className="space-y-2 max-w-2xl">
            {REQUIRED.map((r) => (
              <li key={r} className="flex items-start gap-3 text-slate-700">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-cta shrink-0" />
                {r}
              </li>
            ))}
          </ul>
        </div>

        <ContactBlock heading="Bookings" tel="+597 850-3599" email="courtesy@japi-airport.com" />
      </section>
    </main>
  );
}
