import { proxySeason } from "@/lib/api/tmdbProxy";

export const GET = async (
  _request: Request,
  props: { params: Promise<{ id: string; season: string }> },
) => {
  const { id, season } = await props.params;
  return proxySeason(id, season);
};
