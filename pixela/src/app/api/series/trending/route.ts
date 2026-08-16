import { proxyTrending } from "@/lib/api/tmdbProxy";

export const GET = (request: Request) => proxyTrending(request, "series");
