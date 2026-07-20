import { PlaneIcon } from './icons';

export default function PageHero({ eyebrow, title }: { eyebrow?: string; title: string }) {
  return (
    <section className="relative bg-navy overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none select-none absolute -right-10 top-1/2 -translate-y-1/2 opacity-10"
      >
        <PlaneIcon className="w-64 h-64 -rotate-45" />
      </div>
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-14">
        {eyebrow && (
          <p className="font-sans text-xs font-bold tracking-[0.2em] text-white/60 uppercase mb-3">{eyebrow}</p>
        )}
        <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-white">{title}</h1>
      </div>
    </section>
  );
}
