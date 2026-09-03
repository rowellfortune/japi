'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PlaneIcon, ChatBubbleIcon } from './icons';
import { askChat } from '@/lib/chatBus';

// Mirrors the navigation structure of japi-airport.com. Content pages we don't have are
// wired to the AI assistant (pre-loaded with a relevant question) instead of dead links.
type Leaf = { label: string } & ({ href: string } | { ask: string });
type Item = { label: string; href?: string; ask?: string; children?: Leaf[] };

const NAV: Item[] = [
  { label: 'Home', href: '/' },
  {
    label: 'Flight Schedule',
    href: '/flights?direction=departures&showAllFlights=true',
    children: [
      { label: 'Check-In Times', href: '/check-in-times' },
      { label: 'Visa Requirements & Health Information', href: '/visa-requirements' },
    ],
  },
  {
    label: 'About JAPI-Airport',
    href: '/about',
    children: [
      { label: 'History', href: '/about#history' },
      { label: 'Contact', href: '/about#contact' },
      { label: 'Announcement', ask: 'Are there any current airport announcements?' },
      { label: 'Interne telefoonlijst', ask: 'What are the airport contact numbers?' },
      { label: 'Airport Statistics', ask: 'What are the airport statistics?' },
      { label: 'Infomercials', ask: 'Tell me about Johan Adolf Pengel International Airport.' },
      { label: 'Pilot Information', ask: 'What information is available for pilots?' },
      { label: 'Runway Run 2022', ask: 'Tell me about the Runway Run event.' },
      { label: 'Downloads', ask: 'What documents and forms can I download?' },
    ],
  },
  { label: 'Airlines & Destinations', href: '/airlines' },
  {
    label: 'Business',
    href: '/business',
    children: [
      { label: 'Airport Courtesy Services', href: '/airport-courtesy-services' },
      { label: 'Park & Fly', href: '/park-fly' },
      { label: 'Fly-In & Fuel', href: '/fly-in-fuel' },
      { label: 'Shop, Eat & Relax', href: '/shop-eat-relax' },
      { label: 'Advertising', href: '/advertising' },
      { label: 'Airport Fees and Charges', href: '/airport-fees' },
      { label: 'Cold Storage', href: '/cold-storage' },
      { label: 'Parking', href: '/parking' },
      { label: 'Car Rentals', href: '/car-rentals' },
      { label: 'Airport Rules', href: '/airport-rules' },
      { label: 'Safety & Security', href: '/safety-security' },
    ],
  },
  { label: 'Contact us', href: '/about#contact' },
];

function LeafLink({ leaf, onNavigate }: { leaf: Leaf; onNavigate: () => void }) {
  const cls = 'cursor-pointer block w-full text-left px-4 py-2 text-sm text-navy hover:bg-cta/5 hover:text-cta transition-colors';
  if ('href' in leaf) {
    return (
      <Link href={leaf.href} className={cls} onClick={onNavigate}>
        {leaf.label}
      </Link>
    );
  }
  return (
    <button
      className={cls}
      onClick={() => {
        askChat(leaf.ask);
        onNavigate();
      }}
    >
      {leaf.label}
    </button>
  );
}

function Chevron({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
    </svg>
  );
}

export default function Navigation() {
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  // Close open dropdowns when clicking outside the nav or when the route changes.
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenMenu(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isActive = (item: Item) => {
    if (!item.href) return false;
    if (item.href === '/') return pathname === '/';
    // Match the route portion (ignore query string / hash) as a prefix.
    const route = item.href.split(/[?#]/)[0];
    return route !== '/' && pathname.startsWith(route);
  };

  const closeAll = () => {
    setOpenMenu(null);
    setMobileOpen(false);
  };

  return (
    <nav ref={navRef} className="sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 font-heading font-extrabold text-lg text-navy shrink-0">
          <span className="flex items-center justify-center w-8 h-8 rounded bg-navy text-white">
            <PlaneIcon className="w-5 h-5" />
          </span>
          <span className="leading-none">
            PBM
            <span className="block text-[10px] font-sans font-semibold tracking-widest text-slate-muted">PARAMARIBO</span>
          </span>
        </Link>

        {/* Desktop menu */}
        <div className="hidden lg:flex items-center gap-1">
          {NAV.map((item) => {
            const active = isActive(item);
            if (!item.children) {
              return item.href ? (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`cursor-pointer px-3 py-2 text-sm font-semibold rounded transition-colors ${
                    active ? 'text-cta' : 'text-navy hover:text-cta'
                  }`}
                >
                  {item.label}
                </Link>
              ) : (
                <button
                  key={item.label}
                  onClick={() => {
                    if ('ask' in item) askChat((item as { ask: string }).ask);
                  }}
                  className="cursor-pointer px-3 py-2 text-sm font-semibold rounded text-navy hover:text-cta transition-colors"
                >
                  {item.label}
                </button>
              );
            }
            const open = openMenu === item.label;
            return (
              <div key={item.label} className="relative">
                <button
                  onClick={() => setOpenMenu(open ? null : item.label)}
                  aria-expanded={open}
                  className={`cursor-pointer flex items-center gap-1 px-3 py-2 text-sm font-semibold rounded transition-colors ${
                    active || open ? 'text-cta' : 'text-navy hover:text-cta'
                  }`}
                >
                  {item.label}
                  <Chevron className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
                </button>
                {open && (
                  <div className="absolute left-0 top-full mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg py-1.5 z-40">
                    {item.href && (
                      <Link
                        href={item.href}
                        onClick={closeAll}
                        className="cursor-pointer block px-4 py-2 text-sm font-semibold text-navy hover:bg-cta/5 hover:text-cta transition-colors border-b border-gray-100 mb-1"
                      >
                        View {item.label}
                      </Link>
                    )}
                    {item.children.map((leaf) => (
                      <LeafLink key={leaf.label} leaf={leaf} onNavigate={closeAll} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          <Link
            href="/admin/flights"
            className={`cursor-pointer px-3 py-2 text-sm font-semibold rounded transition-colors ${
              pathname.startsWith('/admin') ? 'text-cta' : 'text-navy hover:text-cta'
            }`}
          >
            Admin
          </Link>
          <button
            onClick={() => askChat('How can you help me?')}
            aria-label="Open AI Assistant"
            className="cursor-pointer ml-1 text-navy hover:text-cta transition-colors"
          >
            <ChatBubbleIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
          className="lg:hidden cursor-pointer text-navy p-2"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white max-h-[70vh] overflow-y-auto">
          <div className="px-4 py-3 space-y-1">
            {NAV.map((item) => {
              if (!item.children) {
                return item.href ? (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={closeAll}
                    className="cursor-pointer block px-2 py-2.5 text-sm font-semibold text-navy hover:text-cta"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <button
                    key={item.label}
                    onClick={() => {
                      if ('ask' in item) askChat((item as { ask: string }).ask);
                      closeAll();
                    }}
                    className="cursor-pointer block w-full text-left px-2 py-2.5 text-sm font-semibold text-navy hover:text-cta"
                  >
                    {item.label}
                  </button>
                );
              }
              const open = openMenu === item.label;
              return (
                <div key={item.label}>
                  <button
                    onClick={() => setOpenMenu(open ? null : item.label)}
                    aria-expanded={open}
                    className="cursor-pointer w-full flex items-center justify-between px-2 py-2.5 text-sm font-semibold text-navy"
                  >
                    {item.label}
                    <Chevron className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
                  </button>
                  {open && (
                    <div className="pl-4 pb-2 space-y-0.5">
                      {item.href && (
                        <Link
                          href={item.href}
                          onClick={closeAll}
                          className="cursor-pointer block px-2 py-2 text-sm font-medium text-cta"
                        >
                          View {item.label}
                        </Link>
                      )}
                      {item.children.map((leaf) => (
                        <LeafLink key={leaf.label} leaf={leaf} onNavigate={closeAll} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            <Link
              href="/admin/flights"
              onClick={closeAll}
              className="cursor-pointer block px-2 py-2.5 text-sm font-semibold text-navy hover:text-cta"
            >
              Admin
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
