import { proxyMultiSearch } from "@/lib/api/tmdbProxy";

export const GET = (request: Request) => proxyMultiSearch(request);
