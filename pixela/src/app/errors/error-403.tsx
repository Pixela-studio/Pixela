"use client";

import { useRouter } from 'next/navigation';
import './error-styles.css';
import { STYLES } from './_styles';

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
    router.push('/login');
  };

  return (
    <div className={STYLES.container}>
      {/* Efectos decorativos de fondo */}
      <div className={STYLES.decorative.glow}></div>
      <div className={STYLES.decorative.glow2}></div>
      
      {/* Gradiente de fondo */}
      <div className={STYLES.background.gradient}></div>
      
      <div className={STYLES.content.wrapper}>
        {/* Código de error 403 */}
        <h1 className={STYLES.content.errorCode}>
          403
        </h1>
        
        {/* Título */}
        <h2 className={STYLES.content.title}>
          ¡Acceso Denegado!
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
            - True Detective, acceso restringido
          </cite>
        </blockquote>
        
        {/* Botones de navegación */}
        <div className={STYLES.buttons.container}>
          <button
            onClick={handleLogin}
            className={STYLES.buttons.primary}
          >
            🔐 Iniciar Sesión
          </button>
          
          <button
            onClick={handleGoBack}
            className={STYLES.buttons.secondary}
          >
            ← Volver Atrás
          </button>
        </div>
      </div>
    </div>
  );
} 