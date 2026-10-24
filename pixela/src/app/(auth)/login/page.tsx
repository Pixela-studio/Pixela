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
    <form onSubmit={handleSubmit} className="w-full max-w-sm mx-auto space-y-5">
      <header className="mb-8">
        <h1 className="text-4xl font-black tracking-tight text-white">Iniciar sesión</h1>
        <p className="mt-2 text-white/70">Bienvenido a Pixela.</p>
      </header>

      {justRegistered && (
        <p
          role="status"
          className="text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2"
        >
          Cuenta creada. Inicia sesión para continuar.
        </p>
      )}

      <div>
        <TextInput
          id="email"
          name="email"
          type="email"
          label="Email"
          placeholder="tu@email.com"
          icon={<VscMail />}
          required
          autoFocus
          autoComplete="username"
        />
      </div>

      <div>
        <TextInput
          id="password"
          name="password"
          type="password"
          label="Contraseña"
          icon={<VscLock />}
          required
          autoComplete="current-password"
        />
      </div>

      {/* `role="alert"` para que un lector de pantalla anuncie el fallo. */}
      {error && (
        <div role="alert" className="text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="pt-2">
        <RoundedButton type="submit" disabled={loading}>
          {loading ? 'Entrando…' : 'Entrar'}
        </RoundedButton>
      </div>

      <div className="flex flex-col items-center gap-3 pt-2 text-sm">
        {/* "¿Olvidaste tu contraseña?" se quitó: no hay recuperación por email y
            un texto deshabilitado que parece enlace no ayuda a nadie (además
            explicaba el motivo solo en `title`). Volverá con la ruta real. */}
        <div className="text-white/70">
          ¿No tienes cuenta?
          <Link
            href="/register"
            className="ml-1.5 font-semibold text-pixela-accent underline-offset-4 transition-colors duration-200 hover:underline"
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
