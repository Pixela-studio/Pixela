'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { TextInput } from '@/features/auth/components/TextInput';
import { RoundedButton } from '@/features/auth/components/RoundedButton';
import { VscAccount, VscMail, VscLock, VscCheck } from 'react-icons/vsc';
import { loginHref, safeCallbackUrl } from '@/lib/authRedirect';
import {
  MIN_AGE,
  NAME_HINT,
  NAME_MAX,
  PASSWORD_HINT,
  validateEmail,
  validateName,
  validatePassword,
} from '@/lib/validation/account';

type Field = 'name' | 'email' | 'password' | 'password_confirmation' | 'accept_terms';
type FieldErrors = Partial<Record<Field, string>>;
type Values = Record<Exclude<Field, 'accept_terms'>, string> & { accept_terms: boolean };

const FIELD_ORDER: Field[] = ['name', 'email', 'password', 'password_confirmation', 'accept_terms'];

/* Las reglas son las de `@/lib/validation/account`, las mismas que aplica la API. */
const validateField = (field: Field, values: Values): string | undefined => {
  switch (field) {
    case 'name':
      return validateName(values.name);
    case 'email':
      return validateEmail(values.email);
    case 'password':
      return validatePassword(values.password);
    case 'password_confirmation':
      if (!values.password_confirmation) return 'Repite la contraseña.';
      if (values.password_confirmation !== values.password) return 'Las contraseñas no coinciden.';
      return undefined;
    case 'accept_terms':
      return values.accept_terms
        ? undefined
        : `Marca la casilla para continuar: confirma que tienes ${MIN_AGE} años o más y que aceptas las condiciones.`;
  }
};

const readValues = (form: HTMLFormElement): Values => {
  const data = new FormData(form);
  return {
    name: String(data.get('name') ?? ''),
    email: String(data.get('email') ?? ''),
    password: String(data.get('password') ?? ''),
    password_confirmation: String(data.get('password_confirmation') ?? ''),
    accept_terms: data.get('accept_terms') === 'on',
  };
};

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Viene del login, que a su vez lo recibió del botón que pidió la cuenta.
  const callbackUrl = safeCallbackUrl(searchParams.get('callbackUrl'));
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

  const fieldProps = (field: Exclude<Field, 'accept_terms'>) => ({
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

    const name = values.name.trim().replace(/\s+/g, ' ');
    const email = values.email.trim();
    const { password } = values;

    setLoading(true);
    try {
      // 1. Registrar usuario
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, accept_terms: values.accept_terms }),
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
        // La cuenta existe pero el login automático falló: al login, sin
        // perder el destino.
        const login = loginHref(callbackUrl);
        router.push(`${login}${login.includes('?') ? '&' : '?'}registered=true`);
      } else {
        router.push(callbackUrl);
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
        <h1 className="title-card text-5xl md:text-6xl">Crear cuenta</h1>
        <p className="mt-2 text-white/70">Bienvenido a Pixela.</p>
      </header>

      {/* `noValidate`: los mensajes del navegador salen en su idioma y estilo;
          los errores se muestran bajo cada campo con `role="alert"`. */}
      <TextInput
        id="name"
        name="name"
        type="text"
        label="Nombre público"
        hint={NAME_HINT}
        icon={<VscAccount />}
        required
        autoFocus
        autoComplete="nickname"
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
        hint={PASSWORD_HINT}
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

      <div>
        <label htmlFor="accept_terms" className="flex items-start gap-3 text-sm leading-relaxed text-white/80">
          <input
            id="accept_terms"
            name="accept_terms"
            type="checkbox"
            required
            aria-invalid={fieldErrors.accept_terms ? true : undefined}
            aria-describedby={fieldErrors.accept_terms ? 'accept_terms-error' : undefined}
            onChange={(e) => revalidate('accept_terms', e.currentTarget.form, true)}
            className="mt-1 h-5 w-5 shrink-0 rounded-sm border border-white/30 bg-pixela-surface accent-pixela-accent focus-visible:ring-2 focus-visible:ring-pixela-accent/40"
          />
          <span>
            Tengo {MIN_AGE} años o más y acepto las{' '}
            <Link href="/aviso-legal" target="_blank" className="text-white underline underline-offset-4">
              condiciones de uso
            </Link>{' '}
            y la{' '}
            <Link href="/privacidad" target="_blank" className="text-white underline underline-offset-4">
              política de privacidad
            </Link>
            . Mis reseñas serán públicas con mi nombre.
          </span>
        </label>
        {fieldErrors.accept_terms && (
          <p id="accept_terms-error" role="alert" className="mt-1.5 text-sm text-red-400">
            {fieldErrors.accept_terms}
          </p>
        )}
      </div>

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
          href={loginHref(callbackUrl)}
          className="ml-1.5 font-semibold text-pixela-accent underline-offset-4 transition-colors duration-200 hover:underline"
        >
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}

export default function RegisterPage() {
  // `useSearchParams` obliga a un límite de Suspense en el App Router.
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}
