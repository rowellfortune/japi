'use client';

import { AccessibilityIcon } from '../icons';
import { askChat } from '@/lib/chatBus';

export default function AccessibilitySection() {
  return (
    <section id="accessibility" className="max-w-7xl mx-auto px-4 sm:px-6 pb-14 scroll-mt-16">
      <div className="rounded-xl bg-cta/5 border border-cta/20 p-6 sm:p-8 flex flex-col sm:flex-row items-start gap-6">
        <div className="w-12 h-12 rounded-full bg-cta/10 flex items-center justify-center shrink-0">
          <AccessibilityIcon className="w-6 h-6 text-cta" />
        </div>
        <div>
          <h2 className="font-heading font-bold text-navy text-lg mb-2">Accessibility assistance at PBM</h2>
          <p className="text-sm text-slate-muted leading-relaxed max-w-2xl">
            We offer accessibility features and services to help make every part of your trip through
            our terminal comfortable — mobility support, and help navigating between gates, security, or
            customs. For additional assistance, contact your airline in advance of your trip.
          </p>
          <button
            onClick={() => askChat('What accessibility services are available?')}
            className="cursor-pointer mt-4 px-4 py-2 rounded-md bg-cta text-white text-sm font-semibold hover:bg-navy transition-colors"
          >
            Ask about accessibility
          </button>
        </div>
      </div>
    </section>
  );
}
