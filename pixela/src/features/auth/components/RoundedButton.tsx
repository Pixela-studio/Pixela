import { ButtonHTMLAttributes } from 'react';

interface RoundedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

/** Botón de envío de los formularios de auth: el primario de `globals.css` a todo el ancho. */
export const RoundedButton = ({ children, className = '', ...props }: RoundedButtonProps) => {
  return (
    <button className={`btn btn-primary w-full ${className}`} {...props}>
      {children}
    </button>
  );
};
