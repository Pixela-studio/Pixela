"use client";

import { useRouter } from 'next/navigation';
import { FiLogIn, FiArrowLeft } from 'react-icons/fi';
import { STYLES } from './_styles';
import { loginHrefForHere } from '@/lib/authRedirect';

export default function Error403() {
  const router = useRouter();

  const handleGoBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  const handleLogin = () => {
    router.push(loginHrefForHere());
  };

  return (
    <div className={STYLES.container}>
      <div className={STYLES.noise} aria-hidden="true" />
      <div className={STYLES.vignette} aria-hidden="true" />
      
      <div className={STYLES.content.wrapper}>
        {/* Código de error 403 */}
        <h1 className={STYLES.content.errorCode}>
          403
        </h1>
        
        {/* Título */}
        <h2 className={STYLES.content.title}>
          Acceso denegado
        </h2>
        
        {/* Descripción */}
        <p className={STYLES.content.description}>
          Parece que intentas acceder a una zona restringida del multiverso cinematográfico.
          Necesitas las credenciales correctas para continuar tu viaje.
        </p>
        
        {/* Cita cinematográfica */}
        <blockquote className={STYLES.content.quote.container}>
          <p className={STYLES.content.quote.text}>
            &ldquo;Necesitas mostrarme tus manos. Necesitas mostrarme tus manos ahora mismo&rdquo;
          </p>
          <cite className={STYLES.content.quote.attribution}>
            — True Detective, acceso restringido
          </cite>
        </blockquote>
        
        {/* Botones de navegación */}
        <div className={STYLES.buttons.container}>
          <button
            onClick={handleLogin}
            className={STYLES.buttons.primary}
          >
            <FiLogIn className={STYLES.buttons.icon} aria-hidden="true" />
            Iniciar sesión
          </button>
          
          <button
            onClick={handleGoBack}
            className={STYLES.buttons.secondary}
          >
            <FiArrowLeft className={STYLES.buttons.icon} aria-hidden="true" />
            Volver atrás
          </button>
        </div>
      </div>
    </div>
  );
} 