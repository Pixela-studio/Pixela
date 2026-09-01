import { useCallback } from "react";
import { FiX, FiCheck, FiImage } from "react-icons/fi";
import Image from "next/image";
import clsx from "clsx";
import { fetchFromAPI } from "@/api/shared/apiHelpers";
import { useAsyncResource } from "@/hooks/useAsyncResource";

interface BannerSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  currentBanner?: string;
}

interface BannersResponse {
  success: boolean;
  banners: string[];
}

const EMPTY_BANNERS: string[] = [];

export const BannerSelectorModal = ({
  isOpen,
  onClose,
  onSelect,
  currentBanner,
}: BannerSelectorModalProps) => {
  // Solo se piden los banners cuando el modal está abierto: antes el efecto
  // dependía de `banners.length`, así que si la respuesta llegaba vacía volvía
  // a lanzar la petición en cada render.
  const fetchBanners = useCallback(async () => {
    const data = await fetchFromAPI<BannersResponse>("/api/banners");
    return data.success ? data.banners : EMPTY_BANNERS;
  }, []);

  const {
    data: banners,
    loading,
    error,
  } = useAsyncResource(fetchBanners, EMPTY_BANNERS, {
    enabled: isOpen,
    errorMessage: "Error cargando imágenes",
    label: "banners",
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-4xl bg-[#1A1A1A] border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[80vh] animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white font-outfit flex items-center gap-2">
            <FiImage className="text-pixela-accent" />
            Cambiar Portada
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-video bg-white/5 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-10">
              <p>{error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {banners.map((url, index) => (
                <button
                  key={index}
                  onClick={() => onSelect(url)}
                  className={clsx(
                    "group relative aspect-video rounded-xl overflow-hidden border-2 transition-all duration-300",
                    currentBanner === url
                      ? "border-pixela-accent shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                      : "border-transparent hover:border-white/20",
                  )}
                >
                  <Image
                    src={url}
                    alt={`Banner option ${index + 1}`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div
                    className={clsx(
                      "absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity duration-300",
                      currentBanner === url
                        ? "opacity-100"
                        : "opacity-0 group-hover:opacity-100",
                    )}
                  >
                    {currentBanner === url ? (
                      <div className="bg-pixela-accent text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <FiCheck />
                        Actual
                      </div>
                    ) : (
                      <span className="text-white font-medium">
                        Seleccionar
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
