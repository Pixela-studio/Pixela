const path = require('path');

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

    images: {
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
};

module.exports = nextConfig;
