import PageHero from '@/components/PageHero';

export const metadata = {
  title: 'Safety & Security | Johan Adolf Pengel International Airport',
};

const TIPS = [
  'Keep liquids in containers of three ounces (100 ml) or less, packed in a one-quart clear zip-top bag.',
  'Remove your shoes and jacket before entering the screening lane.',
  'Place laptops and large electronics in a separate screening bin.',
  'Have your valid passport and boarding pass ready.',
];

export default function SafetySecurityPage() {
  return (
    <main className="flex-1">
      <PageHero eyebrow="Before you fly" title="Safety & Security" />
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-10">
        <p className="text-slate-muted text-lg leading-relaxed max-w-3xl">
          Security at Johan Adolf Pengel International Airport is about ensuring the safety of all our
          airport users. We work together with the Civil Aviation Safety Authority Suriname (CASAS) to
          provide the best air travel security possible. Know before you go.
        </p>

        <div>
          <h2 className="font-heading text-2xl font-bold text-navy mb-3">Security screening</h2>
          <p className="text-slate-muted leading-relaxed max-w-3xl">
            To proceed through screening you will need a valid passport and boarding pass. All
            passengers must pass through the screening checkpoint before they can proceed to the
            airline departure gates.
          </p>
        </div>

        <div>
          <h2 className="font-heading text-2xl font-bold text-navy mb-4">Prepare for screening</h2>
          <ul className="space-y-2 max-w-2xl">
            {TIPS.map((t) => (
              <li key={t} className="flex items-start gap-3 text-slate-700">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-cta shrink-0" />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
