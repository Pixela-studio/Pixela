import { FaFilm, FaBookmark, FaHeart } from 'react-icons/fa';
import { FeatureCard } from '@/features/about/types/components';

/**
 * Lista de características principales de Pixela
 * @constant
 * @type {FeatureCard[]}
 */
export const FEATURE_CARDS: FeatureCard[] = [
  {
    icon: <FaFilm />,
    title: "Nuestra Pasión",
    description: "Nos dedicamos a crear una experiencia única para los amantes del cine y la televisión, ofreciendo una plataforma donde pueden descubrir y compartir sus historias favoritas."
  },
  // Antes era "Nuestra Comunidad" con una etiqueta "Próximamente": una promesa
  // sin fecha. Ahora la tarjeta cuenta lo que Pixela ya hace hoy.
  {
    icon: <FaBookmark />,
    title: "Tu Biblioteca",
    description: "Guarda lo que quieres ver, marca lo que estás viendo o ya has visto y escribe reseñas con tu nota. Todo queda en tu perfil para cuando vuelvas."
  },
  {
    icon: <FaHeart />,
    title: "Nuestra Misión",
    description: "Buscamos inspirar y conectar a las personas a través del poder de las historias, creando un espacio donde la pasión por el cine y la televisión florece."
  }
]; 