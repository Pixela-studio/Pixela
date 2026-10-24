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
  mediaHeroGradient: 'absolute inset-0 bg-gradient-to-br from-pixela-accent/10 via-pixela-dark/40 to-pink-400/10 animate-shimmer',
  mediaHeroOverlay: 'absolute inset-0 bg-gradient-to-t from-pixela-dark via-transparent to-transparent',
  mediaHeroContent: 'absolute bottom-8 left-8 right-8 space-y-4',
  mediaTitle: 'h-12 w-2/3 bg-gradient-to-r from-pixela-accent/20 to-pink-400/20 rounded-lg [animation:pulse_3s_ease-in-out_infinite]',
  mediaInfo: 'flex gap-4',
  mediaRating: 'h-6 w-16 bg-pixela-accent/30 rounded [animation:pulse_3s_ease-in-out_infinite]',
  mediaYear: 'h-6 w-12 bg-pixela-light/20 rounded [animation:pulse_3s_ease-in-out_infinite]',
  mediaGenre: 'h-6 w-24 bg-pink-400/20 rounded [animation:pulse_3s_ease-in-out_infinite]',
  
  // Content sections
  contentSection: 'mb-12 space-y-6',
  sectionTitle: 'h-8 w-48 bg-gradient-to-r from-pixela-accent/15 to-pink-400/15 rounded-lg [animation:pulse_3s_ease-in-out_infinite]',
  descriptionLines: 'space-y-3',
  descriptionLine: 'h-4 bg-pixela-light/15 rounded [animation:pulse_3s_ease-in-out_infinite]',
  
  // Cast section
  castGrid: 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4',
  castCard: 'text-center space-y-2',
  castAvatar: 'w-20 h-20 rounded-full bg-gradient-to-br from-pixela-accent/20 to-pink-400/20 [animation:pulse_3s_ease-in-out_infinite] mx-auto',
  castName: 'h-3 bg-pixela-light/15 rounded [animation:pulse_3s_ease-in-out_infinite]',
  castRole: 'h-2 bg-pixela-light/10 rounded [animation:pulse_3s_ease-in-out_infinite]',
  
  // Gallery section
  gallery: 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4',
  galleryItem: 'aspect-video bg-gradient-to-br from-pixela-accent/10 to-pink-400/10 rounded-lg [animation:pulse_3s_ease-in-out_infinite] relative overflow-hidden',
  galleryShimmer: 'absolute inset-0 bg-gradient-to-r from-transparent via-pixela-accent/15 to-transparent [animation:pulse_3s_ease-in-out_infinite]',
  
  // Reviews section
  reviewsGrid: 'space-y-4',
  reviewCard: 'bg-pixela-dark/50 border border-pixela-accent/10 rounded-xl p-6 space-y-4 [animation:pulse_3s_ease-in-out_infinite]',
  reviewHeader: 'flex items-center gap-4',
  reviewAvatar: 'w-12 h-12 rounded-full bg-gradient-to-br from-pixela-accent/20 to-pink-400/20 [animation:pulse_3s_ease-in-out_infinite]',
  reviewUser: 'space-y-2 flex-1',
  reviewUserName: 'h-4 w-32 bg-pixela-light/15 rounded [animation:pulse_3s_ease-in-out_infinite]',
  reviewDate: 'h-3 w-20 bg-pixela-light/10 rounded [animation:pulse_3s_ease-in-out_infinite]',
  reviewContent: 'space-y-3',
  reviewText: 'h-4 bg-pixela-light/10 rounded [animation:pulse_3s_ease-in-out_infinite]'
} as const;

/**
 * Skeleton completo para página de media
 */
export const MediaPageSkeleton = () => (
  <div className="min-h-screen bg-pixela-ink">
    {/* Hero Section Skeleton */}
    <div className="relative min-h-[80vh] w-full">
      {/* Backdrop skeleton */}
      <div className="absolute inset-0 bg-gradient-to-br from-pixela-accent/10 via-pixela-dark/40 to-pink-400/10 animate-shimmer">
        <div className="absolute inset-0 bg-gradient-to-t from-pixela-ink via-transparent to-transparent"></div>
      </div>
      
      {/* Content skeleton */}
      <div className="container relative px-4 mx-auto">
        
        {/* Mobile Layout Skeleton */}
        <div className="pb-8 lg:hidden pt-36 md:pt-44">
          <div className="flex flex-col items-center gap-6">
            {/* Poster skeleton */}
            <div className="w-48 aspect-[2/3] bg-gradient-to-br from-pixela-accent/20 to-pink-400/20 rounded-xl animate-pulse"></div>
            
            {/* Content skeleton */}
            <div className="w-full space-y-4 text-center">
              {/* Title */}
              <div className="h-8 max-w-md mx-auto rounded bg-gradient-to-r from-pixela-accent/20 to-pink-400/20 animate-pulse"></div>
              
              {/* Genres */}
              <div className="flex justify-center gap-2">
                <div className="w-16 h-6 rounded bg-pixela-accent/15 animate-pulse"></div>
                <div className="w-20 h-6 rounded bg-pixela-accent/15 animate-pulse"></div>
                <div className="h-6 rounded w-18 bg-pixela-accent/15 animate-pulse"></div>
              </div>
              
              {/* Metadata */}
              <div className="flex justify-center gap-4">
                <div className="w-12 h-5 rounded bg-pixela-light/15 animate-pulse"></div>
                <div className="w-16 h-5 rounded bg-pixela-light/15 animate-pulse"></div>
                <div className="w-20 h-5 rounded bg-pixela-light/15 animate-pulse"></div>
              </div>
              
              {/* Synopsis */}
              <div className="max-w-sm mx-auto mt-4 mb-6 space-y-2">
                <div className="h-4 rounded bg-pixela-light/10 animate-pulse"></div>
                <div className="w-5/6 h-4 mx-auto rounded bg-pixela-light/10 animate-pulse"></div>
                <div className="w-4/5 h-4 mx-auto rounded bg-pixela-light/10 animate-pulse"></div>
              </div>
              
              {/* Action buttons */}
              <div className="flex justify-center gap-3">
                <div className="w-32 h-12 rounded-lg bg-pixela-accent/20 animate-pulse"></div>
                <div className="w-12 h-12 rounded-lg bg-pink-400/20 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Desktop Layout Skeleton */}
        <div className="hidden lg:flex h-[80vh] items-end pb-20">
          <div className="flex flex-row gap-8">
            {/* Poster skeleton */}
            <div className="w-72 aspect-[2/3] bg-gradient-to-br from-pixela-accent/20 to-pink-400/20 rounded-xl animate-pulse flex-shrink-0"></div>
            
            {/* Content skeleton */}
            <div className="flex-grow space-y-6">
              {/* Title */}
              <div className="h-12 max-w-2xl rounded bg-gradient-to-r from-pixela-accent/20 to-pink-400/20 animate-pulse"></div>
              
              {/* Genres */}
              <div className="flex gap-3">
                <div className="w-20 h-8 rounded bg-pixela-accent/15 animate-pulse"></div>
                <div className="w-24 h-8 rounded bg-pixela-accent/15 animate-pulse"></div>
                <div className="h-8 rounded w-22 bg-pixela-accent/15 animate-pulse"></div>
              </div>
              
              {/* Metadata */}
              <div className="flex gap-6">
                <div className="w-16 h-6 rounded bg-pixela-light/15 animate-pulse"></div>
                <div className="w-20 h-6 rounded bg-pixela-light/15 animate-pulse"></div>
                <div className="w-24 h-6 rounded bg-pixela-light/15 animate-pulse"></div>
              </div>
              
              {/* Synopsis */}
              <div className="max-w-3xl mb-8 space-y-3">
                <div className="h-5 rounded bg-pixela-light/10 animate-pulse"></div>
                <div className="w-11/12 h-5 rounded bg-pixela-light/10 animate-pulse"></div>
                <div className="w-4/5 h-5 rounded bg-pixela-light/10 animate-pulse"></div>
                <div className="w-2/3 h-5 rounded bg-pixela-light/10 animate-pulse"></div>
              </div>
              
              {/* Action buttons */}
              <div className="flex gap-4">
                <div className="rounded-lg h-14 w-36 bg-pixela-accent/20 animate-pulse"></div>
                <div className="rounded-lg h-14 w-14 bg-pink-400/20 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Content Sections Skeleton */}
    <div className="relative z-10 pb-40 -mt-20">
      <div className="container px-4 pt-8 mx-auto space-y-12 md:pt-0">
        
        {/* Streaming Providers */}
        <div className="space-y-4">
          <div className={STYLES.sectionTitle} />
          <div className="flex gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-12 h-12 rounded-lg bg-pixela-light/10 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }}></div>
            ))}
          </div>
        </div>

        {/* Cast Section */}
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

        {/* Trailers Section */}
        <div className="space-y-6">
          <div className={STYLES.sectionTitle} style={{ animationDelay: '0.4s' }} />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {[...Array(2)].map((_, i) => (
              <div 
                key={i} 
                className="relative overflow-hidden aspect-video bg-gradient-to-br from-pixela-accent/10 to-pink-400/10 rounded-xl animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-pixela-accent/15 to-transparent animate-pulse"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-pixela-accent/30 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gallery Section */}
        <div className="space-y-6">
          <div className={STYLES.sectionTitle} style={{ animationDelay: '0.6s' }} />
          <GallerySkeleton />
        </div>

        {/* Reviews Section */}
        <div className="space-y-6">
          <div className={STYLES.sectionTitle} style={{ animationDelay: '0.8s' }} />
          <ReviewsSkeleton />
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