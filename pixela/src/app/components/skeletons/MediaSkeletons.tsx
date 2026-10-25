/**
 * Componentes de skeleton para elementos multimedia
 * Mantiene la estética y colores de Pixela durante las cargas
 * 
 * Solo incluye los skeletons que realmente se usan en la aplicación
 */
const STYLES = {
  // Media page skeleton
  mediaPage: 'min-h-screen bg-gradient-to-b from-pixela-dark to-black pt-20',
  mediaContainer: 'container mx-auto px-4 py-8',
  
  // Hero section skeleton
  mediaHero: 'relative w-full h-[60vh] rounded-2xl overflow-hidden mb-8',
  mediaHeroGradient: 'absolute inset-0 bg-white/[0.06] animate-shimmer',
  mediaHeroOverlay: 'absolute inset-0 bg-gradient-to-t from-pixela-dark via-transparent to-transparent',
  mediaHeroContent: 'absolute bottom-8 left-8 right-8 space-y-4',
  mediaTitle: 'h-12 w-2/3 bg-white/[0.06] rounded-lg animate-pulse',
  mediaInfo: 'flex gap-4',
  mediaRating: 'h-6 w-16 bg-white/[0.06] rounded animate-pulse',
  mediaYear: 'h-6 w-12 bg-pixela-light/20 rounded animate-pulse',
  mediaGenre: 'h-6 w-24 bg-white/[0.06] rounded animate-pulse',
  
  // Content sections
  contentSection: 'mb-12 space-y-6',
  sectionTitle: 'h-12 w-56 bg-white/[0.06] rounded-sm animate-pulse md:h-14',
  descriptionLines: 'space-y-3',
  descriptionLine: 'h-4 bg-pixela-light/15 rounded animate-pulse',
  
  // Cast section
  castGrid: 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4',
  castCard: 'space-y-2',
  castAvatar: 'aspect-[4/5] w-full rounded-sm bg-white/[0.06] animate-pulse',
  castName: 'h-3 bg-pixela-light/15 rounded animate-pulse',
  castRole: 'h-2 bg-pixela-light/10 rounded animate-pulse',
  
  // Gallery section
  gallery: 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4',
  galleryItem: 'aspect-video bg-white/[0.06] rounded-lg animate-pulse relative overflow-hidden',
  galleryShimmer: 'absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse',
  
  // Reviews section
  reviewsGrid: 'space-y-4',
  reviewCard: 'bg-pixela-dark/50 border border-white/10 rounded-xl p-6 space-y-4 animate-pulse',
  reviewHeader: 'flex items-center gap-4',
  reviewAvatar: 'w-12 h-12 rounded-full bg-white/[0.06] animate-pulse',
  reviewUser: 'space-y-2 flex-1',
  reviewUserName: 'h-4 w-32 bg-pixela-light/15 rounded animate-pulse',
  reviewDate: 'h-3 w-20 bg-pixela-light/10 rounded animate-pulse',
  reviewContent: 'space-y-3',
  reviewText: 'h-4 bg-pixela-light/10 rounded animate-pulse'
} as const;

/**
 * Skeleton completo para página de media
 */
export const MediaPageSkeleton = () => (
  <div className="min-h-screen bg-pixela-ink">
    {/* Cabecera: mismo layout que `HeroSection` (un solo árbol, margen de
        página único) para que el contenido no salte al llegar. */}
    <header className="relative flex min-h-[88vh] w-full items-end">
      <div className="absolute inset-0 bg-white/[0.04] animate-shimmer">
        <div className="absolute inset-0 bg-gradient-to-t from-pixela-ink via-pixela-ink/60 to-transparent" />
      </div>

      <div className="relative w-full px-4 sm:px-6 md:px-10 lg:px-16 2k:px-24 pt-[34vh] pb-14 lg:pb-20">
        <div className="flex flex-col items-start gap-8 lg:flex-row lg:items-end lg:gap-14">
          <div className="aspect-[2/3] w-32 flex-shrink-0 rounded-sm bg-white/[0.06] animate-pulse sm:w-44 lg:w-64 xl:w-72" />

          <div className="flex w-full min-w-0 flex-col items-start gap-5">
            <div className="h-14 w-full max-w-xl rounded-sm bg-white/[0.06] animate-pulse lg:h-20" />
            <div className="flex gap-4">
              <div className="h-5 w-12 rounded-sm bg-pixela-light/15 animate-pulse" />
              <div className="h-5 w-16 rounded-sm bg-pixela-light/15 animate-pulse" />
              <div className="h-5 w-20 rounded-sm bg-pixela-light/15 animate-pulse" />
            </div>
            <div className="h-5 w-48 rounded-sm bg-white/[0.06] animate-pulse" />
            <div className="w-full max-w-2xl space-y-3">
              <div className="h-5 rounded-sm bg-pixela-light/10 animate-pulse" />
              <div className="h-5 w-11/12 rounded-sm bg-pixela-light/10 animate-pulse" />
              <div className="h-5 w-4/5 rounded-sm bg-pixela-light/10 animate-pulse" />
            </div>
            <div className="flex gap-3">
              <div className="h-12 w-52 rounded-sm bg-white/[0.08] animate-pulse" />
              <div className="h-12 w-12 rounded-sm bg-white/[0.06] animate-pulse sm:w-32" />
              <div className="h-12 w-12 rounded-sm bg-white/[0.06] animate-pulse sm:w-32" />
            </div>
          </div>
        </div>
      </div>
    </header>

    {/* Bloques: mismo contenedor y ritmo que `MediaPage`. */}
    <div className="relative z-10 pb-40">
      <div className="w-full px-4 sm:px-6 md:px-10 lg:px-16 2k:px-24 flex flex-col gap-16 md:gap-24">
        {/* Dónde verla */}
        <div className="space-y-6">
          <div className={STYLES.sectionTitle} />
          <div className="flex gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 w-12 rounded-sm bg-pixela-light/10 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
        </div>

        {/* Reparto */}
        <div className="space-y-6">
          <div className={STYLES.sectionTitle} style={{ animationDelay: '0.2s' }} />
          <div className={STYLES.castGrid}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className={STYLES.castCard}>
                <div className={STYLES.castAvatar} style={{ animationDelay: `${i * 0.1}s` }} />
                <div className={STYLES.castName} style={{ animationDelay: `${i * 0.1 + 0.05}s` }} />
                <div className={STYLES.castRole} style={{ animationDelay: `${i * 0.1 + 0.1}s` }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

/**
 * Skeleton para la sección de galería
 */
export const GallerySkeleton = ({ count = 8 }: { count?: number }) => (
  <div className={STYLES.contentSection}>
    <div className={STYLES.sectionTitle} />
    <div className={STYLES.gallery}>
      {[...Array(count)].map((_, i) => (
        <div 
          key={i} 
          className={STYLES.galleryItem}
          style={{ animationDelay: `${i * 0.1}s` }}
        >
          <div className={STYLES.galleryShimmer} />
        </div>
      ))}
    </div>
  </div>
);

/**
 * Skeleton para la sección de reseñas
 */
export const ReviewsSkeleton = ({ count = 3 }: { count?: number }) => (
  <div className={STYLES.contentSection}>
    <div className={STYLES.sectionTitle} />
    <div className={STYLES.reviewsGrid}>
      {[...Array(count)].map((_, i) => (
        <div 
          key={i} 
          className={STYLES.reviewCard}
          style={{ animationDelay: `${i * 0.1}s` }}
        >
          <div className={STYLES.reviewHeader}>
            <div className={STYLES.reviewAvatar} />
            <div className={STYLES.reviewUser}>
              <div className={STYLES.reviewUserName} />
              <div className={STYLES.reviewDate} />
            </div>
          </div>
          <div className={STYLES.reviewContent}>
            <div className={STYLES.reviewText} />
            <div className={`${STYLES.reviewText} w-4/5`} />
            <div className={`${STYLES.reviewText} w-3/5`} />
          </div>
        </div>
      ))}
    </div>
  </div>
);

/**
 * Skeleton para el cast
 */
export const CastSkeleton = ({ count = 6 }: { count?: number }) => (
  <div className={STYLES.contentSection}>
    <div className={STYLES.sectionTitle} />
    <div className={STYLES.castGrid}>
      {[...Array(count)].map((_, i) => (
        <div key={i} className={STYLES.castCard}>
          <div 
            className={STYLES.castAvatar} 
            style={{ animationDelay: `${i * 0.1}s` }}
          />
          <div 
            className={STYLES.castName} 
            style={{ animationDelay: `${i * 0.1 + 0.05}s` }}
          />
          <div 
            className={STYLES.castRole} 
            style={{ animationDelay: `${i * 0.1 + 0.1}s` }}
          />
        </div>
      ))}
    </div>
  </div>
); 