import nextDynamic from "next/dynamic";
import { Suspense } from "react";
import { getHeroData } from "@/features/hero/services/heroContentService";
import { HeroSection } from "@/features/hero/components/core/HeroSection";
import {
  getTrendingSeries,
  getTrendingMovies,
} from "@/features/trending/services/trendingService";
import {
  getDiscoveredSeries,
  getDiscoveredMovies,
} from "@/features/discover/service/discover";
import { getTheatricalMovies } from "@/features/theatrical/services/theatricalService";
import {
  getWeekendMovies,
  getWeekendSeries,
} from "@/features/weekend/services/weekendService";
import { getRandomQuote } from "@/features/quotes/service";
import { headings as discoverHeadings } from "@/features/discover/content/headings";
import { ConditionalSuspenseWrapper } from "@/app/components/ConditionalSuspenseWrapper";

// Dynamic imports for below-the-fold content to improve initial bundle size
const TrendingSection = nextDynamic(() =>
  import("@/features/trending/components/core/TrendingSection").then(
    (mod) => mod.TrendingSection,
  ),
);
const TheatricalSection = nextDynamic(() =>
  import("@/features/theatrical/components/TheatricalSection").then(
    (mod) => mod.TheatricalSection,
  ),
);
const WeekendSection = nextDynamic(() =>
  import("@/features/weekend/components/WeekendSection").then(
    (mod) => mod.WeekendSection,
  ),
);
const DiscoverSection = nextDynamic(() =>
  import("@/features/discover/components/layout/DiscoverSection").then(
    (mod) => mod.DiscoverSection,
  ),
);
const AboutSection = nextDynamic(
  () => import("@/features/about/components/AboutSection"),
);

/**
 * ISR en lugar de SSR puro.
 *
 * Antes había `dynamic = "force-dynamic"`: la portada se renderizaba de cero en
 * cada visita, así que ninguna respuesta se podía cachear en el edge y cada
 * carga arrastraba todas las llamadas a TMDB de esta página.
 *
 * El contenido son tendencias, cartelera y recomendaciones: cambia como mucho
 * una vez al día. Con `revalidate` la página se genera una vez, la CDN de Vercel
 * la sirve al resto de visitantes sin invocar la función, y se regenera en
 * segundo plano al expirar.
 *
 * Efecto colateral aceptado: la cita y el titular aleatorios de las secciones se
 * sortean al regenerar, no en cada visita, así que se mantienen durante la hora.
 */
export const revalidate = 3600;

// Constantes de configuración centralizadas
const CONFIG = {
  TRENDING_ITEMS_COUNT: 15,
  THEATRICAL_ITEMS_COUNT: 15,
  WEEKEND_ITEMS_COUNT: 15,
  STYLES: {
    main: "flex-grow 2k:max-w-[100vw] 2k:mx-auto",
    section: "scroll-mt-24 2k:scroll-mt-16",
  },
} as const;

/**
 * Carga y renderiza únicamente el Hero Section.
 * Al estar separado, permite que el skeleton principal desaparezca mucho antes.
 */
async function HeroLoader() {
  const heroData = await getHeroData();
  return <HeroSection {...heroData} />;
}

/**
 * Carga el resto del contenido de la página.
 * Se renderizará cuando sus datos estén listos, sin bloquear el Hero.
 */
async function RestOfPageLoader() {
  const [trendingData, theatricalMovies, weekendData, discoveredData] =
    await Promise.all([
      Promise.all([
        getTrendingSeries(CONFIG.TRENDING_ITEMS_COUNT),
        getTrendingMovies(CONFIG.TRENDING_ITEMS_COUNT),
      ]),
      getTheatricalMovies(CONFIG.THEATRICAL_ITEMS_COUNT),
      Promise.all([
        getWeekendSeries(CONFIG.WEEKEND_ITEMS_COUNT),
        getWeekendMovies(CONFIG.WEEKEND_ITEMS_COUNT),
      ]),
      Promise.all([getDiscoveredSeries(), getDiscoveredMovies()]),
    ]);

  const [trendingSeries, trendingMovies] = trendingData;
  const [weekendSeries, weekendMovies] = weekendData;
  const [discoveredSeries, discoveredMovies] = discoveredData;

  // Generamos citas y heading aleatorios en el servidor para evitar flash de hidratación
  const trendingQuote = getRandomQuote();
  const theatricalQuote = getRandomQuote();
  const weekendQuote = getRandomQuote();
  const discoverHeading =
    discoverHeadings[Math.floor(Math.random() * discoverHeadings.length)];

  return (
    <>
      <div id="trending" className={CONFIG.STYLES.section}>
        <TrendingSection
          series={trendingSeries}
          movies={trendingMovies}
          quote={trendingQuote}
        />
      </div>

      <div id="cartelera" className={CONFIG.STYLES.section}>
        <TheatricalSection movies={theatricalMovies} quote={theatricalQuote} />
      </div>

      <div id="finde" className={CONFIG.STYLES.section}>
        <WeekendSection
          movies={weekendMovies}
          series={weekendSeries}
          quote={weekendQuote}
        />
      </div>

      <div id="discover" className={CONFIG.STYLES.section}>
        <DiscoverSection
          series={discoveredSeries}
          movies={discoveredMovies}
          heading={discoverHeading}
        />
      </div>

      <div id="about" className={CONFIG.STYLES.section}>
        <AboutSection />
      </div>
    </>
  );
}

/**
 * Página principal con carga progresiva simplificada.
 * El Hero carga primero, y el resto de la página aparece después sin skeletons intermedios.
 */
export default function Home() {
  return (
    <main className={CONFIG.STYLES.main}>
      {/* El skeleton principal solo espera a que HeroLoader termine */}
      <ConditionalSuspenseWrapper>
        <HeroLoader />
      </ConditionalSuspenseWrapper>

      {/* El resto del contenido carga en segundo plano y aparece cuando está listo */}
      <Suspense fallback={null}>
        <RestOfPageLoader />
      </Suspense>
    </main>
  );
}
