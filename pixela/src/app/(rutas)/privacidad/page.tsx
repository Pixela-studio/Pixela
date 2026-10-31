import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPage, LegalSection } from '@/features/legal/components/LegalPage';
import { CONTACT_EMAIL, SITE_LOCATION, SITE_OWNERS } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Política de privacidad · Pixela',
  description: 'Qué datos guarda Pixela, para qué, quién los ve y cómo borrarlos o descargarlos.',
};

export default function PrivacidadPage() {
  return (
    <LegalPage
      title="Política de privacidad"
      current="/privacidad"
      intro={
        <p>
          Pixela guarda lo mínimo para que tengas una cuenta, tus listas y tus reseñas. No hay
          publicidad, no hay analítica de terceros y tus datos no se venden ni se ceden a nadie.
        </p>
      }
    >
      <LegalSection id="responsable" title="Quién es el responsable">
        <p>
          {SITE_OWNERS}, autores de Pixela, un proyecto personal sin actividad comercial con base en{' '}
          {SITE_LOCATION}. Para cualquier cuestión sobre tus datos escribe a{' '}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </LegalSection>

      <LegalSection id="datos" title="Qué datos guardamos">
        <ul>
          <li>
            <strong>Al registrarte:</strong> tu nombre de usuario, tu correo y tu contraseña. La
            contraseña se guarda cifrada con bcrypt; nadie, tampoco nosotros, puede leerla.
          </li>
          <li>
            <strong>Si los añades:</strong> foto de perfil e imagen de portada.
          </li>
          <li>
            <strong>Lo que haces en Pixela:</strong> los títulos que marcas como favoritos, tu
            biblioteca (pendiente, viendo, vista o abandonada) y tus reseñas, con la nota, el texto y
            la fecha.
          </li>
        </ul>
        <p>
          No guardamos tu dirección IP en la base de datos ni registramos qué fichas visitas.
        </p>
      </LegalSection>

      <LegalSection id="finalidad" title="Para qué y con qué base">
        <p>
          Solo para prestarte el servicio: identificarte al entrar, guardar tus listas y publicar tus
          reseñas. La base jurídica es la ejecución de las condiciones de uso que aceptas al crear la
          cuenta (artículo 6.1.b del RGPD). No tomamos decisiones automatizadas ni hacemos perfiles.
        </p>
      </LegalSection>

      <LegalSection id="publico" title="Qué es público y qué no">
        <p>
          <strong>Tus reseñas son públicas.</strong> Aparecen en la ficha del título con tu nombre de
          usuario y tu foto, y las puede leer cualquiera, tenga cuenta o no. Te lo recordamos cada
          vez que escribes una.
        </p>
        <p>
          <strong>Tus favoritos, tu biblioteca y tu correo son privados.</strong> Solo los ves tú.
        </p>
      </LegalSection>

      <LegalSection id="terceros" title="Servicios de terceros">
        <ul>
          <li>
            <strong>The Movie Database (TMDB):</strong> los pósters, fotos y fondos se cargan
            directamente desde <code>image.tmdb.org</code>, así que TMDB recibe tu dirección IP como
            cualquier servidor de imágenes. No le enviamos ningún dato de tu cuenta.
          </li>
          <li>
            <strong>YouTube:</strong> los tráileres no se cargan hasta que pulsas reproducir, y lo
            hacen desde <code>youtube-nocookie.com</code>, el modo de privacidad mejorada de YouTube.
            Desde ese momento se aplica la política de privacidad de Google.
          </li>
          <li>
            <strong>Resend:</strong> si pides recuperar tu contraseña, el correo con el enlace se
            envía a través de Resend, que recibe tu dirección de correo solo para entregarlo.
          </li>
          <li>
            <strong>Alojamiento:</strong> la aplicación y su base de datos se alojan en un servidor
            gestionado por los responsables, que actúa como encargado del tratamiento.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="plazo" title="Cuánto tiempo">
        <p>
          Mientras tengas la cuenta. Cuando la eliminas se borran de inmediato tu usuario, tus
          favoritos, tu biblioteca y tus reseñas, y las fichas donde reseñaste dejan de mostrarte.
        </p>
      </LegalSection>

      <LegalSection id="derechos" title="Tus derechos">
        <p>
          Puedes acceder a tus datos, corregirlos, borrarlos, llevártelos, oponerte a su tratamiento
          o pedir que se limite. Casi todo lo puedes hacer tú desde{' '}
          <Link href="/profile" prefetch={false}>
            tu perfil
          </Link>
          :
        </p>
        <ul>
          <li>Cambiar tu nombre, correo, foto y contraseña.</li>
          <li>
            <strong>Descargar tus datos</strong> en un fichero JSON con todo lo que guardamos de ti.
          </li>
          <li>
            <strong>Eliminar tu cuenta</strong> y todo su contenido.
          </li>
        </ul>
        <p>
          Para lo demás, escribe a <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> y te
          responderemos en un mes como máximo. Si no quedas conforme, puedes reclamar ante la{' '}
          <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer">
            Agencia Española de Protección de Datos
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection id="edad" title="Edad mínima">
        <p>
          Para crear una cuenta tienes que tener 14 años o más, la edad a partir de la cual puedes
          consentir por ti mismo en España (artículo 7 de la LOPDGDD). Si tienes menos, necesitas que
          tu madre, tu padre o tu tutor lo hagan por ti.
        </p>
      </LegalSection>

      <LegalSection id="seguridad" title="Seguridad">
        <p>
          Las conexiones van cifradas con HTTPS, la contraseña se guarda con hash y la sesión vive en
          una cookie a la que no puede acceder el código de la página. Ningún sistema es invulnerable:
          si detectas un fallo, avísanos en el correo de arriba.
        </p>
      </LegalSection>

      <LegalSection id="cambios" title="Cambios en esta política">
        <p>
          Si cambia algo importante, actualizaremos la fecha de arriba y te lo diremos al entrar.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
