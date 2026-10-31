import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ConfirmResetForm } from '@/features/auth/components/PasswordResetForms';
import { isWellFormedResetToken } from '@/lib/passwordReset';

export const metadata: Metadata = {
  title: 'Contraseña nueva · Pixela',
  robots: { index: false, follow: false },
  // El token va en la URL: que no se filtre a otras webs en el Referer.
  referrer: 'no-referrer',
};

export default async function ConfirmResetPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!isWellFormedResetToken(token)) notFound();
  return <ConfirmResetForm token={token} />;
}
