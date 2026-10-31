'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { VscLock, VscMail, VscCheck } from 'react-icons/vsc';
import { TextInput } from '@/features/auth/components/TextInput';
import { RoundedButton } from '@/features/auth/components/RoundedButton';
import { PASSWORD_HINT, validateEmail, validatePassword } from '@/lib/validation/account';

const LINK = 'font-semibold text-pixela-accent underline-offset-4 hover:underline';

async function postJson(url: string, body: unknown): Promise<{ ok: boolean; message?: string }> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = (await response.json().catch(() => ({}))) as { error?: string; message?: string };
  return { ok: response.ok, message: data.error ?? data.message };
}

/** Paso 1: pedir el enlace. La respuesta es la misma exista o no la cuenta. */
export function RequestResetForm({ enabled, contactEmail }: { enabled: boolean; contactEmail: string }) {
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!enabled) {
    return (
      <div className="w-full max-w-sm mx-auto space-y-5">
        <h1 className="title-card text-5xl md:text-6xl">Recuperar contraseña</h1>
        <p className="text-white/80">
          La recuperación por correo no está activa ahora mismo. Escríbenos a{' '}
          <a href={`mailto:${contactEmail}`} className={LINK}>
            {contactEmail}
          </a>{' '}
          desde el correo de tu cuenta y te ayudamos.
        </p>
        <Link href="/login" className={LINK}>
          Volver a iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <form
      noValidate
      className="w-full max-w-sm mx-auto space-y-5"
      onSubmit={async (e) => {
        e.preventDefault();
        const email = String(new FormData(e.currentTarget).get('email') ?? '').trim();
        const invalid = validateEmail(email);
        if (invalid) {
          setError(invalid);
          return;
        }
        setLoading(true);
        setError(null);
        const result = await postJson('/api/auth/password-reset', { email });
        setLoading(false);
        if (result.ok) setSent(result.message ?? 'Revisa tu correo.');
        else setError(result.message ?? 'No se pudo enviar el enlace. Inténtalo de nuevo.');
      }}
    >
      <header className="mb-8">
        <h1 className="title-card text-5xl md:text-6xl">Recuperar contraseña</h1>
        <p className="mt-2 text-white/70">Te mandamos un enlace para crear una nueva.</p>
      </header>

      {sent ? (
        <p role="status" className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
          {sent} El enlace caduca en una hora. Mira también en la carpeta de spam.
        </p>
      ) : (
        <>
          <TextInput
            id="email"
            name="email"
            type="email"
            label="Email de tu cuenta"
            placeholder="tu@email.com"
            icon={<VscMail />}
            required
            autoFocus
            autoComplete="username"
            error={error}
          />
          <div className="pt-2">
            <RoundedButton type="submit" disabled={loading}>
              {loading ? 'Enviando…' : 'Enviar enlace'}
            </RoundedButton>
          </div>
        </>
      )}

      <p className="pt-2 text-center text-sm text-white/70">
        ¿Te has acordado?
        <Link href="/login" className={`ml-1.5 ${LINK}`}>
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}

/** Paso 2: la contraseña nueva, desde el enlace del correo. */
export function ConfirmResetForm({ token }: { token: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <form
      noValidate
      className="w-full max-w-sm mx-auto space-y-5"
      onSubmit={async (e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const password = String(data.get('password') ?? '');
        const confirmation = String(data.get('password_confirmation') ?? '');
        const invalid = validatePassword(password);
        setFieldError(invalid ?? null);
        setConfirmError(password !== confirmation ? 'Las contraseñas no coinciden.' : null);
        if (invalid || password !== confirmation) return;

        setLoading(true);
        setError(null);
        const result = await postJson('/api/auth/password-reset/confirm', { token, password });
        setLoading(false);
        if (result.ok) router.push('/login?reset=true');
        else setError(result.message ?? 'No se pudo cambiar la contraseña.');
      }}
    >
      <header className="mb-8">
        <h1 className="title-card text-5xl md:text-6xl">Contraseña nueva</h1>
        <p className="mt-2 text-white/70">Al guardarla se cierra la sesión en todos tus dispositivos.</p>
      </header>

      <TextInput
        id="password"
        name="password"
        type="password"
        label="Contraseña nueva"
        hint={PASSWORD_HINT}
        icon={<VscLock />}
        required
        autoFocus
        autoComplete="new-password"
        error={fieldError}
      />
      <TextInput
        id="password_confirmation"
        name="password_confirmation"
        type="password"
        label="Repítela"
        icon={<VscCheck />}
        required
        autoComplete="new-password"
        error={confirmError}
      />

      {error && (
        <div role="alert" className="text-sm text-red-400">
          {error}{' '}
          <Link href="/recuperar" className={LINK}>
            Pedir otro enlace
          </Link>
        </div>
      )}

      <div className="pt-2">
        <RoundedButton type="submit" disabled={loading}>
          {loading ? 'Guardando…' : 'Guardar contraseña'}
        </RoundedButton>
      </div>
    </form>
  );
}
