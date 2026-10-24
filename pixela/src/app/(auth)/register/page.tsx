'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { TextInput } from '@/features/auth/components/TextInput';
import { RoundedButton } from '@/features/auth/components/RoundedButton';
import { VscAccount, VscMail, VscLock, VscCheck } from 'react-icons/vsc';

/** Debe coincidir con `registerSchema` en `/api/auth/register`. */
const MIN_PASSWORD_LENGTH = 8;

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('password_confirmation') as string;

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      setLoading(false);
      return;
    }

    // Mismo mínimo que exige la API: mejor avisar aquí que tras el viaje de ida
    // y vuelta con un 400.
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`);
      setLoading(false);
      return;
    }

    try {
      // 1. Registrar usuario
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error en el registro');
      }

      // 2. Login automático tras registro
      const loginRes = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (loginRes?.error) {
        // Si falla el login automático pero se creó, redirigir a login
        router.push('/login?registered=true');
      } else {
        router.push('/');
        router.refresh();
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm mx-auto space-y-5">
      <header className="mb-8">
        <h1 className="text-4xl font-black tracking-tight text-white">Crear cuenta</h1>
        <p className="mt-2 text-white/70">Bienvenido a Pixela.</p>
      </header>

      {/* Name */}
      <div>
        <TextInput 
          id="name" 
          name="name"
          type="text"
          placeholder="Nombre de usuario"
          icon={<VscAccount />}
          required 
          autoFocus 
          autoComplete="name"
        />
      </div>

      {/* Email */}
      <div>
        <TextInput 
          id="email" 
          name="email"
          type="email"
          placeholder="Email"
          icon={<VscMail />}
          required 
          autoComplete="username"
        />
      </div>

      {/* Password */}
      <div>
        <TextInput 
          id="password"
          name="password"
          type="password"
          placeholder="Contraseña"
          icon={<VscLock />}
          required 
          autoComplete="new-password"
        />
      </div>

      {/* Confirm Password */}
      <div>
        <TextInput 
          id="password_confirmation"
          name="password_confirmation"
          type="password"
          placeholder="Confirmar contraseña"
          icon={<VscCheck />} // checkmark
          required 
          autoComplete="new-password"
        />
      </div>

      {/* Mensaje de error */}
      {error && (
        <div role="alert" className="text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="pt-2">
        <RoundedButton type="submit" disabled={loading}>
          {loading ? 'Creando cuenta…' : 'Crear cuenta'}
        </RoundedButton>
      </div>

      <p className="pt-2 text-center text-sm text-white/70">
        ¿Ya tienes cuenta?
        <Link
          href="/login"
          className="ml-1.5 font-semibold text-pixela-accent underline-offset-4 transition-colors duration-200 hover:underline"
        >
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}
