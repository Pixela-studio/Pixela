/**
 * Estilos compartidos por las páginas de error.
 *
 * `error-403.tsx` y `not-found.tsx` declaraban el mismo objeto `STYLES` de 28
 * líneas, copiado carácter a carácter. Cualquier retoque en una de las dos
 * dejaba la otra desincronizada sin que nada lo señalara.
 */
export const STYLES = {
  container: "min-h-screen bg-gradient-to-br from-[#0F0F0F] via-[#1A1A1A] to-[#0F0F0F] flex flex-col items-center justify-center p-4 relative overflow-hidden pt-20",
  background: {
    particles: "absolute inset-0 opacity-10",
    gradient: "absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20"
  },
  content: {
    wrapper: "relative z-10 text-center max-w-2xl mx-auto",
    errorCode: "text-8xl md:text-9xl font-black bg-gradient-to-r from-pixela-accent via-pixela-accent to-pixela-accent bg-clip-text text-transparent mb-6 drop-shadow-[0_0_50px_rgba(236,27,105,0.6)] animate-slow-pulse",
    title: "text-3xl md:text-4xl font-bold text-white mb-4",
    description: "text-gray-300 text-lg leading-relaxed mb-8 max-w-lg mx-auto",
    quote: {
      container: "border-l-4 border-pixela-accent bg-black/30 backdrop-blur-sm p-4 rounded-r-lg mb-8 italic",
      text: "text-pixela-accent text-base md:text-lg",
      attribution: "text-gray-400 text-sm mt-2 not-italic"
    }
  },
  buttons: {
    container: "flex flex-col sm:flex-row gap-4 justify-center items-center",
    primary: "inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pixela-accent to-pixela-accent hover:from-pixela-accent/90 hover:to-pixela-accent/90 text-white font-medium rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-pixela-accent/25",
    secondary: "inline-flex items-center gap-2 px-6 py-3 bg-gray-800/80 hover:bg-gray-700/80 text-gray-300 hover:text-white font-medium rounded-lg transition-all duration-300 backdrop-blur-sm border border-gray-600/50"
  },
  decorative: {
    glow: "absolute -top-20 -left-20 w-40 h-40 bg-pixela-accent/20 rounded-full blur-3xl animate-pulse",
    glow2: "absolute -bottom-20 -right-20 w-60 h-60 bg-pixela-accent/10 rounded-full blur-3xl animate-pulse delay-1000"
  }
} as const;
