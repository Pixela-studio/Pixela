import { TheatricalHeader } from "./TheatricalHeader";
import type { TheatricalMovie } from "../types";

interface TheatricalSectionProps {
  movies: TheatricalMovie[];
  quote?: { quote: string; author: string };
}

export const TheatricalSection = ({
  movies,
  quote,
}: TheatricalSectionProps) => {
  return <TheatricalHeader movies={movies} quote={quote} />;
};
