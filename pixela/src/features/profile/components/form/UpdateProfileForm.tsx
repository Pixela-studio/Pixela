import { FiUser, FiMail, FiX } from "react-icons/fi";
import { IoKeyOutline } from "react-icons/io5";
import { useForm } from "react-hook-form";
import { useState } from "react";
import clsx from "clsx";

import {
  ProfileFormData,
  UpdateProfileFormProps,
} from "@/features/profile/types/profileTypes";
import { InputField } from "@/features/profile/components/form/InputField";
import { BannerSelectorModal } from "../layout/BannerSelectorModal";
import { resizeImage } from "@/lib/image";
import { ProfilePreviewCard } from "./ProfilePreviewCard";
import {
  NAME_HINT,
  PASSWORD_HINT,
  validateEmail,
  validateName,
  validatePassword,
} from "@/lib/validation/account";

/**
 * Estilos constantes para el componente UpdateProfileForm
 */
const STYLES = {
  container: "flex flex-col lg:flex-row gap-8 lg:gap-12 w-full",

  // Columna del formulario
  formColumn: "flex-1 min-w-0 bg-black/20 rounded-2xl p-6 shadow-md",
  header:
    "flex justify-between items-center mb-6 pb-3 border-b border-pixela-accent/50",
  title: "text-lg font-bold text-white m-0",
  closeButton:
    "bg-transparent border-none text-gray-400 text-lg cursor-pointer transition-colors duration-200 hover:text-pixela-accent",
  fields: "flex flex-col gap-5",
  fieldGroup: "flex flex-col gap-1",
  inputLabel: "block text-sm text-gray-400 mb-0.5",
  inputIcon: "text-base",

  // Acciones
  actions: "flex gap-3 mt-6 pt-6 border-t border-white/10",
  button: (variant: "submit" | "cancel") =>
    clsx("btn flex-1", variant === "submit" ? "btn-primary" : "btn-ghost"),
} as const;

/**
 * Componente de formulario para actualizar el perfil de usuario
 * @param {UpdateProfileFormProps} props - Props del componente
 * @returns {JSX.Element} Componente UpdateProfileForm
 */
export const UpdateProfileForm = ({
  initialData,
  onCancel,
  onSubmit,
}: UpdateProfileFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ProfileFormData>({
    defaultValues: {
      name: initialData.name,
      email: initialData.email,
      photo_url: initialData.photo_url,
      password: "",
      password_confirmation: "",
    },
  });

  const password = watch("password");
  const email = watch("email");
  const emailChanged =
    (email ?? "").trim().toLowerCase() !== (initialData.email ?? "").trim().toLowerCase();
  const needsCurrentPassword = Boolean(password?.trim()) || emailChanged;
  const [profileImage, setProfileImage] = useState<string | undefined>(
    initialData.photo_url,
  );
  const [imageError, setImageError] = useState<string | null>(null);
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [bannerImage, setBannerImage] = useState<string | undefined>(
    initialData.cover_url,
  );

  const handleBannerSelect = (url: string) => {
    setBannerImage(url);
    setShowBannerModal(false);
  };

  /**
   * Maneja el cambio de archivo de imagen
   * @param {React.ChangeEvent<HTMLInputElement>} e - Evento de cambio
   */
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setImageError("El archivo debe ser una imagen válida");
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        setImageError("La imagen no debe superar los 2MB");
        return;
      }

      setImageError(null);
      try {
        const resizedImage = await resizeImage(file, 300);
        setProfileImage(resizedImage);
      } catch (error) {
        console.error("Error resizing image:", error);
        setImageError("Error al procesar la imagen");
      }
    }
  };

  /**
   * Maneja el envío del formulario
   * @param {ProfileFormData} data - Datos del formulario
   */
  const onFormSubmit = (data: ProfileFormData) => {
    // Construir el objeto con los campos del formulario
    const formData: Partial<ProfileFormData> = {
      name: data.name,
      email: data.email,
      photo_url: profileImage || initialData.photo_url,
      cover_url: bannerImage || initialData.cover_url,
    };

    // Solo añadir password si el usuario la ha escrito
    if (data.password && data.password.trim()) formData.password = data.password;
    if (needsCurrentPassword) formData.current_password = data.current_password;

    onSubmit(formData as ProfileFormData);
  };

  return (
    <div className={STYLES.container}>
      {/* Columna de visuales (Mini Hero) */}
      <ProfilePreviewCard
        name={initialData.name || ""}
        photoUrl={profileImage}
        coverUrl={bannerImage}
        onBannerClick={() => setShowBannerModal(true)}
        onAvatarClick={() => {}} // Avatar click handled internally by ref inside PreviewCard
        onFileChange={handleFileChange}
        imageError={imageError}
      />

      {/* Columna del formulario */}
      <div className={STYLES.formColumn}>
        <div className={STYLES.header}>
          <h2 className={STYLES.title}>Editar Perfil</h2>
          <button
            type="button"
            onClick={onCancel}
            className={STYLES.closeButton}
            aria-label="Cerrar"
          >
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className={STYLES.fields}>
          <div className={STYLES.fieldGroup}>
            <InputField
              type="text"
              name="name"
              labelText="Nombre"
              placeholder="Tu nombre"
              register={register("name", {
                validate: (value) => validateName(value) ?? true,
              })}
              icon={<FiUser className={STYLES.inputIcon} />}
              helperText={NAME_HINT}
              error={errors.name}
            />
          </div>

          <div className={STYLES.fieldGroup}>
            <InputField
              type="email"
              name="email"
              labelText="Email"
              placeholder="tu@email.com"
              register={register("email", {
                validate: (value) => validateEmail(value) ?? true,
              })}
              icon={<FiMail className={STYLES.inputIcon} />}
              error={errors.email}
            />
          </div>

          <div className={STYLES.fieldGroup}>
            <InputField
              type="password"
              name="password"
              placeholder="Nueva contraseña"
              register={register("password", {
                // Las mismas reglas que al registrarse: antes aquí se exigían
                // mayúscula, número y uno de siete símbolos concretos.
                validate: (value) => (value ? validatePassword(value) ?? true : true),
              })}
              icon={<IoKeyOutline className={STYLES.inputIcon} />}
              helperText={`Déjala vacía para no cambiarla. ${PASSWORD_HINT}`}
              error={errors.password}
            />
          </div>

          {/* Aparece al cambiar la contraseña o el email: la API exige
              demostrar que se conoce la actual antes de tocar cualquiera de
              los dos, que son los que dan acceso a la cuenta. */}
          {needsCurrentPassword && (
            <div className={STYLES.fieldGroup}>
              <InputField
                type="password"
                name="current_password"
                placeholder="Contraseña actual"
                register={register("current_password", {
                  validate: (value) => {
                    if (needsCurrentPassword && !value?.trim()) {
                      return "Introduce tu contraseña actual para confirmar el cambio";
                    }
                    return true;
                  },
                })}
                icon={<IoKeyOutline className={STYLES.inputIcon} />}
                helperText="Necesaria para confirmar que eres tú."
                error={errors.current_password}
              />
            </div>
          )}

          <div className={STYLES.fieldGroup}>
            <InputField
              type="password"
              name="password_confirmation"
              placeholder="Confirmar nueva contraseña"
              register={register("password_confirmation", {
                validate: (value) => {
                  if (
                    password &&
                    password.trim() &&
                    (!value || !value.trim())
                  ) {
                    return "Debes confirmar la contraseña";
                  }
                  if (value && value !== password) {
                    return "Las contraseñas no coinciden";
                  }
                  return true;
                },
              })}
              icon={<IoKeyOutline className={STYLES.inputIcon} />}
              error={errors.password_confirmation}
              helperText="Confirma tu nueva contraseña si la has cambiado."
            />
          </div>

          <div className={STYLES.actions}>
            <button type="submit" className={STYLES.button("submit")}>
              Guardar Cambios
            </button>
            <button
              type="button"
              onClick={onCancel}
              className={STYLES.button("cancel")}
            >
              Descartar
            </button>
          </div>
        </form>
      </div>

      <BannerSelectorModal
        isOpen={showBannerModal}
        onClose={() => setShowBannerModal(false)}
        onSelect={handleBannerSelect}
        currentBanner={bannerImage}
      />
    </div>
  );
};
