import { proxyDetails } from "@/lib/api/tmdbProxy";

export const GET = async (
  _request: Request,
  props: { params: Promise<{ id: string }> },
) => proxyDetails("movies", (await props.params).id);
