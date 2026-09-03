'use client';

import { useState } from 'react';
import { colorFor, airlineLogoUrl } from '@/lib/flightDisplay';

interface AirlineLogoProps {
  airline: string;
  code: string;
  className?: string;
}

// Real airline logo when AirHex has one for this IATA code; falls back to the colored-initials
// badge (same one used everywhere else in the app) if the image 404s or the code isn't covered.
export default function AirlineLogo({ airline, code, className = 'w-7 h-7' }: AirlineLogoProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span
        className={`${className} rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 ${colorFor(airline)}`}
      >
        {code.slice(0, 2).toUpperCase()}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={airlineLogoUrl(code)}
      alt={airline}
      className={`${className} object-contain shrink-0`}
      onError={() => setFailed(true)}
    />
  );
}
