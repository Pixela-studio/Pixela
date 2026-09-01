import Image from 'next/image';

interface PosterImageProps {
  src: string;
  alt: string;
}

const STYLES = {
  container: "transform-gpu overflow-hidden rounded-lg shadow-2xl shadow-black/50 group",
  image: "transition duration-300 group-hover:scale-105 origin-center"
} as const;

export const PosterImage = ({ src, alt }: PosterImageProps) => (
  <div className={STYLES.container}>
    <Image 
      src={src} 
      alt={alt}
      className={STYLES.image}
      width={800}
      height={1200}
      priority
      style={{
        objectFit: 'contain',
        maxHeight: '70vh',
        width: 'auto'
      }}
    />
  </div>
); 