import PageHero from '@/components/PageHero';
import ContactBlock from '@/components/ContactBlock';

export const metadata = {
  title: 'Advertising | Johan Adolf Pengel International Airport',
};

export default function AdvertisingPage() {
  return (
    <main className="flex-1">
      <PageHero eyebrow="Business & Services" title="Advertising" />
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-6">
        <div className="space-y-4 text-slate-muted leading-relaxed max-w-3xl">
          <p>Suriname has a booming oil and gold industry. The tourism sector is steadily growing each year.</p>
          <p>
            Given these facts we have an influx of business and leisure travelers passing the Johan
            Adolf Pengel International Airport every day.
          </p>
          <p>
            We offer a wide variety of advertising opportunities at the airport at prime locations with
            high visibility for arriving passengers.
          </p>
        </div>

        <div className="pt-4">
          <ContactBlock
            heading="Advertising enquiries"
            org="Commercial Affairs, N.V. Luchthavenbeheer"
            address="Wayambostraat 5 – Zorg en Hoop, Paramaribo, Suriname"
            tel="+597 (0) 325 113"
            email="comzak@japi-airport.com"
          />
        </div>
      </section>
    </main>
  );
}
