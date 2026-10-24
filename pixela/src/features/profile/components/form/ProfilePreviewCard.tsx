import Image from "next/image";
import { FiCamera, FiImage } from "react-icons/fi";
import { useRef } from "react";

interface ProfilePreviewCardProps {
  name: string;
  photoUrl: string | undefined;
  coverUrl: string | undefined;
  onBannerClick: () => void;
  onAvatarClick: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  imageError: string | null;
}

const STYLES = {
  // Columna de visuales (Mini Hero)
  avatarColumn: "flex flex-col gap-4 w-full lg:w-[400px] flex-shrink-0",
  previewCard:
    "relative w-full h-[280px] rounded-2xl overflow-hidden bg-pixela-surface group border border-white/5 shadow-2xl",

  // Banner Area
  bannerArea: "h-[160px] w-full relative cursor-pointer group/banner",
  bannerImage:
    "w-full h-full object-cover transition-transform duration-700 group-hover/banner:scale-105",
  bannerOverlay:
    "absolute inset-0 bg-black/20 transition duration-300 flex items-center justify-center backdrop-blur-[1px]",
  coverButton:
    "px-4 py-2 bg-black/60 text-white rounded-full text-sm font-medium border border-white/20 flex items-center gap-2 hover:bg-pixela-accent hover:border-pixela-accent transition shadow-lg",

  // Avatar Area (Overlapping)
  avatarArea: "absolute left-6 bottom-6 cursor-pointer group/avatar",
  avatarWrapper:
    "relative w-32 h-32 rounded-full border-4 border-pixela-surface overflow-hidden bg-pixela-raised shadow-xl",
  avatarImage: "w-full h-full object-cover",
  avatarOverlay:
    "absolute inset-0 bg-black/30 transition duration-300 flex items-center justify-center backdrop-blur-[1px]",
  cameraIcon: "text-white w-6 h-6",

  // Inputs ocultos
  fileInput: "hidden",
  error:
    "text-red-400 text-xs mt-2 text-center bg-red-500/10 py-2 px-3 rounded-lg border border-red-500/20",
} as const;

export const ProfilePreviewCard = ({
  name,
  photoUrl,
  coverUrl,
  onBannerClick,
  onAvatarClick,
  onFileChange,
  imageError,
}: ProfilePreviewCardProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClickInternal = () => {
    onAvatarClick();
    fileInputRef.current?.click();
  };

  return (
    <div className={STYLES.avatarColumn}>
      <div className={STYLES.previewCard}>
        {/* Banner Edit Area */}
        <div className={STYLES.bannerArea} onClick={onBannerClick}>
          <Image
            src={
              coverUrl ||
              "https://images.unsplash.com/photo-1574267432553-4b4628081c31?q=80&w=2831&auto=format&fit=crop"
            }
            alt="Banner de portada"
            fill
            className={STYLES.bannerImage}
          />
          <div className={STYLES.bannerOverlay}>
            <span className={STYLES.coverButton}>
              <FiImage className="w-4 h-4" />
              Cambiar Portada
            </span>
          </div>
        </div>

        {/* Avatar Edit Area */}
        <div className={STYLES.avatarArea} onClick={handleAvatarClickInternal}>
          <div className={STYLES.avatarWrapper}>
            {photoUrl ? (
              <Image
                src={photoUrl}
                alt="Avatar"
                fill
                className={STYLES.avatarImage}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600 text-white text-3xl font-bold">
                {name?.charAt(0).toUpperCase() || "?"}
              </div>
            )}
            <div className={STYLES.avatarOverlay}>
              <FiCamera className={STYLES.cameraIcon} />
            </div>
          </div>
        </div>
      </div>

      {/* Hidden inputs & Validations */}
      <input
        type="file"
        accept="image/*"
        className={STYLES.fileInput}
        ref={fileInputRef}
        onChange={onFileChange}
      />
      {imageError && <p className={STYLES.error}>{imageError}</p>}

      <p className="text-xs text-gray-400 text-center px-4 font-outfit">
        Haz clic en la portada o en tu avatar para actualizarlos.
      </p>
    </div>
  );
};
