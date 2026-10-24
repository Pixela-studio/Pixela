import Image from 'next/image';
import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';

interface LoginLayoutProps {
  children: React.ReactNode;
}

const STYLES = {
  page: 'relative min-h-[100svh] flex flex-col items-center justify-center overflow-hidden bg-pixela-ink px-4 py-20',
  vignette:
    'pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(236,27,105,0.08),transparent_55%)]',
  back:
    'absolute left-4 top-6 sm:left-8 sm:top-8 z-10 inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-white/70 transition-colors duration-200 hover:text-white',
  card:
    'relative z-10 w-full max-w-[960px] grid sm:grid-cols-2 items-center gap-10 sm:gap-0 rounded-3xl sm:border sm:border-white/10 sm:bg-pixela-dark sm:shadow-2xl sm:shadow-black/60 sm:min-h-[520px] overflow-hidden',
  logoPane:
    'flex justify-center sm:order-last sm:h-full sm:items-center sm:border-l sm:border-white/10 sm:bg-pixela-ink/60',
  logoLink: 'group rounded-2xl p-2',
  logo: 'w-28 sm:w-44 h-auto transition-transform duration-500 ease-out-expo group-hover:scale-105',
  formPane: 'flex items-center justify-center sm:px-6 sm:py-12',
} as const;

export const LoginLayout = ({ children }: LoginLayoutProps) => {
  return (
    <div className={STYLES.page}>
      <div className="noise-effect" aria-hidden="true" />
      <div className={STYLES.vignette} aria-hidden="true" />

      {/* Las páginas de auth no tienen navbar: sin este enlace no había salida. */}
      <Link href="/" className={STYLES.back}>
        <FiArrowLeft className="h-4 w-4" aria-hidden="true" />
        Volver al inicio
      </Link>

      <div className={STYLES.card}>
        <div className={STYLES.logoPane}>
          <Link href="/" className={STYLES.logoLink} aria-label="Pixela, ir al inicio">
            {/* `unoptimized`: el optimizador de next/image rechaza SVG y el
                logo se veía como imagen rota. Un SVG no necesita optimizarse. */}
            <Image
              src="/img/Logo-login.svg"
              alt=""
              width={190}
              height={164}
              className={STYLES.logo}
              unoptimized
              priority
            />
          </Link>
        </div>
        <div className={STYLES.formPane}>{children}</div>
      </div>
    </div>
  );
};
