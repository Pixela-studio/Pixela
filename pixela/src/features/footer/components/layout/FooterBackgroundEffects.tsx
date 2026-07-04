import { useMemo } from 'react';
import { BackgroundEffectProps } from "@/features/footer/types/components";

const STYLES = {
  // Contenedor principal
  container: "absolute top-0 left-0 w-full h-full opacity-0 transition-opacity duration-1000",
  
  // Gradientes animados
  gradientContainer: "absolute top-[10%] left-[5%] w-64 h-64 rounded-full bg-[#EC1B69]/10 filter blur-[80px] animate-pulse-slow",
  gradientContainer2: "absolute bottom-[20%] right-[10%] w-80 h-80 rounded-full bg-purple-500/10 filter blur-[100px] animate-pulse-slow animation-delay-1000",
  
  // Elementos de fondo
  pixelGrid: "absolute inset-0 w-full h-full",
  flowLinesContainer: "absolute inset-0 w-full h-full overflow-hidden",
  flowLine: "absolute bg-gradient-to-r from-[#EC1B69]/5 to-transparent",
  
  // Elementos decorativos
  bubble: "absolute bottom-0 rounded-full bg-[#EC1B69]/20 backdrop-blur-md",
  digitalElementsContainer: "absolute inset-0 overflow-hidden pointer-events-none",
  triangle: "absolute opacity-20",
  pixel: "absolute bg-[#EC1B69]",
  
  // Texto de fondo
  backgroundText: "pointer-events-none select-none absolute inset-0 w-full h-full hidden md:flex items-center justify-center font-black uppercase tracking-tighter z-0 leading-none text-transparent transition-opacity duration-1000"
} as const;

export const FooterBackgroundEffects: React.FC<BackgroundEffectProps> = ({ isAnimated }) => {
  // Generar elementos decorativos con useMemo para evitar recálculos
  const triangleElements = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => {
      const size = Math.random() * 6 + 4;
      return {
        id: i,
        size,
        top: Math.random() * 90 + 5,
        left: Math.random() * 90 + 5,
        rotation: Math.random() * 360,
        duration: Math.random() * 15 + 25,
        delay: Math.random() * 5
      };
    });
  }, []);

  const pixelElements = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const size = Math.random() * 3 + 2;
      return {
        id: i,
        size,
        top: Math.random() * 100,
        left: Math.random() * 100,
        duration: Math.random() * 10 + 20,
        delay: Math.random() * 5
      };
    });
  }, []);

  const flowLines = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => {
      return {
        id: i,
        height: Math.random() * 1 + 0.5,
        width: Math.random() * 15 + 10,
        top: Math.random() * 100,
        left: Math.random() * 50,
        rotation: Math.random() * 20 - 10,
        duration: Math.random() * 4 + 8,
        delay: Math.random() * 3
      };
    });
  }, []);

  const bubbles = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => {
      return {
        id: i,
        size: Math.random() * 6 + 2,
        left: 5 + (i * 20) + Math.random() * 10,
        delay: Math.random() * 5
      };
    });
  }, []);

  return (
    <>
      {/* Elementos decorativos de fondo */}
      <div className={`${STYLES.container} ${isAnimated ? 'opacity-30' : ''}`}>
        <div className={STYLES.gradientContainer} />
        <div className={STYLES.gradientContainer2} />
      </div>
      
      {/* Grid de píxeles decorativo animado */}
      <div 
        className={STYLES.pixelGrid}
        style={{
          backgroundImage: "radial-gradient(circle, #EC1B69 1px, transparent 1px)",
          backgroundSize: "30px 30px",
          opacity: 0.08,
          animation: "pixelPulse 8s infinite alternate"
        }}
      />
      
      {/* Líneas de flujo estilo digital */}
      <div className={STYLES.flowLinesContainer}>
        {flowLines.map(line => (
          <div 
            key={`line-${line.id}`}
            className={STYLES.flowLine}
            style={{
              height: `${line.height}px`,
              width: `${line.width}%`,
              top: `${line.top}%`,
              left: `${line.left}%`,
              opacity: 0.3,
              transform: `rotate(${line.rotation}deg)`,
              filter: 'blur(0.5px)',
              animation: `flowLine ${line.duration}s infinite ease-in-out`,
              animationDelay: `${line.delay}s`
            }}
          />
        ))}
        
        {bubbles.map(bubble => (
          <div 
            key={`bubble-${bubble.id}`}
            className={STYLES.bubble}
            style={{
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
              left: `${bubble.left}%`,
              animation: `riseUp 15s infinite ease-in-out`,
              animationDelay: `${bubble.delay}s`,
              opacity: 0.4,
            }}
          />
        ))}
      </div>

      {/* Elementos digitales decorativos */}
      <div className={STYLES.digitalElementsContainer}>
        {/* Triángulos pequeños */}
        {triangleElements.map(triangle => (
          <div 
            key={`triangle-${triangle.id}`}
            className={STYLES.triangle}
            style={{
              width: `${triangle.size}px`,
              height: `${triangle.size}px`,
              top: `${triangle.top}%`,
              left: `${triangle.left}%`,
              borderLeft: `${triangle.size/2}px solid transparent`,
              borderRight: `${triangle.size/2}px solid transparent`,
              borderBottom: `${triangle.size}px solid rgba(255,0,127,0.6)`,
              transform: `rotate(${triangle.rotation}deg)`,
              animation: `spinFloat ${triangle.duration}s infinite linear`,
              animationDelay: `${triangle.delay}s`,
            }}
          />
        ))}

        {/* Píxeles cuadrados */}
        {pixelElements.map(pixel => (
          <div 
            key={`pixel-${pixel.id}`}
            className={STYLES.pixel}
            style={{
              width: `${pixel.size}px`,
              height: `${pixel.size}px`,
              top: `${pixel.top}%`,
              left: `${pixel.left}%`,
              opacity: 0.3,
              animation: `pixelFloat ${pixel.duration}s infinite ease-in-out`,
              animationDelay: `${pixel.delay}s`,
            }}
          />
        ))}
      </div>
      
      {/* Fondo decorativo: PIXELA gigante */}
      <span
        className={`${STYLES.backgroundText} ${isAnimated ? 'opacity-8' : 'opacity-0'}`}
        style={{
          lineHeight: 1,
          fontSize: "clamp(200px, 30vw, 500px)",
          letterSpacing: "-0.05em",
          userSelect: "none",
          whiteSpace: "nowrap",
          backgroundImage: "linear-gradient(8deg, rgb(24, 24, 24) -50%, rgb(26, 26, 26) 0%, rgba(26, 26, 26, 0.8) 35%, rgba(255, 0, 127, 0.12) 100%, rgba(255, 0, 127, 0.08) 100%)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
        }}
        aria-hidden
      >
        PIXELA
      </span>
    </>
  );
};

export default FooterBackgroundEffects; 