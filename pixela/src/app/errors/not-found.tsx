"use client";

import { useRouter } from 'next/navigation';
import './error-styles.css';
import { STYLES } from './_styles';

export default function NotFound() {
  const router = useRouter();

  const handleGoBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  return (
    <div className={STYLES.container}>
      {/* Efectos decorativos de fondo */}
      <div className={STYLES.decorative.glow}></div>
      <div className={STYLES.decorative.glow2}></div>
      
      {/* Gradiente de fondo */}
      <div className={STYLES.background.gradient}></div>
      
      <div className={STYLES.content.wrapper}>
        {/* Código de error 404 */}
        <h1 className={STYLES.content.errorCode}>
          404
        </h1>
        
        {/* Título */}
        <h2 className={STYLES.content.title}>
          ¡Página No Encontrada!
        </h2>
        
        {/* Descripción */}
        <p className={STYLES.content.description}>
          Parece que la página que buscas se perdió en el multiverso cinematográfico.
          Tal vez fue cancelada como una secuela que nadie pidió.
        </p>
        
        {/* Cita cinematográfica */}
        <blockquote className={STYLES.content.quote.container}>
          <p className={STYLES.content.quote.text}>
            &ldquo;Este lugar es como el recuerdo de alguien de un pueblo, y el recuerdo se está desvaneciendo&rdquo;
          </p>
          <cite className={STYLES.content.quote.attribution}>
            - True Detective, página perdida en el tiempo
          </cite>
        </blockquote>

        {/* Botones de navegación */}
        <div className={STYLES.buttons.container}>
          <button
            onClick={() => router.push('/')}
            className={STYLES.buttons.primary}
          >
            🏠 Volver al Inicio
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