'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { TextInput } from '@/features/auth/components/TextInput';
import { RoundedButton } from '@/features/auth/components/RoundedButton';
import { VscAccount, VscMail, VscLock, VscCheck } from 'react-icons/vsc';

/*
 * Reglas copiadas de `registerSchema` en `/api/auth/register`: avisar aquí
 * ahorra el viaje de ida y vuelta con un 400. Si la API cambia (p. ej. para
 * admitir tildes y espacios en el nombre), hay que cambiarlas también aquí; lo
 * ideal es compartir el esquema zod entre los dos lados.
 */
const NAME_MIN = 2;
const NAME_MAX = 50;
const NAME_PATTERN = /^[a-zA-Z0-9]+([._-][a-zA-Z0-9]+)*$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 128;

type Field = 'name' | 'email' | 'password' | 'password_confirmation';
type FieldErrors = Partial<Record<Field, string>>;
type Values = Record<Field, string>;

const FIELD_ORDER: Field[] = ['name', 'email', 'password', 'password_confirmation'];

const validateField = (field: Field, values: Values): string | undefined => {
  switch (field) {
    case 'name': {
      const name = values.name.trim();
      if (!name) return 'Escribe tu nombre.';
      if (name.length < NAME_MIN) return `El nombre debe tener al menos ${NAME_MIN} caracteres.`;
      if (name.length > NAME_MAX) return `El nombre no puede pasar de ${NAME_MAX} caracteres.`;
      if (!NAME_PATTERN.test(name)) {
        return 'Por ahora solo se admiten letras sin tilde, números y . _ - entre ellos, sin espacios.';
      }
      return undefined;
    }
    case 'email': {
      const email = values.email.trim();
      if (!email) return 'Escribe tu email.';
      if (!EMAIL_PATTERN.test(email)) return 'Ese email no parece válido.';
      return undefined;
    }
    case 'password':
      if (values.password.length < MIN_PASSWORD_LENGTH) {
        return `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`;
      }
      if (values.password.length > MAX_PASSWORD_LENGTH) return 'La contraseña es demasiado larga.';
      return undefined;
    case 'password_confirmation':
      if (!values.password_confirmation) return 'Repite la contraseña.';
      if (values.password_confirmation !== values.password) return 'Las contraseñas no coinciden.';
      return undefined;
  }
};

const readValues = (form: HTMLFormElement): Values => {
  const data = new FormData(form);
  return {
    name: String(data.get('name') ?? ''),
    email: String(data.get('email') ?? ''),
    password: String(data.get('password') ?? ''),
    password_confirmation: String(data.get('password_confirmation') ?? ''),
  };
};

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  /** Valida un campo al salir de él, y vuelve a validarlo mientras se corrige. */
  const revalidate = (field: Field, form: HTMLFormElement | null, onlyIfShown: boolean) => {
    if (!form) return;
    if (onlyIfShown && !fieldErrors[field]) return;
    const values = readValues(form);
    setFieldErrors((prev) => ({ ...prev, [field]: validateField(field, values) }));
  };

  const fieldProps = (field: Field) => ({
    error: fieldErrors[field],
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
      // Un campo vacío al tabular por encima no es un error todavía.
      if (e.currentTarget.value === '' && !fieldErrors[field]) return;
      revalidate(field, e.currentTarget.form, false);
    },
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      revalidate(field, e.currentTarget.form, true),
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = e.currentTarget;
    const values = readValues(form);
    const errors: FieldErrors = {};
    for (const field of FIELD_ORDER) {
      const message = validateField(field, values);
      if (message) errors[field] = message;
    }
    setFieldErrors(errors);

    const firstInvalid = FIELD_ORDER.find((field) => errors[field]);
    if (firstInvalid) {
      form.querySelector<HTMLInputElement>(`[name="${firstInvalid}"]`)?.focus();
      return;
    }

    const name = values.name.trim();
    const email = values.email.trim();
    const { password } = values;

    setLoading(true);
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
    <form
      onSubmit={handleSubmit}
      noValidate
      className="w-full max-w-sm mx-auto space-y-5"
    >
      <header className="mb-8">
        <h1 className="text-4xl font-black tracking-tight text-white">Crear cuenta</h1>
        <p className="mt-2 text-white/70">Bienvenido a Pixela.</p>
      </header>

      {/* `noValidate`: los mensajes del navegador salen en su idioma y estilo;
          los errores se muestran bajo cada campo con `role="alert"`. */}
      <TextInput
        id="name"
        name="name"
        type="text"
        label="Nombre"
        hint="Letras sin tilde, números y . _ - (sin espacios)."
        icon={<VscAccount />}
        required
        autoFocus
        autoComplete="name"
        maxLength={NAME_MAX}
        {...fieldProps('name')}
      />

      <TextInput
        id="email"
        name="email"
        type="email"
        label="Email"
        placeholder="tu@email.com"
        icon={<VscMail />}
        required
        autoComplete="username"
        {...fieldProps('email')}
      />

      <TextInput
        id="password"
        name="password"
        type="password"
        label="Contraseña"
        hint={`Al menos ${MIN_PASSWORD_LENGTH} caracteres.`}
        icon={<VscLock />}
        required
        autoComplete="new-password"
        {...fieldProps('password')}
      />

      <TextInput
        id="password_confirmation"
        name="password_confirmation"
        type="password"
        label="Confirmar contraseña"
        icon={<VscCheck />}
        required
        autoComplete="new-password"
        {...fieldProps('password_confirmation')}
      />

      {/* Errores del servidor (email ya registrado, límite de altas…). */}
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
