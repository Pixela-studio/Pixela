import { proxyDiscover } from "@/lib/api/tmdbProxy";

export const GET = (request: Request) => proxyDiscover(request, "series");
