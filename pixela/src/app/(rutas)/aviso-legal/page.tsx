import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPage, LegalSection } from '@/features/legal/components/LegalPage';
import { CONTACT_EMAIL, SITE_LOCATION, SITE_OWNERS } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Aviso legal y condiciones de uso · Pixela',
  description: 'Quién está detrás de Pixela y las normas para usarla y publicar reseñas.',
};

export default function AvisoLegalPage() {
  return (
    <LegalPage
      title="Aviso legal y condiciones"
      current="/aviso-legal"
      intro={
        <p>
          Quién está detrás de Pixela y las normas que aceptas al crear una cuenta. Son pocas y
          están escritas para leerse.
        </p>
      }
    >
      <LegalSection id="titular" title="Titulares">
        <ul>
          <li>
            <strong>Titulares:</strong> {SITE_OWNERS}.
          </li>
          <li>
            <strong>Ubicación:</strong> {SITE_LOCATION}.
          </li>
          <li>
            <strong>Contacto:</strong> <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
          </li>
          <li>
            <strong>Naturaleza:</strong> proyecto personal y de portfolio, gratuito y sin actividad
            comercial, publicidad ni suscripciones.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="contenido" title="De dónde salen los datos">
        <p>
          La información de películas, series y personas, y sus imágenes, procede de{' '}
          <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer">
            The Movie Database (TMDB)
          </a>
          . Pixela usa la API de TMDB, pero no está respaldada ni certificada por TMDB. Las
          plataformas donde ver cada título son las que TMDB publica para España y pueden cambiar sin
          aviso: compruébalo en la plataforma antes de pagar.
        </p>
        <p>
          Los tráileres son vídeos de YouTube incrustados. Pósters, fotos, logos y vídeos pertenecen
          a sus respectivos titulares.
        </p>
      </LegalSection>

      <LegalSection id="cuenta" title="Tu cuenta">
        <ul>
          <li>Tienes que tener 14 años o más para crearla.</li>
          <li>
            Eres responsable de tu contraseña. Si crees que alguien la conoce, cámbiala o cierra la
            sesión en todos tus dispositivos desde el perfil.
          </li>
          <li>Puedes eliminar tu cuenta cuando quieras desde el perfil.</li>
        </ul>
      </LegalSection>

      <LegalSection id="resenas" title="Normas para las reseñas">
        <p>
          Las reseñas son públicas y llevan tu nombre. Al publicarlas, te comprometes a que no
          contengan:
        </p>
        <ul>
          <li>insultos, acoso o discurso de odio hacia personas o colectivos;</li>
          <li>datos personales de otras personas;</li>
          <li>spam, publicidad o enlaces engañosos;</li>
          <li>contenido ilegal o que infrinja derechos de terceros.</li>
        </ul>
        <p>
          Sigues siendo el autor de lo que escribes. Nos das permiso para mostrarlo en Pixela mientras
          no lo borres. Podemos retirar reseñas que incumplan estas normas y, si se repite, suspender la
          cuenta. Si ves una que las incumple, escríbenos a{' '}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </LegalSection>

      <LegalSection id="responsabilidad" title="Responsabilidad">
        <p>
          Pixela se ofrece tal cual, sin garantía de disponibilidad continua. Cada usuario es
          responsable de lo que publica. No respondemos del contenido de las webs externas a las que
          enlazamos.
        </p>
      </LegalSection>

      <LegalSection id="propiedad" title="Propiedad intelectual">
        <p>
          El código, el diseño y los textos propios de Pixela son de sus autores. El código fuente
          está publicado en{' '}
          <a href="https://github.com/Pixela-studio/Pixela" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection id="ley" title="Ley aplicable">
        <p>
          Estas condiciones se rigen por la ley española. Cómo tratamos tus datos está en la{' '}
          <Link href="/privacidad" prefetch={false}>
            política de privacidad
          </Link>{' '}
          y qué guarda tu navegador, en la{' '}
          <Link href="/cookies" prefetch={false}>
            política de cookies
          </Link>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
