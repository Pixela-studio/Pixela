'use client';

import { Suspense, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { TextInput } from '@/features/auth/components/TextInput';
import { RoundedButton } from '@/features/auth/components/RoundedButton';
import { VscMail, VscLock } from 'react-icons/vsc';
import { registerHref, safeCallbackUrl } from '@/lib/authRedirect';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // `proxy.ts` y los botones que piden cuenta mandan aquí con la ruta de origen.
  const callbackUrl = safeCallbackUrl(searchParams.get('callbackUrl'));
  const justRegistered = searchParams.get('registered') === 'true';
  const justReset = searchParams.get('reset') === 'true';

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
        setError(
          res.code === 'rate_limited'
            ? 'Demasiados intentos seguidos. Espera unos minutos antes de volver a probar.'
            : 'Estas credenciales no coinciden con nuestros registros.',
        );
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
        <h1 className="title-card text-5xl md:text-6xl">Iniciar sesión</h1>
        <p className="mt-2 text-white/70">Bienvenido a Pixela.</p>
      </header>

      {justReset && (
        <p
          role="status"
          className="text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2"
        >
          Contraseña cambiada. Entra con la nueva.
        </p>
      )}

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
        <Link
          href="/recuperar"
          className="text-white/70 underline-offset-4 transition-colors duration-200 hover:text-white hover:underline"
        >
          ¿Has olvidado tu contraseña?
        </Link>
        <div className="text-white/70">
          ¿No tienes cuenta?
          <Link
            href={registerHref(callbackUrl)}
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
