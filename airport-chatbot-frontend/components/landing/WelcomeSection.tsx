import StatusCard from './StatusCard';

export default function WelcomeSection() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14 grid md:grid-cols-2 gap-10 md:gap-16 items-start">
      <div>
        <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-navy leading-tight">
          Welcome to Johan Adolf Pengel International Airport
        </h1>
        <p className="mt-4 text-slate-muted text-base sm:text-lg">
          Your world-class gateway to Suriname.
        </p>
      </div>

      <StatusCard />
    </section>
  );
}
