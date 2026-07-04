import { useMemo } from 'react';
import { Particle, ParticleOptions } from "@/features/footer/types/components";

const STYLES = {
  container: "absolute inset-0 w-full h-full overflow-hidden pointer-events-none",
  particle: "absolute rounded-full bg-[#EC1B69] animate-float"
} as const;


/**
 * Componente para partículas sutiles del footer
 * @type
 * @returns {FooterParticles}
 * @description Componente para partículas sutiles
 */
export const FooterParticles = () => {
  // Función optimizada para generar partículas
  const generateParticles = (count: number, options: ParticleOptions): Particle[] => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      size: Math.random() * (options.maxSize - options.minSize) + options.minSize,
      top: Math.random() * 100,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: Math.random() * (options.maxDuration - options.minDuration) + options.minDuration,
      opacity: options.opacity || (Math.random() * 0.5 + 0.2)
    }));
  };

  // Generar partículas con useMemo para evitar recálculos en cada render
  const smallParticles = useMemo(() => 
    generateParticles(15, { minSize: 1, maxSize: 3, minDuration: 20, maxDuration: 40, opacity: 0.4 }), 
  []);
  
  const mediumParticles = useMemo(() => 
    generateParticles(10, { minSize: 3, maxSize: 6, minDuration: 25, maxDuration: 35 }), 
  []);
  
  const glowParticles = useMemo(() => 
    generateParticles(6, { minSize: 4, maxSize: 8, minDuration: 15, maxDuration: 25, opacity: 0.2 }), 
  []);

  return (
    <>
      {/* Partículas pequeñas sutiles */}
      <div className={STYLES.container}>
        {smallParticles.map(particle => (
          <div 
            key={`small-${particle.id}`}
            className={STYLES.particle}
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              top: `${particle.top}%`,
              left: `${particle.left}%`,
              opacity: particle.opacity,
              animation: `floatParticle ${particle.duration}s infinite ease-in-out`,
              animationDelay: `${particle.delay}s`,
              willChange: 'transform, opacity'
            }}
          />
        ))}

        {/* Partículas medianas con desvanecimiento */}
        {mediumParticles.map(particle => (
          <div 
            key={`medium-${particle.id}`}
            className={STYLES.particle}
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              top: `${particle.top}%`,
              left: `${particle.left}%`,
              opacity: particle.opacity,
              animation: `pulseAndFloat ${particle.duration}s infinite ease-in-out`,
              animationDelay: `${particle.delay}s`,
              willChange: 'transform, opacity, scale'
            }}
          />
        ))}

        {/* Partículas con efecto de brillo */}
        {glowParticles.map(particle => (
          <div 
            key={`glow-${particle.id}`}
            className={STYLES.particle}
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              top: `${particle.top}%`,
              left: `${particle.left}%`,
              opacity: particle.opacity,
              background: 'radial-gradient(circle, rgba(255,0,127,0.8) 0%, rgba(255,0,127,0) 70%)',
              filter: 'blur(1px)',
              animation: `glowAndFloat ${particle.duration}s infinite ease-in-out`,
              animationDelay: `${particle.delay}s`,
              willChange: 'transform, filter, scale'
            }}
          />
        ))}
      </div>
    </>
  );
};

export default FooterParticles; 