'use client';

import { useId, useState } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { FiDownload, FiLogOut, FiTrash2 } from 'react-icons/fi';
import { usersAPI } from '@/api/users/users';
import { parseApiErrorMessage } from '@/api/shared/apiHelpers';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { toast } from '@/lib/toast';
import { logger } from '@/lib/logger';
import { clearOfflineData } from '@/lib/offline';

const STYLES = {
  container: 'mt-8 p-6 lg:p-8 bg-pixela-surface rounded-2xl',
  title: 'font-display text-3xl md:text-4xl tracking-[-0.02em] text-white',
  intro: 'mt-3 max-w-[60ch] text-base leading-relaxed text-gray-400',
  list: 'mt-8 flex flex-col divide-y divide-white/10',
  row: 'flex flex-col gap-4 py-5 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between',
  rowText: 'max-w-[52ch]',
  rowTitle: 'text-base font-semibold text-white',
  rowBody: 'mt-1 text-sm leading-relaxed text-gray-400',
  button: 'btn btn-ghost btn-sm shrink-0',
  dangerButton: 'btn btn-sm shrink-0 border border-red-500/40 text-red-400 hover:border-red-500/70 hover:bg-red-500/10',
  link: 'text-white underline underline-offset-4',
  passwordLabel: 'mt-4 block text-sm font-medium text-white/80',
  passwordInput:
    'mt-1.5 h-11 w-full rounded-full border border-white/10 bg-pixela-dark px-5 text-base text-white focus:border-pixela-accent/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-pixela-accent/30',
  passwordError: 'mt-1.5 text-sm text-red-400',
} as const;

interface AccountDataPanelProps {
  userId: number;
}

/**
 * Lo que la política de privacidad promete que se puede hacer desde el perfil:
 * descargar tus datos, cerrar la sesión en todos los dispositivos y eliminar la
 * cuenta. Antes no existía ninguno de los tres, aunque el servidor ya admitía
 * el autoborrado.
 */
export const AccountDataPanel = ({ userId }: AccountDataPanelProps) => {
  const [dialog, setDialog] = useState<'sessions' | 'delete' | null>(null);
  const [busy, setBusy] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const passwordId = useId();

  const closeDialog = () => {
    setDialog(null);
    setPassword('');
    setPasswordError(null);
  };

  const revokeSessions = async () => {
    setBusy(true);
    try {
      await usersAPI.revokeSessions();
      // El token de este navegador también queda invalidado: se cierra aquí
      // para no dejar una interfaz de usuario con una sesión que ya no vale.
      clearOfflineData();
      await signOut({ callbackUrl: '/login' });
    } catch (error) {
      logger.error('Error revoking sessions', error);
      toast.error(parseApiErrorMessage(error, 'No se pudieron cerrar las sesiones. Inténtalo de nuevo.'));
      setBusy(false);
      setDialog(null);
    }
  };

  const deleteAccount = async () => {
    if (!password) {
      setPasswordError('Escribe tu contraseña para confirmar.');
      return;
    }
    setBusy(true);
    setPasswordError(null);
    try {
      await usersAPI.delete(userId, password);
      clearOfflineData();
      await signOut({ callbackUrl: '/' });
    } catch (error) {
      logger.error('Error deleting account', error);
      setPasswordError(parseApiErrorMessage(error, 'No se pudo eliminar la cuenta. Inténtalo de nuevo.'));
      setBusy(false);
    }
  };

  return (
    <section className={STYLES.container} aria-labelledby="account-data-title">
      <h2 id="account-data-title" className={STYLES.title}>
        Tus datos y tu cuenta
      </h2>
      <p className={STYLES.intro}>
        Lo que guardamos de ti y cómo lo usamos está en la{' '}
        <Link href="/privacidad" prefetch={false} className={STYLES.link}>
          política de privacidad
        </Link>
        . Tus reseñas son públicas salvo las que marques como «Solo para mí»; tus favoritos, tu
        biblioteca y tu email, no.
      </p>

      <div className={STYLES.list}>
        <div className={STYLES.row}>
          <div className={STYLES.rowText}>
            <p className={STYLES.rowTitle}>Descargar mis datos</p>
            <p className={STYLES.rowBody}>
              Un fichero JSON con tu cuenta, tus favoritos, tu biblioteca y tus reseñas.
            </p>
          </div>
          {/* Enlace normal con `download`: la respuesta ya trae
              `Content-Disposition`, así que no hace falta JavaScript. */}
          <a href={usersAPI.exportUrl} download className={STYLES.button}>
            <FiDownload aria-hidden="true" />
            Descargar
          </a>
        </div>

        <div className={STYLES.row}>
          <div className={STYLES.rowText}>
            <p className={STYLES.rowTitle}>Cerrar sesión en todos los dispositivos</p>
            <p className={STYLES.rowBody}>
              Útil si has entrado en un ordenador ajeno o crees que alguien conoce tu contraseña.
            </p>
          </div>
          <button type="button" className={STYLES.button} onClick={() => setDialog('sessions')}>
            <FiLogOut aria-hidden="true" />
            Cerrar todas
          </button>
        </div>

        <div className={STYLES.row}>
          <div className={STYLES.rowText}>
            <p className={STYLES.rowTitle}>Eliminar mi cuenta</p>
            <p className={STYLES.rowBody}>
              Se borran al momento tu cuenta, tus favoritos, tu biblioteca y tus reseñas. No se
              puede deshacer.
            </p>
          </div>
          <button type="button" className={STYLES.dangerButton} onClick={() => setDialog('delete')}>
            <FiTrash2 aria-hidden="true" />
            Eliminar cuenta
          </button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={dialog === 'sessions'}
        title="¿Cerrar la sesión en todos los dispositivos?"
        description="También en este. Tendrás que volver a iniciar sesión en cada uno."
        confirmLabel="Cerrar todas"
        busy={busy}
        onConfirm={revokeSessions}
        onCancel={closeDialog}
      />

      <ConfirmDialog
        isOpen={dialog === 'delete'}
        title="¿Eliminar tu cuenta?"
        description={
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void deleteAccount();
            }}
          >
            <p>
              Se borrarán tu cuenta y todo lo que has guardado y escrito en Pixela. Si quieres
              conservar una copia, descarga antes tus datos.
            </p>
            <label htmlFor={passwordId} className={STYLES.passwordLabel}>
              Tu contraseña
            </label>
            <input
              id={passwordId}
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={passwordError ? true : undefined}
              aria-describedby={passwordError ? `${passwordId}-error` : undefined}
              disabled={busy}
              className={STYLES.passwordInput}
            />
            {passwordError && (
              <p id={`${passwordId}-error`} role="alert" className={STYLES.passwordError}>
                {passwordError}
              </p>
            )}
          </form>
        }
        confirmLabel={busy ? 'Eliminando…' : 'Eliminar para siempre'}
        busy={busy}
        onConfirm={deleteAccount}
        onCancel={closeDialog}
      />
    </section>
  );
};
