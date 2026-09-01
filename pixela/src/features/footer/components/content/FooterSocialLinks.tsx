'use client';

import Link from 'next/link';
import { FaInstagram, FaLinkedin, FaGithub } from 'react-icons/fa';

const STYLES = {
  // Layout y estructura
  container: "w-full flex flex-col space-y-4 md:space-y-5 ipad:space-y-4",
  socialList: "flex gap-4 md:gap-5 ipad:gap-4",

  // Título y decoración
  title: "text-white font-bold text-base md:text-lg relative inline-block ipad:text-base",
  titleUnderline: "absolute -bottom-1 left-0 w-8 h-0.5 bg-[#EC1B69]/50 rounded-full",

  // Enlaces sociales
  socialLink: "group p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#EC1B69]/30 transition-all duration-300 transform hover:scale-110 hover:-translate-y-1 backdrop-blur-sm shadow-lg shadow-black/20 hover:shadow-[#EC1B69]/10 ipad:p-2.5",
  socialIcon: "text-white/70 group-hover:text-[#EC1B69] transition-colors duration-300 text-lg md:text-xl ipad:text-lg",
} as const;

const socialLinks = [
  { name: 'Instagram', icon: FaInstagram, href: 'https://instagram.com/pixela' },
  { name: 'LinkedIn', icon: FaLinkedin, href: 'https://linkedin.com/company/pixela' },
  { name: 'GitHub', icon: FaGithub, href: 'https://github.com/pixela' },
];

export const FooterSocialLinks = () => {
  return (
    <div className={STYLES.container}>
      <h3 className={STYLES.title}>
        Conecta con nosotros
        <div className={STYLES.titleUnderline}></div>
      </h3>
      <div className={STYLES.socialList}>
        {socialLinks.map((social, index) => (
          <Link
            key={index}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={social.name}
            className={STYLES.socialLink}
          >
            <social.icon className={STYLES.socialIcon} />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default FooterSocialLinks; 