import type { Metadata } from 'next';
import { RequestResetForm } from '@/features/auth/components/PasswordResetForms';
import { isEmailEnabled } from '@/lib/email';
import { CONTACT_EMAIL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Recuperar contraseña · Pixela',
  robots: { index: false, follow: false },
};

// Depende de las variables de entorno del servidor en ejecución, no del build.
export const dynamic = 'force-dynamic';

export default function RecuperarPage() {
  return <RequestResetForm enabled={isEmailEnabled()} contactEmail={CONTACT_EMAIL} />;
}
