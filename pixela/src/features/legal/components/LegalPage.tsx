import Link from 'next/link';
import type { ReactNode } from 'react';
import { LEGAL_UPDATED_AT } from '@/lib/site';

const STYLES = {
  page: 'bg-pixela-ink px-4 sm:px-6 md:px-10 lg:px-16 2k:px-24 pt-36 pb-24 md:pt-44 md:pb-32',
  inner: 'max-w-[68ch]',
  title: 'title-card text-[clamp(2.75rem,7vw,5.5rem)]',
  updated: 'meta-text mt-6',
  intro: 'mt-10 text-lg leading-relaxed text-white/85',
  nav: 'mt-10 flex flex-wrap gap-x-6 gap-y-2 meta-text',
  navLink: 'text-gray-400 underline-offset-4 hover:text-white hover:underline',
  navCurrent: 'text-white underline decoration-pixela-accent decoration-2 underline-offset-4',
  section: 'mt-14',
  sectionTitle: 'font-display text-[1.75rem] md:text-[2rem] leading-tight text-white',
  body: 'mt-4 space-y-4 text-base md:text-[17px] leading-relaxed text-gray-300 [&_a]:text-white [&_a]:underline [&_a]:underline-offset-4 [&_strong]:text-white [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5',
} as const;

const LEGAL_LINKS = [
  { href: '/aviso-legal', label: 'Aviso legal y condiciones' },
  { href: '/privacidad', label: 'Privacidad' },
  { href: '/cookies', label: 'Cookies' },
] as const;

const UPDATED_LABEL = new Intl.DateTimeFormat('es-ES', { dateStyle: 'long' }).format(
  new Date(`${LEGAL_UPDATED_AT}T12:00:00`),
);

interface LegalPageProps {
  title: string;
  /** Ruta de la página actual, para marcarla en la navegación entre textos legales. */
  current: (typeof LEGAL_LINKS)[number]['href'];
  intro: ReactNode;
  children: ReactNode;
}

/**
 * Marco común de las tres páginas legales: título en cartón, fecha de revisión,
 * enlaces entre ellas y un ancho de lectura de 68 caracteres.
 */
export function LegalPage({ title, current, intro, children }: LegalPageProps) {
  return (
    <article className={STYLES.page}>
      <div className={STYLES.inner}>
        <h1 className={STYLES.title}>{title}</h1>
        <p className={STYLES.updated}>
          Última revisión: <time dateTime={LEGAL_UPDATED_AT}>{UPDATED_LABEL}</time>
        </p>
        <nav aria-label="Textos legales" className={STYLES.nav}>
          {LEGAL_LINKS.map((link) =>
            link.href === current ? (
              <span key={link.href} aria-current="page" className={STYLES.navCurrent}>
                {link.label}
              </span>
            ) : (
              <Link key={link.href} href={link.href} prefetch={false} className={STYLES.navLink}>
                {link.label}
              </Link>
            ),
          )}
        </nav>
        <div className={STYLES.intro}>{intro}</div>
        {children}
      </div>
    </article>
  );
}

interface LegalSectionProps {
  id?: string;
  title: string;
  children: ReactNode;
}

export function LegalSection({ id, title, children }: LegalSectionProps) {
  return (
    <section id={id} className={STYLES.section} aria-labelledby={id ? `${id}-title` : undefined}>
      <h2 id={id ? `${id}-title` : undefined} className={STYLES.sectionTitle}>
        {title}
      </h2>
      <div className={STYLES.body}>{children}</div>
    </section>
  );
}
