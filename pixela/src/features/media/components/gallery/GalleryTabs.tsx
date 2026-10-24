"use client";

import { GalleryTabsProps } from '@/features/media/types/gallery';

const STYLES = {
  container: "flex border-b border-white/10 mb-6",
  tab: "py-3 px-6 text-sm font-medium rounded-t-lg focus:outline-none transition-colors duration-200",
  activeTab: "bg-pixela-accent text-gray-900 border-b-2 border-pixela-accent",
  inactiveTab: "text-gray-400 hover:text-white hover:bg-pixela-raised/50"
} as const;

export const GalleryTabs = ({ activeTab, onTabChange, backdropsCount, postersCount }: GalleryTabsProps) => {
  return (
    <div className={STYLES.container}>
      <button
        className={`${STYLES.tab} ${activeTab === 'backdrops' ? STYLES.activeTab : STYLES.inactiveTab}`}
        onClick={() => onTabChange('backdrops')}
      >
        Fondos ({backdropsCount})
      </button>
      <button
        className={`${STYLES.tab} ${activeTab === 'posters' ? STYLES.activeTab : STYLES.inactiveTab}`}
        onClick={() => onTabChange('posters')}
      >
        Pósters ({postersCount})
      </button>
    </div>
  );
}; 