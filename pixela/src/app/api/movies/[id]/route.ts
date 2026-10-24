import { proxyDetails } from "@/lib/api/tmdbProxy";

export const GET = async (
  request: Request,
  props: { params: Promise<{ id: string }> },
) => proxyDetails(request, "movies", (await props.params).id);
