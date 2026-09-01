import { BackgroundEffectProps } from "@/features/footer/types/components";
import { seededRange } from "@/lib/deterministicRandom";

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

/*
 * Los valores decorativos se calculan una sola vez al cargar el módulo y son
 * deterministas: antes salían de `Math.random()` dentro de `useMemo`, lo que
 * hacía saltar de sitio toda la decoración en cuanto React descartaba el memo,
 * y obligaba a cargar el componente con `ssr: false` para no romper la
 * hidratación.
 */
const TRIANGLE_ELEMENTS = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  size: seededRange(i, 0, 4, 10),
  top: seededRange(i, 1, 5, 95),
  left: seededRange(i, 2, 5, 95),
  rotation: seededRange(i, 3, 0, 360),
  duration: seededRange(i, 4, 25, 40),
  delay: seededRange(i, 5, 0, 5),
}));

const PIXEL_ELEMENTS = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  size: seededRange(i, 6, 2, 5),
  top: seededRange(i, 7, 0, 100),
  left: seededRange(i, 8, 0, 100),
  duration: seededRange(i, 9, 20, 30),
  delay: seededRange(i, 10, 0, 5),
}));

const FLOW_LINES = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  height: seededRange(i, 11, 0.5, 1.5),
  width: seededRange(i, 12, 10, 25),
  top: seededRange(i, 13, 0, 100),
  left: seededRange(i, 14, 0, 50),
  rotation: seededRange(i, 15, -10, 10),
  duration: seededRange(i, 16, 8, 12),
  delay: seededRange(i, 17, 0, 3),
}));

const BUBBLES = Array.from({ length: 5 }, (_, i) => ({
  id: i,
  size: seededRange(i, 18, 2, 8),
  left: 5 + i * 20 + seededRange(i, 19, 0, 10),
  delay: seededRange(i, 20, 0, 5),
}));

export const FooterBackgroundEffects: React.FC<BackgroundEffectProps> = ({ isAnimated }) => {
  const triangleElements = TRIANGLE_ELEMENTS;
  const pixelElements = PIXEL_ELEMENTS;
  const flowLines = FLOW_LINES;
  const bubbles = BUBBLES;

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