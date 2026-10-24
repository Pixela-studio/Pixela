import { proxyImages } from "@/lib/api/tmdbProxy";

export const GET = async (
  request: Request,
  props: { params: Promise<{ id: string }> },
) => proxyImages(request, "movies", (await props.params).id);
