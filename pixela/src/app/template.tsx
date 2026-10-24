/**
 * Se vuelve a montar en cada navegación (a diferencia de `layout.tsx`), así
 * que cada vista entra con un fundido desde negro: el corte de una película a
 * la siguiente. Con `prefers-reduced-motion` el fundido dura 0 ms.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-fade">{children}</div>;
}
