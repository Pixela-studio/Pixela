import { ButtonHTMLAttributes } from 'react';

interface RoundedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const RoundedButton = ({ children, className = '', ...props }: RoundedButtonProps) => {
  return (
    <button 
      className={`relative inline-flex items-center justify-center w-full h-[48px] bg-pixela-dark border border-transparent rounded-[49px] font-semibold text-[16px] text-white hover:bg-pixela-accent/10 hover:border-pixela-accent transition-all duration-300 ease-in-out outline-none group ${className}`}
      {...props}
    >
      <span className="relative z-10 transition-transform duration-300 group-hover:scale-105">{children}</span>
    </button>
  );
};
