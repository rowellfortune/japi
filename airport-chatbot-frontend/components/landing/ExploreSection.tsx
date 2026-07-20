import Image from 'next/image';
import { UtensilsIcon, ShoppingBagIcon, SofaIcon } from '../icons';

const CARDS = [
  {
    icon: UtensilsIcon,
    image: '/images/dine.jpg',
    alt: 'Airport dining',
    title: 'Dining',
    body: 'Grab a bite before your flight — options for a quick snack or a sit-down meal.',
  },
  {
    icon: ShoppingBagIcon,
    image: '/images/shop.jpg',
    alt: 'Airport shops',
    title: 'Shopping',
    body: 'Duty-free, souvenirs, and last-minute travel essentials in the main terminal.',
  },
  {
    icon: SofaIcon,
    image: '/images/relax.jpg',
    alt: 'Airport lounge seating',
    title: 'Lounges & Rest',
    body: 'Find a quiet spot to relax or recharge while you wait for boarding.',
  },
];

export default function ExploreSection() {
  return (
    <section id="essentials" className="max-w-7xl mx-auto px-4 sm:px-6 py-14 scroll-mt-16">
      <h2 className="font-heading text-2xl font-bold text-navy mb-8">Get your essentials at PBM</h2>
      <div className="grid sm:grid-cols-3 gap-6">
        {CARDS.map(({ icon: Icon, image, alt, title, body }) => (
          <div key={title} className="rounded-xl border border-gray-200 overflow-hidden">
            <div className="relative h-44">
              <Image src={image} alt={alt} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover" />
            </div>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-1">
                <Icon className="w-5 h-5 text-cta" />
                <h3 className="font-heading font-semibold text-navy">{title}</h3>
              </div>
              <p className="text-sm text-slate-muted leading-relaxed">{body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
