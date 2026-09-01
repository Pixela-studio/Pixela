import { proxySearch } from "@/lib/api/tmdbProxy";

export const GET = (request: Request) => proxySearch(request, "movies");
