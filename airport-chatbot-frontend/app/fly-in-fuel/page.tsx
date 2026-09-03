import Link from 'next/link';
import PageHero from '@/components/PageHero';
import { ArrowRightIcon } from '@/components/icons';

export const metadata = {
  title: 'Fly-In & Fuel | Johan Adolf Pengel International Airport',
};

export default function FlyInFuelPage() {
  return (
    <main className="flex-1">
      <PageHero eyebrow="For pilots" title="Fly-In & Fuel" />
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-10">
        <div className="space-y-4 text-slate-muted leading-relaxed max-w-3xl">
          <p>This page is for pilots who intend to fly to or via SMJP / PBM (JAP International Airport).</p>
          <p>
            The airport is a convenient place to fly-in, stop &amp; stretch your legs, fuel up the
            plane or helicopter 24/7, and continue your journey.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <div className="rounded-xl border border-gray-200 p-6">
            <h2 className="font-heading text-lg font-bold text-navy mb-2">Fuel availability</h2>
            <p className="text-sm text-slate-muted leading-relaxed">
              Currently only JET A1 fuel is available at the JAP International Airport. AvGas is
              available only at an alternate location.
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 p-6">
            <h2 className="font-heading text-lg font-bold text-navy mb-2">Fuel operator</h2>
            <p className="text-sm text-slate-muted leading-relaxed">
              The fuel operator and handler at the JAP Airport is SOL Aviation, which handles fuel for
              both Sol Petroleum and GOw2.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <Link
            href="/airport-fees"
            className="cursor-pointer inline-flex items-center gap-1.5 text-cta font-semibold hover:text-navy transition-colors"
          >
            Airport fees &amp; charges
            <ArrowRightIcon className="w-4 h-4" />
          </Link>
          <Link
            href="/safety-security"
            className="cursor-pointer inline-flex items-center gap-1.5 text-cta font-semibold hover:text-navy transition-colors"
          >
            Safety &amp; Security
            <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
