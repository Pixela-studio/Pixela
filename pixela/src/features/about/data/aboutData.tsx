import { FaFilm, FaUsers, FaHeart } from 'react-icons/fa';
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
  {
    icon: <FaUsers />,
    title: "Nuestra Comunidad",
    description: "Estamos trabajando en crear un espacio donde los amantes del cine puedan conectarse, compartir sus opiniones y descubrir nuevas perspectivas. ¡Pronto podrás ser parte de nuestra comunidad!",
    isComingSoon: true
  },
  {
    icon: <FaHeart />,
    title: "Nuestra Misión",
    description: "Buscamos inspirar y conectar a las personas a través del poder de las historias, creando un espacio donde la pasión por el cine y la televisión florece."
  }
]; 