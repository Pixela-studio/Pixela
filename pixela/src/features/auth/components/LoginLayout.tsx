import Image from 'next/image';

interface LoginLayoutProps {
  children: React.ReactNode;
}

export const LoginLayout = ({ children }: LoginLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-tr from-pixela-ink to-pixela-dark">
      <div className="w-full max-w-[960px] px-2 sm:px-6 py-8 overflow-hidden min-h-[400px] flex flex-col sm:flex-row items-center bg-transparent sm:bg-pixela-ink sm:bg-opacity-95 backdrop-blur-sm rounded-[25px]">
        {/* Logo */}
        <div className="w-full sm:w-1/2 flex justify-center mb-8 sm:mb-0 order-first sm:order-last">
          <div className="relative group">
            <Image
              src="/img/Logo-login.svg"
              alt="Pixela.io"
              width={192} // w-48 = 12rem = 192px
              height={100} // auto height approximation
              className="w-32 sm:w-48 h-auto transform transition-all duration-500 ease-in-out group-hover:scale-110 filter group-hover:brightness-110"
              priority
            />
          </div>
        </div>
        <div className="w-full sm:w-1/2 flex items-center justify-center">
          {children}
        </div>
      </div>
    </div>
  );
};
