import { GenresListProps } from '@/features/media/types/genres';

const STYLES = {
  container: "flex flex-wrap gap-2 mb-4",
  genreBadge: "bg-red-600/20 text-red-400 px-3 py-1 rounded-full text-sm font-medium hover:bg-red-600/30 transition duration-300 shadow-sm shadow-red-950/30"
} as const;

export const GenresList = ({ genres }: GenresListProps) => (
  <div className={STYLES.container}>
    {genres.map((genre, index) => (
      <span 
        key={index}
        className={STYLES.genreBadge}
      >
        {genre}
      </span>
    ))}
  </div>
); 