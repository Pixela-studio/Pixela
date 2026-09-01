const path = require('path');

/**
 * Cabeceras de caché reutilizadas.
 *
 * `immutable` solo se pone donde el nombre del fichero cambia con el contenido
 * o donde el contenido no cambia nunca; en el resto se usa `s-maxage` +
 * `stale-while-revalidate` para que sirva la CDN y no la función.
 */
const IMMUTABLE = 'public, max-age=31536000, immutable';
const ONE_DAY_SWR = 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800';

/** @type {import('next').NextConfig} */
const nextConfig = {
    /*
     * Ancla la raíz del workspace a esta carpeta.
     *
     * Next deduce la raíz buscando lockfiles hacia arriba. Si existe un
     * `pnpm-lock.yaml` o un `package.json` sueltos en el directorio del usuario
     * —cosa habitual tras un `npm install` lanzado por error fuera de un
     * proyecto—, Next elige ese directorio como raíz y se pone a rastrear
     * archivos desde ahí: AppData, OneDrive y las junctions heredadas de
     * Windows ("Cookies", "Menú Inicio", "Mis documentos"). Recorrerlas falla
     * por permisos y tumba el worker con el críptico
     * "Jest worker encountered 2 child process exceptions", que en el navegador
     * se ve como un ClientFetchError de Auth.js porque /api/auth/session
     * devuelve la página de error HTML en vez de JSON.
     */
    outputFileTracingRoot: path.join(__dirname),

    // Cabecera `X-Powered-By: Next.js`: bytes en cada respuesta y una pista
    // gratis para escáneres automáticos que luego se traducen en más tráfico.
    poweredByHeader: false,

    images: {
        /*
         * Las imágenes de TMDB se sirven desde su propia CDN sin pasar por
         * `/_next/image`. Ver `src/lib/imageLoader.js` para el detalle: era la
         * mayor fuente de Edge Requests del proyecto (decenas por visita).
         */
        loader: 'custom',
        loaderFile: './src/lib/imageLoader.js',

        /*
         * Para las imágenes locales que siguen pasando por el optimizador:
         * 31 días en caché en vez de los 60 s por defecto, que obligaban a
         * reoptimizar la misma imagen una y otra vez.
         */
        minimumCacheTTL: 2678400,

        remotePatterns: [
            { protocol: 'https', hostname: 'image.tmdb.org' },
            { protocol: 'https', hostname: 'placehold.co' },
            { protocol: 'https', hostname: 'images.unsplash.com' },
            { protocol: 'https', hostname: 'via.placeholder.com' },
            { protocol: 'https', hostname: 'img.youtube.com' },
            { protocol: 'https', hostname: 'i.pravatar.cc' },
            { protocol: 'https', hostname: 'picsum.photos' },
            { protocol: 'http',  hostname: 'localhost' },
        ],
    },
    experimental: {
        optimizePackageImports: ['react-icons'],
    },

    /**
     * Caché HTTP explícita.
     *
     * Sin esto, todo lo que vive en `public/` se servía con
     * `Cache-Control: public, max-age=0`, así que el navegador revalidaba en
     * cada visita: una petición al edge por fichero y por carga de página.
     */
    async headers() {
        return [
            {
                // Chunks y fuentes autohospedadas: el hash va en el nombre.
                source: '/_next/static/:path*',
                headers: [{ key: 'Cache-Control', value: IMMUTABLE }],
            },
            {
                source: '/img/:path*',
                headers: [{ key: 'Cache-Control', value: IMMUTABLE }],
            },
            {
                source: '/:path*.:ext(ico|png|jpg|jpeg|gif|webp|avif|svg|woff|woff2|ttf|otf)',
                headers: [{ key: 'Cache-Control', value: IMMUTABLE }],
            },
            {
                source: '/:path*.:ext(txt|xml|webmanifest)',
                headers: [{ key: 'Cache-Control', value: ONE_DAY_SWR }],
            },
            {
                /*
                 * La API interna no aporta nada a un buscador y sí atrae
                 * rastreadores: 25 rutas indexables que devuelven JSON.
                 * `noindex` las saca del índice y corta el tráfico recurrente.
                 */
                source: '/api/:path*',
                headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
            },
        ];
    },
};

module.exports = nextConfig;
