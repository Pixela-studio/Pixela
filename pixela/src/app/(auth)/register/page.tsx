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
    <form onSubmit={handleSubmit} className="py-4 space-y-6 w-full max-w-xs mx-auto px-4">
      {/* Title */}
      <h2 className="text-[24px] font-['Outfit'] text-white font-bold mb-8">
        Bienvenido a Pixela | <span className="text-gray-500">Registrarse</span>
      </h2>

      {/* Name */}
      <div className="relative mb-5">
        <TextInput 
          id="name" 
          name="name"
          type="text"
          placeholder="Username"
          icon={<VscAccount />}
          required 
          autoFocus 
          autoComplete="name"
        />
      </div>

      {/* Email */}
      <div className="relative mb-5">
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
      <div className="relative mb-5">
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
      <div className="relative mb-5">
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
        <div className="text-[#ec1b69] text-[14px] font-['Outfit']">
          {error}
        </div>
      )}

      {/* Botones */}
      <div className="flex items-center gap-10 mt-8">
        <div className="w-1/2">
            <RoundedButton type="submit" disabled={loading}>
              {loading ? '...' : 'Registrar'}
            </RoundedButton>
        </div>
        
        <Link 
            href="/login"
            className="text-[14px] font-['Outfit'] text-[#ec1b69] hover:text-[#ec1b69]/80 transition-colors duration-300"
        >
            ¿Ya tienes cuenta?
        </Link>
      </div>
    </form>
  );
}
