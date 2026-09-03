import Link from 'next/link';
import PageHero from '@/components/PageHero';
import { ArrowRightIcon } from '@/components/icons';

export const metadata = {
  title: 'Airport Rules | Johan Adolf Pengel International Airport',
};

export default function AirportRulesPage() {
  return (
    <main className="flex-1">
      <PageHero eyebrow="Good to know" title="Airport Rules" />
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-6">
        <p className="text-slate-muted text-lg leading-relaxed max-w-3xl">
          To keep every traveller safe and the airport running smoothly, permit and prohibition rules
          apply throughout the terminal and airside areas. Screening and security procedures are
          carried out in cooperation with the Civil Aviation Safety Authority Suriname.
        </p>
        <p className="text-slate-muted leading-relaxed max-w-3xl">
          For the details that matter most to your trip — what you can bring through the checkpoint and
          how screening works — see Safety &amp; Security. For commercial, cargo, or permit questions,
          contact Commercial Affairs.
        </p>

        <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2">
          <Link
            href="/safety-security"
            className="cursor-pointer inline-flex items-center gap-1.5 text-cta font-semibold hover:text-navy transition-colors"
          >
            Safety &amp; Security
            <ArrowRightIcon className="w-4 h-4" />
          </Link>
          <Link
            href="/business"
            className="cursor-pointer inline-flex items-center gap-1.5 text-cta font-semibold hover:text-navy transition-colors"
          >
            Business &amp; services
            <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
