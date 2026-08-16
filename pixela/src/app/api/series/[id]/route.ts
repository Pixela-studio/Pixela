import { proxyDetails } from "@/lib/api/tmdbProxy";

export const GET = async (
  _request: Request,
  props: { params: Promise<{ id: string }> },
) => proxyDetails("series", (await props.params).id);
