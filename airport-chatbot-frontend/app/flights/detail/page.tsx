import { Suspense } from 'react';
import FlightDetailClient from './FlightDetailClient';

export const metadata = {
  title: 'Flight Details | Johann Adolf Pengel Airport',
};

export default function FlightDetailPage() {
  return (
    <Suspense fallback={<div className="flex-1" />}>
      <FlightDetailClient />
    </Suspense>
  );
}
