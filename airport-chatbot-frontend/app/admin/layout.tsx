'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getAdminToken, clearAdminToken } from '@/lib/utils';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // next.config.ts sets trailingSlash: true (required for the S3/CloudFront static export), so
  // usePathname() returns '/admin/login/' rather than '/admin/login' — strip it before comparing.
  const rawPathname = usePathname();
  const pathname = rawPathname !== '/' ? rawPathname.replace(/\/$/, '') : rawPathname;
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (pathname === '/admin/login') {
      setChecked(true);
      return;
    }
    const token = getAdminToken();
    if (!token) {
      router.replace('/admin/login');
      return;
    }
    setChecked(true);
  }, [pathname, router]);

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (!checked) {
    return <div className="p-6">Checking access...</div>;
  }

  const isActive = (path: string) => pathname.startsWith(path);

  const handleLogout = () => {
    clearAdminToken();
    router.push('/admin/login');
  };

  const navLink = (href: string) =>
    `block px-3 py-2 rounded font-semibold text-sm transition-colors ${
      isActive(href) ? 'bg-cta text-white' : 'text-slate-200 hover:bg-white/10'
    }`;

  return (
    <div className="flex flex-1">
      <aside className="w-56 bg-navy text-white p-5 space-y-1.5">
        <p className="font-heading text-xs uppercase tracking-widest text-slate-400 mb-3">Admin Console</p>
        <Link href="/admin/flights" className={navLink('/admin/flights')}>
          Flights
        </Link>
        <Link href="/admin/gates" className={navLink('/admin/gates')}>
          Gates
        </Link>
        <Link href="/admin/baggage" className={navLink('/admin/baggage')}>
          Baggage
        </Link>
        <button
          onClick={handleLogout}
          className="cursor-pointer w-full text-left px-3 py-2 rounded font-semibold text-sm text-red-300 hover:bg-white/10 transition-colors mt-6"
        >
          Log out
        </button>
      </aside>
      <div className="flex-1 bg-surface overflow-auto">{children}</div>
    </div>
  );
}
