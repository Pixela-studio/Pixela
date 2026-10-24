import { FaGithub } from 'react-icons/fa';
import { FiArrowUpRight } from 'react-icons/fi';

/*
 * Antes enlazaba a instagram.com/pixela, linkedin.com/company/pixela y
 * github.com/pixela: tres cuentas que no son del proyecto. Queda el único
 * canal real, el repositorio.
 */
const REPO_URL = 'https://github.com/Pixela-studio/Pixela';

const STYLES = {
  container: "w-full flex flex-col space-y-4 md:space-y-5 ipad:space-y-4",
  title: "text-white font-semibold text-base",
  link: "group inline-flex w-fit items-center gap-3 whitespace-nowrap rounded-full border border-white/10 bg-white/5 py-2.5 pl-3 pr-4 text-sm font-medium text-white/80 transition-colors duration-300 hover:border-pixela-accent/40 hover:text-white",
  icon: "h-5 w-5 text-white/70 transition-colors duration-300 group-hover:text-pixela-accent",
  arrow: "h-4 w-4 transition-transform duration-300 ease-out-expo group-hover:-translate-y-0.5 group-hover:translate-x-0.5",
} as const;

export const FooterSocialLinks = () => (
  <div className={STYLES.container}>
    <h3 className={STYLES.title}>
      El proyecto
    </h3>
    <a
      href={REPO_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={STYLES.link}
    >
      <FaGithub className={STYLES.icon} aria-hidden="true" />
      Código en GitHub
      <FiArrowUpRight className={STYLES.arrow} aria-hidden="true" />
      <span className="sr-only">(se abre en una pestaña nueva)</span>
    </a>
  </div>
);

export default FooterSocialLinks;
