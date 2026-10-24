import { FiInfo } from "react-icons/fi";
import { ContentPanelProps } from "@/features/profile/types/layout";

const STYLES = {
  container:
    "p-6 bg-pixela-dark/35 rounded-xl border border-white/10 backdrop-blur-[10px] transition duration-300 hover:bg-pixela-dark/40 hover:-translate-y-px hover:shadow-lg",
  header: "mb-6 pb-4 border-b border-white/10",
  title: "text-lg font-semibold text-white tracking-tight",
  headerAction: "text-pixela-accent",
  empty: "flex flex-col items-center justify-center py-16 text-center",
  emptyIcon: "text-5xl text-gray-400 mb-4",
  emptyMessage: "text-gray-400 text-base",
  content:
    "max-w-[60rem] mx-auto w-full grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4 p-2",
} as const;

/**
 * Componente panel de contenido con soporte para estado vacío
 * @param {ContentPanelProps} props - Props del componente
 * @returns {JSX.Element} Componente ContentPanel
 */
export const ContentPanel = ({
  title,
  children,
  isEmpty = false,
  emptyMessage = "No hay elementos disponibles.",
  headerAction,
}: ContentPanelProps) => {
  return (
    <div className={STYLES.container}>
      <div className={`${STYLES.header} flex justify-between items-center`}>
        <h2 className={STYLES.title}>{title}</h2>
        {headerAction && (
          <div className={STYLES.headerAction}>{headerAction}</div>
        )}
      </div>

      {isEmpty ? (
        <div className={STYLES.empty}>
          <FiInfo className={STYLES.emptyIcon} />
          <p className={STYLES.emptyMessage}>{emptyMessage}</p>
        </div>
      ) : (
        <div className={STYLES.content}>{children}</div>
      )}
    </div>
  );
};
