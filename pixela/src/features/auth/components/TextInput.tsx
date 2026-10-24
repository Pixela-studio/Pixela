'use client';

import { InputHTMLAttributes, useState } from 'react';
import { VscEye, VscEyeClosed } from 'react-icons/vsc';

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const TextInput = ({ icon, className = '', type = 'text', ...props }: TextInputProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="relative">
      {icon && (
        <div className="absolute top-0 bottom-0 left-0 pl-4 flex items-center pointer-events-none z-10 text-pixela-accent">
          <span className="h-5 w-5 flex items-center justify-center">{icon}</span>
        </div>
      )}
      
      <input 
        type={inputType}
        className={`w-full h-12 rounded-full border border-white/10 bg-pixela-surface px-6 text-base text-white placeholder:text-white/40 transition-[border-color,box-shadow] duration-200 ease-out-expo hover:border-white/20 focus:border-pixela-accent/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-pixela-accent/30 ${icon ? 'pl-11' : ''} ${isPassword ? 'pr-12' : ''} ${className}`}
        {...props}
      />
      
      {isPassword && (
        <button 
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-10 rounded-full p-2 text-white/55 transition-colors duration-200 hover:text-pixela-accent"
          aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
        >
          {showPassword ? <VscEyeClosed className="h-4 w-4" /> : <VscEye className="h-4 w-4" />}
        </button>
      )}

      <style jsx>{`
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus {
            -webkit-text-fill-color: rgba(255, 255, 255, 0.9) !important;
            -webkit-box-shadow: 0 0 0px 1000px #1f1f1f inset !important;
            transition: background-color 5000s ease-in-out 0s;
            caret-color: white;
        }
      `}</style>
    </div>
  );
};
