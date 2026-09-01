import { proxyGenre } from "@/lib/api/tmdbProxy";

export const GET = async (
  request: Request,
  props: { params: Promise<{ type: string; id: string }> },
) => {
  const { type, id } = await props.params;
  return proxyGenre(request, type === "series" ? "series" : "movies", id);
};
