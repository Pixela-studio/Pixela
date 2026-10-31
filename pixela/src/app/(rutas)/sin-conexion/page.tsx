import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sin conexión · Pixela',
  robots: { index: false, follow: false },
};

/**
 * Lo que sirve el service worker (`public/sw.js`) cuando no hay red y la
 * página pedida no está guardada. Estática: se precarga al instalar.
 */
export default function SinConexionPage() {
  return (
    <main className="min-h-screen bg-pixela-ink px-4 sm:px-6 md:px-10 lg:px-16 2k:px-24 pt-36 pb-24">
      <h1 className="title-card text-[clamp(2.75rem,8vw,6rem)]">Sin conexión</h1>
      <p className="mt-6 max-w-[55ch] text-lg leading-relaxed text-white/85">
        No hay red ahora mismo. Lo que ya habías abierto con conexión sigue aquí: tu biblioteca, tu
        diario y los capítulos que llevas vistos se pueden consultar, aunque no cambiar hasta que
        vuelva la cobertura.
      </p>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/profile?tab=library" className="btn btn-primary">
          Mi biblioteca
        </Link>
        <Link href="/profile?tab=diary" className="btn btn-ghost">
          Mi diario
        </Link>
      </div>
    </main>
  );
}
