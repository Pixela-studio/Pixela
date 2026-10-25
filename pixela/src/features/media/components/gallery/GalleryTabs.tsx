"use client";

import { GalleryTabsProps } from '@/features/media/types/gallery';

const STYLES = {
  // Pestañas con la gramática de la navbar: texto Meta y subrayado rosa de 2 px.
  container: "flex gap-8 border-b border-white/10 mb-6",
  tab: "meta-text -mb-px border-b-2 py-3 transition-colors duration-200",
  activeTab: "border-pixela-accent text-white",
  inactiveTab: "border-transparent hover:text-white"
} as const;

export const GalleryTabs = ({ activeTab, onTabChange, backdropsCount, postersCount }: GalleryTabsProps) => {
  return (
    <div className={STYLES.container}>
      <button
        type="button"
        className={`${STYLES.tab} ${activeTab === 'backdrops' ? STYLES.activeTab : STYLES.inactiveTab}`}
        onClick={() => onTabChange('backdrops')}
        aria-pressed={activeTab === 'backdrops'}
      >
        Fondos ({backdropsCount})
      </button>
      <button
        type="button"
        className={`${STYLES.tab} ${activeTab === 'posters' ? STYLES.activeTab : STYLES.inactiveTab}`}
        onClick={() => onTabChange('posters')}
        aria-pressed={activeTab === 'posters'}
      >
        Pósters ({postersCount})
      </button>
    </div>
  );
}; 