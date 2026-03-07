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

  // Generate unique ID for autofill styling hacks if needed, but simplistic approach here
  
  return (
    <div className="relative group overflow-hidden">
      {icon && (
        <div className="absolute top-0 bottom-0 left-0 pl-3 flex items-center pointer-events-none z-10 text-[#ec1b69]">
          <span className="h-5 w-5 flex items-center justify-center">{icon}</span>
        </div>
      )}
      
      <input 
        type={inputType}
        className={`w-full h-[48px] py-3 text-white border border-transparent bg-[#181818] hover:border-gray-500 focus:border-gray-500 hover:border-opacity-70 focus:border-opacity-90 rounded-[49px] transition-all duration-200 ease-out outline-none focus:outline-none focus:ring-0 px-6 placeholder-gray-500/50 placeholder-shown:text-[16px] focus:placeholder-gray-500/30 ${icon ? 'pl-10' : ''} ${className}`}
        {...props}
      />
      
      {isPassword && (
        <button 
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#ec1b69] transition-colors duration-200 cursor-pointer z-10 p-1 rounded focus:outline-none"
          aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
        >
          {showPassword ? <VscEyeClosed className="h-4 w-4" /> : <VscEye className="h-4 w-4" />}
        </button>
      )}
      
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gray-400 to-transparent translate-y-full opacity-0 group-hover:opacity-80 group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:translate-y-0 transition-all duration-300 ease-out"></div>
      
      <style jsx>{`
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus {
            -webkit-text-fill-color: rgba(255, 255, 255, 0.9) !important;
            -webkit-box-shadow: 0 0 0px 1000px #181818 inset !important;
            transition: background-color 5000s ease-in-out 0s;
            border-radius: 49px !important;
            caret-color: white;
        }
      `}</style>
    </div>
  );
};
