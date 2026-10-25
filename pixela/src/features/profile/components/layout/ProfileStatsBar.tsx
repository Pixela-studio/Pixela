import { clsx } from "clsx";
import { IconType } from "react-icons";
import { TabType } from "@/features/profile/types/tabs";

interface ProfileStatsBarProps {
  stats: { label: string; value: string; icon: IconType }[];
  onTabChange: (tab: TabType) => void;
}

const STYLES = {
  statsContainer: "max-w-7xl mx-auto px-4 md:px-8 mt-20 mb-12",
  statsGrid: "grid grid-cols-2 md:flex md:justify-center md:flex-wrap lg:grid lg:grid-cols-3 gap-4",
  statCard: (clickable: boolean, isLastOdd: boolean) =>
    clsx(
      "bg-white/5 border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center transition-[background-color,border-color,transform] duration-300 group relative overflow-hidden",
      clickable
        ? "hover:bg-white/10 cursor-pointer hover:border-white/20 active:scale-95"
        : "cursor-default",
      isLastOdd ? "col-span-2 lg:col-span-1" : "col-span-1"
    ),
  statValue:
    "text-2xl md:text-3xl font-bold text-white mb-1 group-hover:scale-110 transition-transform relative z-10",
  statLabel:
    "text-xs text-gray-400 flex items-center gap-2 relative z-10",
  statIcon: "w-4 h-4 text-pixela-accent",
} as const;

export const ProfileStatsBar = ({
  stats,
  onTabChange,
}: ProfileStatsBarProps) => {
  // Map label to tab ID for click handling
  const getTabForStat = (label: string): TabType | null => {
    if (label === "Favoritos") return "favorites";
    if (label === "Reseñas") return "reviews";
    return null;
  };

  // Nombre accesible de las tarjetas que llevan a una pestaña: "Ver tus 12 favoritos".
  const getStatActionLabel = (label: string, value: string): string => {
    const noun = label.toLowerCase();
    if (value === "1") return `Ver tu ${noun.replace(/s$/, "")}`;
    return `Ver tus ${value} ${noun}`;
  };

  return (
    <div className={STYLES.statsContainer}>
      <div className={STYLES.statsGrid}>
        {stats.map((stat, idx) => {
          const targetTab = getTabForStat(stat.label);
          const isLastOdd = stats.length % 2 !== 0 && idx === stats.length - 1;
          
          const content = (
            <>
              <stat.icon aria-hidden="true" className={STYLES.statIcon} />
              <span className={STYLES.statValue}>{stat.value}</span>
              <span className={STYLES.statLabel}>{stat.label}</span>
            </>
          );

          // Las que llevan a una pestaña son botones reales (antes `div onClick`,
          // inalcanzables con teclado); "Nivel" es solo informativa.
          return targetTab ? (
            <button
              key={stat.label}
              type="button"
              className={STYLES.statCard(true, isLastOdd)}
              onClick={() => onTabChange(targetTab)}
              aria-label={getStatActionLabel(stat.label, stat.value)}
            >
              {content}
            </button>
          ) : (
            <div key={stat.label} className={STYLES.statCard(false, isLastOdd)}>
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
};
