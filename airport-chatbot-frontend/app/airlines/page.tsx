import Link from 'next/link';
import PageHero from '@/components/PageHero';
import { ArrowRightIcon } from '@/components/icons';

export const metadata = {
  title: 'Airlines & Destinations | Johan Adolf Pengel International Airport',
};

type Airline = { carrier: string; destinations: string; website?: string };

const AIRLINES: Airline[] = [
  { carrier: 'Caribbean Airlines', destinations: 'Port of Spain (POS), Georgetown–Ogle (OGL)', website: 'caribbean-airlines.com' },
  { carrier: 'Copa Airlines', destinations: 'Panama City (PTY)', website: 'copaair.com' },
  { carrier: 'Fly All Ways', destinations: 'Georgetown (GEO), Havana / Cuba', website: 'flyallways.com' },
  { carrier: 'GOL Transportes Aéreos', destinations: 'Belém (BEL)', website: 'voegol.com.br' },
  { carrier: 'KLM', destinations: 'Amsterdam (AMS)', website: 'klm.com' },
  {
    carrier: 'Surinam Airways',
    destinations: 'Amsterdam (AMS), Aruba (AUA), Belém (BEL), Barbados (BGI), Curaçao (CUR), Georgetown (GEO), Miami (MIA), Port of Spain (POS)',
    website: 'flyslm.com',
  },
  { carrier: 'Trans Guyana Airways (TGA)', destinations: 'Regional (Guyana)' },
];

export default function AirlinesPage() {
  return (
    <main className="flex-1">
      <PageHero eyebrow="Fly from PBM" title="Airlines & Destinations" />

      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <p className="text-slate-muted leading-relaxed max-w-2xl mb-8">
          The following carriers operate scheduled service to and from Johan Adolf Pengel
          International Airport (IATA: PBM · ICAO: SMJP).
        </p>

        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-navy text-white text-left">
                <th className="py-3 px-4 font-semibold uppercase tracking-wide">Carrier</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wide">Destinations</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wide">Website</th>
              </tr>
            </thead>
            <tbody>
              {AIRLINES.map((a, i) => (
                <tr key={a.carrier} className={`border-t border-gray-100 ${i % 2 === 1 ? 'bg-slate-50/60' : ''}`}>
                  <td className="py-3 px-4 font-semibold text-navy whitespace-nowrap">{a.carrier}</td>
                  <td className="py-3 px-4 text-slate-700">{a.destinations}</td>
                  <td className="py-3 px-4">
                    {a.website ? (
                      <a
                        href={`https://${a.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cta font-medium hover:text-navy transition-colors"
                      >
                        {a.website}
                      </a>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-slate-muted mt-4">
          Routes and airline websites are provided for reference and may change — confirm details with
          the airline before you travel.
        </p>

        <Link
          href="/flights?direction=departures&showAllFlights=true"
          className="cursor-pointer mt-8 inline-flex items-center gap-1.5 text-cta font-semibold hover:text-navy transition-colors"
        >
          View live flight schedule
          <ArrowRightIcon className="w-4 h-4" />
        </Link>
      </section>
    </main>
  );
}
