import type { Metadata } from 'next';
import { LegalPage, LegalSection } from '@/features/legal/components/LegalPage';

export const metadata: Metadata = {
  title: 'Política de cookies · Pixela',
  description: 'Las cookies que usa Pixela: solo técnicas, sin analítica ni publicidad.',
};

const STYLES = {
  tableWrap: 'mt-2 overflow-x-auto rounded-sm border border-white/10',
  table: 'w-full min-w-[34rem] text-left text-[15px]',
  th: 'bg-pixela-surface px-4 py-3 font-semibold text-white',
  td: 'border-t border-white/10 px-4 py-3 align-top',
  code: 'text-white',
} as const;

/*
 * Inventario sacado del código, no de una plantilla. Si se añade una cookie o
 * una clave de almacenamiento, va aquí también:
 *
 * - Auth.js: sesión, CSRF y URL de vuelta (`auth.ts`). En producción llevan el
 *   prefijo `__Secure-` / `__Host-`.
 * - `pixela.has-session`: pista sin datos que mantiene `proxy.ts`.
 * - `pixela_visited`: `sessionStorage` de `ConditionalSuspenseWrapper`.
 */
const ITEMS = [
  {
    name: 'authjs.session-token',
    purpose: 'Mantiene tu sesión iniciada. Va cifrada y la página no puede leerla.',
    duration: '30 días',
    owner: 'Pixela',
  },
  {
    name: 'authjs.csrf-token',
    purpose: 'Protege el inicio de sesión frente a peticiones falsificadas desde otras webs.',
    duration: 'Sesión del navegador',
    owner: 'Pixela',
  },
  {
    name: 'authjs.callback-url',
    purpose: 'Recuerda a qué página volver después de iniciar sesión.',
    duration: 'Sesión del navegador',
    owner: 'Pixela',
  },
  {
    name: 'pixela.has-session',
    purpose:
      'Dice si hay una sesión abierta, sin ningún dato. Sirve para no preguntar al servidor si no hace falta.',
    duration: 'Sesión del navegador',
    owner: 'Pixela',
  },
  {
    name: 'pixela_visited (almacenamiento de sesión)',
    purpose: 'Evita repetir la pantalla de carga inicial en la misma pestaña.',
    duration: 'Hasta cerrar la pestaña',
    owner: 'Pixela',
  },
] as const;

export default function CookiesPage() {
  return (
    <LegalPage
      title="Política de cookies"
      current="/cookies"
      intro={
        <p>
          Pixela solo usa cookies técnicas, las imprescindibles para que funcione. No hay analítica,
          publicidad ni seguimiento, y por eso no te pedimos consentimiento con un banner (artículo
          22.2 de la LSSI).
        </p>
      }
    >
      <LegalSection id="lista" title="Qué guarda tu navegador">
        <div className={STYLES.tableWrap}>
          <table className={STYLES.table}>
            <thead>
              <tr>
                <th scope="col" className={STYLES.th}>Nombre</th>
                <th scope="col" className={STYLES.th}>Para qué</th>
                <th scope="col" className={STYLES.th}>Duración</th>
              </tr>
            </thead>
            <tbody>
              {ITEMS.map((item) => (
                <tr key={item.name}>
                  <td className={STYLES.td}>
                    <code className={STYLES.code}>{item.name}</code>
                  </td>
                  <td className={STYLES.td}>{item.purpose}</td>
                  <td className={STYLES.td}>{item.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Las tres de Auth.js solo aparecen cuando inicias sesión o te registras. Si navegas sin
          cuenta, Pixela no te deja ninguna cookie.
        </p>
      </LegalSection>

      <LegalSection id="youtube" title="Tráileres de YouTube">
        <p>
          Los tráileres se muestran como una imagen fija. Solo cuando pulsas reproducir se carga el
          reproductor, desde <code>youtube-nocookie.com</code>. A partir de ese momento YouTube puede
          guardar datos en tu navegador según su propia política. Si no pulsas, YouTube no carga nada.
        </p>
      </LegalSection>

      <LegalSection id="borrar" title="Cómo borrarlas">
        <p>
          Cerrando la sesión se borra la de sesión. Además puedes eliminarlas todas desde los ajustes
          de privacidad de tu navegador. Sin ellas Pixela sigue funcionando, pero no podrás iniciar
          sesión.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
