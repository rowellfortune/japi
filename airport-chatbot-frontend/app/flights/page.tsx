import { Suspense } from 'react';
import FlightsPageClient from './FlightsPageClient';

export const metadata = {
  title: 'Search Flights | Johan Adolf Pengel Airport',
};

export default function FlightsPage() {
  return (
    <Suspense fallback={<div className="flex-1" />}>
      <FlightsPageClient />
    </Suspense>
  );
}
