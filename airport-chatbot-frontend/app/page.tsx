import Hero from '@/components/landing/Hero';
import WelcomeSection from '@/components/landing/WelcomeSection';
import SpotlightBanner from '@/components/landing/SpotlightBanner';
import GuideCarousel from '@/components/landing/GuideCarousel';
import ExploreSection from '@/components/landing/ExploreSection';
import AlertsSection from '@/components/landing/AlertsSection';
import AccessibilitySection from '@/components/landing/AccessibilitySection';
import NewsSection from '@/components/landing/NewsSection';

export default function Home() {
  return (
    <main className="flex-1">
      <Hero />
      <WelcomeSection />
      <SpotlightBanner />
      <GuideCarousel />
      <ExploreSection />
      <AlertsSection />
      <AccessibilitySection />
      <NewsSection />
    </main>
  );
}
