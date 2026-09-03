import { create } from 'zustand';

export type HeroTab = 'ask' | 'departures' | 'arrivals' | 'parking';

interface HeroTabState {
  tab: HeroTab;
  setTab: (tab: HeroTab) => void;
}

// Shared so the homepage's "Your Guide" cards can jump the hero to a specific tab
// (e.g. Parking) without prop-drilling through the page tree.
export const useHeroTabStore = create<HeroTabState>((set) => ({
  tab: 'ask',
  setTab: (tab) => set({ tab }),
}));
