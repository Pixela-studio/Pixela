import { WeekendHeader } from "./WeekendHeader";
import type { WeekendMovie, WeekendSerie } from "../types";

interface WeekendSectionProps {
  movies: WeekendMovie[];
  series: WeekendSerie[];
  quote?: { quote: string; author: string };
}

export const WeekendSection = ({
  movies,
  series,
  quote,
}: WeekendSectionProps) => {
  return <WeekendHeader movies={movies} series={series} quote={quote} />;
};
