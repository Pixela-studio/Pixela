import { FaFilm, FaUsers, FaHeart } from 'react-icons/fa';
import { TeamMember, FeatureCard } from '@/features/about/types/components';

/**
 * Lista de miembros del equipo de Pixela
 * @constant
 * @type {TeamMember[]}
 */
export const TEAM_MEMBERS: TeamMember[] = [
  {
    name: "Envyx10",
    role: "Desarrollador Full Stack",
    image: "/about/img/aboutus-envyx10.jpg",
    linkedin: "https://www.linkedin.com/in/envyx10/",
    github: "https://github.com/envyx10",
    favoriteSeries: "Black Mirror",
    favoriteMovie: "Interstellar",
    quote: "Cada línea de código es una historia por contar, cada proyecto una nueva aventura cinematográfica."
  },
  {
    name: "Ruyi",
    role: "Desarrolladora Full Stack",
    image: "/about/img/aboutus-ruyi.jpg",
    linkedin: "https://www.linkedin.com/in/ruyi-xia-ye-b19853189/",
    github: "https://github.com/rxy94",
    favoriteSeries: "The Office",
    favoriteMovie: "Interstellar",
    quote: "Transformando ideas en experiencias digitales que conectan a los amantes del cine."
  }
];

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