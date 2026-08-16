'use client';

/**
 * Skeleton del hero que replica la estructura exacta del HeroSection real
 * Mantiene la misma disposición: ImageCarousel, NavigationControls, ProgressIndicator y ContentSection
 */
export const HeroSectionSkeleton = () => {
  return (
    <div className="relative w-full min-h-[80vh] sm:min-h-[85vh] md:min-h-screen lg:h-screen 2k:h-[70vh] overflow-hidden px-4 sm:px-6 md:px-8 lg:px-0 2k:px-0 sm:[min-height:1180px]:min-h-screen sm:[min-width:820px]:min-h-screen">
      
      {/* ImageCarousel Skeleton - Fondo MUITO SUTIL para no tapar el mensaje */}
      <div className="absolute inset-0 w-full h-full opacity-20">
        <div className="relative w-full h-full bg-gradient-to-br from-pixela-accent/5 via-pixela-dark/20 to-pink-400/5 animate-shimmer">
          {/* Efecto shimmer muy sutil */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-pixela-accent/5 to-transparent animate-shimmer"></div>
          
          {/* Efectos de fondo muy sutiles */}
          <div className="absolute w-64 h-64 rounded-full top-1/4 left-1/4 bg-pixela-accent/3 blur-3xl animate-pulse"></div>
          <div className="absolute rounded-full bottom-1/4 right-1/3 w-96 h-96 bg-pink-500/3 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
      </div>

      {/* NavigationControls Skeleton - Botones de navegación laterales MÁS SUTILES */}
      <div className="absolute inset-y-0 z-10 flex items-center left-4 sm:left-6 md:left-8 lg:left-16 2k:left-24 opacity-30">
        <div className="flex items-center justify-center w-12 h-12 border rounded-full bg-pixela-dark/10 backdrop-blur-sm border-white/5 animate-pulse">
          <div className="w-4 h-4 rounded bg-pixela-light/10 animate-pulse"></div>
        </div>
      </div>
      
      <div className="absolute inset-y-0 z-10 flex items-center right-4 sm:right-6 md:right-8 lg:right-16 2k:right-24 opacity-30">
        <div className="flex items-center justify-center w-12 h-12 border rounded-full bg-pixela-dark/10 backdrop-blur-sm border-white/5 animate-pulse">
          <div className="w-4 h-4 rounded bg-pixela-light/10 animate-pulse"></div>
        </div>
      </div>

      {/* ProgressIndicator Skeleton - Indicadores de progreso MÁS SUTILES */}
      <div className="absolute z-10 hidden transform -translate-x-1/2 bottom-4 sm:bottom-6 md:bottom-8 lg:bottom-12 2k:bottom-8 left-1/2 lg:flex opacity-30">
        <div className="flex gap-2">
          {[...Array(4)].map((_, i) => (
            <div 
              key={i} 
              className="w-12 h-1 rounded-full bg-pixela-light/10 animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            >
              <div className="w-3 h-1 rounded-full bg-pixela-accent/20 animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Mensaje de bienvenida centrado - SIN FONDO RECTANGULAR */}
      <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div className="px-4 space-y-6 text-center">
          <div>
            <h1 className="text-5xl font-black tracking-tight sm:text-6xl md:text-7xl lg:text-8xl text-pixela-accent font-outfit ">
              CARGANDO EXPERIENCIA CINEMATOGRÁFICA
            </h1>
          </div>
          
          {/* Indicador de carga animado */}
          <div className="flex justify-center mt-8">
            <div className="flex space-x-3">
              {[...Array(3)].map((_, i) => (
                <div 
                  key={i} 
                  className="w-4 h-4 rounded-full shadow-lg bg-pixela-accent animate-bounce"
                  style={{ animationDelay: `${i * 0.3}s` }}
                ></div>
              ))}
            </div>
          </div>
        </div>  
      </div>

      {/* ContentSection Skeleton - MAS SUTIL para no competir con el mensaje */}
      <div className="absolute inset-x-0 bottom-0 px-4 z-5 sm:px-5 md:px-6 lg:px-0 2k:px-8 opacity-20">
        <div className="w-full max-w-[95%] sm:max-w-xl md:max-w-2xl lg:max-w-[83.333%] 2k:max-w-[60%] mx-auto pb-20 sm:pb-24 md:pb-28 lg:pb-36 2k:pb-24">
          
          {/* AccentLine Skeleton - Línea decorativa */}
          <div className="w-16 h-1 mb-4 md:w-24 lg:w-24 bg-pixela-accent/40 md:mb-6 lg:mb-8 animate-pulse"></div>
          
          {/* HeroTitle Skeleton - Título principal con texto acentuado */}
          <div className="mb-4 space-y-2 md:mb-5 lg:mb-6 2k:mb-4">
            <div className="w-full h-12 max-w-2xl rounded sm:h-16 md:h-20 lg:h-24 2k:h-28 bg-gradient-to-r from-pixela-light/20 to-pixela-light/10 animate-pulse"></div>
            <div className="w-3/4 h-12 max-w-xl rounded sm:h-16 md:h-20 lg:h-24 2k:h-28 bg-gradient-to-r from-pixela-accent/30 to-pixela-accent/20 animate-pulse"></div>
          </div>
          
          {/* Description Skeleton - Párrafo descriptivo */}
          <div className="max-w-md mb-6 space-y-3 md:mb-8 lg:mb-12 2k:mb-8 sm:max-w-lg md:max-w-xl lg:max-w-lg 2k:max-w-2xl">
            <div className="h-5 rounded sm:h-6 md:h-6 lg:h-7 2k:h-8 bg-pixela-light/15 animate-pulse"></div>
            <div className="w-5/6 h-5 rounded sm:h-6 md:h-6 lg:h-7 2k:h-8 bg-pixela-light/15 animate-pulse" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-4/5 h-5 rounded sm:h-6 md:h-6 lg:h-7 2k:h-8 bg-pixela-light/15 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          </div>
          
          {/* Buttons Container Skeleton */}
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6 lg:gap-8 2k:gap-6 ipad:flex-col ipad:items-start ipad:gap-6">
            
            {/* SecondaryButton Skeleton */}
            <div className="ipad:w-full">
              <div className="flex items-center gap-2">
                <div className="w-32 h-5 rounded sm:h-5 lg:h-6 bg-pixela-light/20 animate-pulse"></div>
                <div className="w-5 h-5 rounded sm:w-5 sm:h-5 lg:w-6 lg:h-6 bg-pixela-light/20 animate-pulse"></div>
              </div>
            </div>
            
            {/* ProgressIndicator mobile/ipad skeleton */}
            <div className="hidden ipad:block ipad:w-full">
              <div className="flex gap-2">
                {[...Array(4)].map((_, i) => (
                  <div 
                    key={i} 
                    className="w-12 h-1 rounded-full bg-pixela-light/15 animate-pulse"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay con patrón de ruido sutil */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none noise-effect"></div>
    </div>
  );
};
