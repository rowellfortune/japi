import Link from 'next/link';
import { PlaneIcon, FacebookIcon, XIcon, WhatsAppIcon } from './icons';

const COLUMNS: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: 'Flights',
    links: [
      { label: 'Departures', href: '/flights?direction=departures&showAllFlights=true' },
      { label: 'Arrivals', href: '/flights?direction=arrivals&showAllFlights=true' },
      { label: 'Airlines & Destinations', href: '/airlines' },
      { label: 'Check-In Times', href: '/check-in-times' },
    ],
  },
  {
    heading: 'At the airport',
    links: [
      { label: 'Shop, Eat & Relax', href: '/shop-eat-relax' },
      { label: 'Parking', href: '/parking' },
      { label: 'Car Rentals', href: '/car-rentals' },
      { label: 'Safety & Security', href: '/safety-security' },
    ],
  },
  {
    heading: 'About',
    links: [
      { label: 'About JAPI-Airport', href: '/about' },
      { label: 'Visa & Health Info', href: '/visa-requirements' },
      { label: 'Contact us', href: '/about#contact' },
      { label: 'Admin', href: '/admin/flights' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-navy text-slate-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 text-white font-heading font-extrabold text-lg">
              <span className="flex items-center justify-center w-8 h-8 rounded bg-white/10">
                <PlaneIcon className="w-5 h-5 text-white" />
              </span>
              PBM
            </div>
            <p className="mt-4 text-sm text-slate-400 leading-relaxed">
              Johan Adolf Pengel International Airport
              <br />
              Zanderij, Suriname
            </p>
            <div className="mt-5 flex items-center gap-4">
              <span className="text-slate-400 hover:text-white transition-colors cursor-default" aria-label="Facebook">
                <FacebookIcon className="w-5 h-5" />
              </span>
              <span className="text-slate-400 hover:text-white transition-colors cursor-default" aria-label="X">
                <XIcon className="w-5 h-5" />
              </span>
              <span className="text-slate-400 hover:text-white transition-colors cursor-default" aria-label="WhatsApp">
                <WhatsAppIcon className="w-5 h-5" />
              </span>
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <h3 className="font-heading font-bold text-white text-sm uppercase tracking-wide mb-4">
                {col.heading}
              </h3>
              <ul className="space-y-2.5 text-sm">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="cursor-pointer hover:text-white transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-slate-400">
          <p>© 2026 Johan Adolf Pengel International Airport. Flight information is provided for reference only.</p>
          <p>Paramaribo, Suriname</p>
        </div>
      </div>
    </footer>
  );
}
