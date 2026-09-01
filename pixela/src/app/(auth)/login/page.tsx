'use client';

import { Suspense, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { TextInput } from '@/features/auth/components/TextInput';
import { RoundedButton } from '@/features/auth/components/RoundedButton';
import { VscMail, VscLock } from 'react-icons/vsc';

/** Solo se aceptan rutas internas: evita un open redirect vía `?callbackUrl=`. */
const safeCallbackUrl = (raw: string | null): string => {
  if (!raw) return '/';
  if (!raw.startsWith('/') || raw.startsWith('//')) return '/';
  return raw;
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // `middleware.ts` redirige aquí con la ruta original cuando falta sesión.
  const callbackUrl = safeCallbackUrl(searchParams.get('callbackUrl'));
  const justRegistered = searchParams.get('registered') === 'true';

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    try {
      const res = await signIn('credentials', {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        redirect: false,
      });

      if (res?.error) {
        setError('Estas credenciales no coinciden con nuestros registros.');
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError('Ocurrió un error inesperado. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="py-4 space-y-6 w-full max-w-xs mx-auto px-4">
      <h2 className="text-[24px] font-['Outfit'] text-white font-bold mb-8">
        Bienvenido a Pixela | <span className="text-gray-500">Iniciar sesión</span>
      </h2>

      {justRegistered && (
        <p
          role="status"
          className="text-[14px] font-['Outfit'] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2"
        >
          Cuenta creada. Inicia sesión para continuar.
        </p>
      )}

      <div className="relative mb-5">
        <TextInput
          id="email"
          name="email"
          type="email"
          placeholder="Email"
          icon={<VscMail />}
          required
          autoFocus
          autoComplete="username"
        />
      </div>

      <div className="relative mb-5">
        <TextInput
          id="password"
          name="password"
          type="password"
          placeholder="Contraseña"
          icon={<VscLock />}
          required
          autoComplete="current-password"
        />
      </div>

      {/* `role="alert"` para que un lector de pantalla anuncie el fallo. */}
      {error && (
        <div role="alert" className="text-[#ec1b69] text-[14px] font-['Outfit']">
          {error}
        </div>
      )}

      <div className="mb-6">
        <RoundedButton type="submit" disabled={loading}>
          {loading ? 'Iniciando...' : 'Iniciar'}
        </RoundedButton>
      </div>

      <div className="flex flex-col gap-4">
        {/* El enlace apuntaba a /forgot-password, una ruta que no existe: cada
            clic llevaba a un 404. Hasta que haya recuperación por email se
            muestra como texto deshabilitado en vez de prometer algo que falla. */}
        <span
          className="text-[15px] font-['Outfit'] text-gray-600 cursor-not-allowed select-none"
          title="Disponible próximamente"
        >
          ¿Olvidaste tu contraseña?
        </span>

        <div className="text-[15px] font-['Outfit'] text-gray-400">
          ¿No tienes cuenta?
          <Link
            href="/register"
            className="ml-2 text-[#ec1b69] hover:text-[#ec1b69]/80 transition-colors duration-300"
          >
            Registrarse
          </Link>
        </div>
      </div>
    </form>
  );
}

export default function LoginPage() {
  // `useSearchParams` obliga a un límite de Suspense en el App Router.
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
