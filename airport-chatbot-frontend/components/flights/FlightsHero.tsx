import Image from 'next/image';

export default function FlightsHero() {
  return (
    <section className="relative bg-navy overflow-hidden">
      <Image
        src="/images/flights-hero.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      {/* navy wash keeps the heading legible over the photo */}
      <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/85 to-navy/40" />
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-white">Search Flights</h1>
      </div>
    </section>
  );
}
