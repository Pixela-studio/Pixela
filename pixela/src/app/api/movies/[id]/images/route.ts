import { proxyImages } from "@/lib/api/tmdbProxy";

export const GET = async (
  _request: Request,
  props: { params: Promise<{ id: string }> },
) => proxyImages("movies", (await props.params).id);
